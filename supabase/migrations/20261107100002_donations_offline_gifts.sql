-- Offline gifts (cash, check, ACH/wire, in-kind) recorded by staff, with audit logging.
--
-- Live schema this was fitted to (inspected 2026-11-07 via Supabase MCP):
--   * Every Stripe column (stripe_payment_intent_id, stripe_charge_id,
--     stripe_session_id, transaction_id) is NULLABLE.
--   * UNIQUE (stripe_payment_intent_id) is a standard (NULLS DISTINCT) constraint, and
--     stripe_session_id's unique index is partial (WHERE NOT NULL). Both allow any
--     number of NULL rows, so no Stripe constraint needs relaxing.
--   * Constraints offline rows must satisfy as-is: amount NOT NULL CHECK (amount > 0),
--     donation_type NOT NULL (enum: one_time | recurring | monthly | one-time),
--     currency NOT NULL DEFAULT 'usd'.
--   * payment_method is free text; all 12 live rows are 'stripe'.
--   * trg_audit_donations -> public.audit_trigger() is currently a no-op (it only
--     RETURNs), so nothing on donations is audited today. This migration adds a
--     dedicated audit trigger for offline gifts rather than changing that function.
--   * RLS: INSERT/UPDATE for service_role. No new policies are added; the admin
--     API calls record_offline_donation() with the service role.
--
-- Webhook compatibility: the webhook inserts payment_method = 'stripe' with Stripe
-- ids, and every new constraint is written to accept those rows unchanged.

-- 1. Columns ---------------------------------------------------------------------
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS check_number        text,
  ADD COLUMN IF NOT EXISTS in_kind_description text,
  ADD COLUMN IF NOT EXISTS entered_by          uuid
    REFERENCES public.profiles (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.donations.payment_method IS
  'stripe | cash | check | ach | wire | in_kind | other. Non-stripe values are offline gifts entered by staff.';
COMMENT ON COLUMN public.donations.amount IS
  'Dollars. For in_kind gifts: the internal fair-value estimate for bookkeeping (must be > 0). Donor receipts for in-kind gifts should describe the item, not state a value.';
COMMENT ON COLUMN public.donations.in_kind_description IS
  'Required for in_kind gifts: what was given (items, quantity, condition).';
COMMENT ON COLUMN public.donations.entered_by IS
  'Staff profile that recorded an offline gift. Required for non-stripe rows.';

-- 2. Constraints -----------------------------------------------------------------
-- Each one is validated against existing rows (all stripe, all with a payment intent id).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid = 'public.donations'::regclass
                   AND conname = 'donations_payment_method_check') THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_payment_method_check
      CHECK (payment_method IS NULL OR payment_method IN
             ('stripe', 'cash', 'check', 'ach', 'wire', 'in_kind', 'other'));
  END IF;

  -- Offline rows must not carry Stripe identifiers. This keeps the webhook's dedup
  -- lookups (by stripe_payment_intent_id / transaction_id) from ever matching one.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid = 'public.donations'::regclass
                   AND conname = 'donations_offline_no_stripe_ids') THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_offline_no_stripe_ids
      CHECK (payment_method IS NULL OR payment_method = 'stripe' OR (
               stripe_payment_intent_id IS NULL
           AND stripe_charge_id         IS NULL
           AND stripe_session_id        IS NULL));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid = 'public.donations'::regclass
                   AND conname = 'donations_offline_requires_entered_by') THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_offline_requires_entered_by
      CHECK (payment_method IS NULL OR payment_method = 'stripe' OR entered_by IS NOT NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conrelid = 'public.donations'::regclass
                   AND conname = 'donations_in_kind_requires_description') THEN
    ALTER TABLE public.donations ADD CONSTRAINT donations_in_kind_requires_description
      CHECK (payment_method IS DISTINCT FROM 'in_kind'
             OR nullif(btrim(in_kind_description), '') IS NOT NULL);
  END IF;
END $$;

-- 3. Audit trigger for offline gifts --------------------------------------------
-- Writes to public.audit_log (append-only for clients: RLS allows SELECT for
-- is_elevated() only, with no insert/update/delete policies). Actor comes from the
-- transaction-local setting app.audit_actor_id, which record_offline_donation() sets,
-- falling back to entered_by on INSERT. A change with no known actor is still logged,
-- at 'warning' severity, so direct table edits can't go unrecorded.
CREATE OR REPLACE FUNCTION public.donations_offline_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_actor    uuid;
  v_email    text;
  v_roles    text[];
  v_old      jsonb := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) END;
  v_new      jsonb := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) END;
  v_changed  text[];
  v_severity text;
BEGIN
  -- Only audit offline gifts (before or after the change).
  IF coalesce(v_old ->> 'payment_method', 'stripe') = 'stripe'
     AND coalesce(v_new ->> 'payment_method', 'stripe') = 'stripe' THEN
    RETURN NULL;
  END IF;

  v_actor := nullif(current_setting('app.audit_actor_id', true), '')::uuid;
  IF v_actor IS NULL AND TG_OP = 'INSERT' THEN
    v_actor := NEW.entered_by;
  END IF;

  IF v_actor IS NOT NULL THEN
    SELECT u.email INTO v_email FROM auth.users u WHERE u.id = v_actor;
    SELECT array_agg(r.name ORDER BY r.name) INTO v_roles
      FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
     WHERE ra.profile_id = v_actor;
    -- audit_log.actor_id references profiles(id); drop an id with no profile
    -- rather than fail the gift. The attempted id is kept in new_data.
    IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_actor) THEN
      v_new := coalesce(v_new, '{}'::jsonb) || jsonb_build_object('_audit_unknown_actor', v_actor);
      v_actor := NULL;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(k ORDER BY k) INTO v_changed
      FROM jsonb_object_keys(v_new) k
     WHERE v_new -> k IS DISTINCT FROM v_old -> k
       AND k NOT IN ('updated_at', '_audit_unknown_actor');
    IF v_changed IS NULL THEN
      RETURN NULL;  -- nothing meaningful changed
    END IF;
  END IF;

  v_severity := CASE
    WHEN v_actor IS NULL THEN 'warning'
    WHEN TG_OP = 'INSERT' THEN 'info'
    ELSE 'warning'  -- edits/deletes of recorded gifts deserve a closer look
  END;

  INSERT INTO public.audit_log
    (actor_id, actor_email, actor_roles, table_name, record_id,
     changed_columns, old_data, new_data, severity)
  VALUES
    (v_actor, v_email, coalesce(v_roles, '{}'), 'donations',
     coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid),
     v_changed, v_old, v_new, v_severity);

  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.donations_offline_audit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS donations_offline_audit_trigger ON public.donations;
CREATE TRIGGER donations_offline_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.donations_offline_audit();

-- 4. Entry point for admin-entered gifts ----------------------------------------
-- Called from a server route using the service role, after that route has
-- authenticated the staff user. The function re-checks the actor's role itself
-- (auth.uid() is NULL under the service role, so is_staff() can't be used here).
CREATE OR REPLACE FUNCTION public.record_offline_donation(
  p_actor_id            uuid,
  p_amount              numeric,
  p_payment_method      text,
  p_donated_at          timestamptz,
  p_donor_name          text,
  p_donor_email         text        DEFAULT NULL,
  p_donor_id            uuid        DEFAULT NULL,
  p_campaign_slug       text        DEFAULT NULL,
  p_check_number        text        DEFAULT NULL,
  p_in_kind_description text        DEFAULT NULL,
  p_notes               text        DEFAULT NULL,
  p_tax_deductible      boolean     DEFAULT true
)
RETURNS public.donations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_row public.donations;
BEGIN
  IF p_actor_id IS NULL OR NOT EXISTS (
    SELECT 1
      FROM public.role_assignments ra
      JOIN public.roles r ON r.id = ra.role_id
     WHERE ra.profile_id = p_actor_id
       AND r.name = ANY (ARRAY['employee', 'executive_director', 'admin'])
  ) THEN
    RAISE EXCEPTION 'Actor % is not authorized to record offline gifts', p_actor_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF p_payment_method IS NULL OR p_payment_method = 'stripe' THEN
    RAISE EXCEPTION 'Offline gifts need a non-Stripe payment_method (got %)', p_payment_method
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_donated_at IS NULL THEN
    RAISE EXCEPTION 'p_donated_at (the date the gift was received) is required'
      USING ERRCODE = 'not_null_violation';
  END IF;

  -- Transaction-local: read by donations_offline_audit() for this insert only.
  PERFORM set_config('app.audit_actor_id', p_actor_id::text, true);

  INSERT INTO public.donations (
    amount, donation_type, status, payment_method, donated_at,
    donor_name, donor_email, donor_id, campaign_slug,
    check_number, in_kind_description, notes, tax_deductible, entered_by
  ) VALUES (
    p_amount, 'one_time', 'completed', p_payment_method, p_donated_at,
    nullif(btrim(p_donor_name), ''), nullif(lower(btrim(p_donor_email)), ''), p_donor_id,
    nullif(btrim(p_campaign_slug), ''),
    nullif(btrim(p_check_number), ''), nullif(btrim(p_in_kind_description), ''),
    p_notes, coalesce(p_tax_deductible, true), p_actor_id
  )
  RETURNING * INTO v_row;

  PERFORM set_config('app.audit_actor_id', '', true);
  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_offline_donation(
  uuid, numeric, text, timestamptz, text, text, uuid, text, text, text, text, boolean
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_offline_donation(
  uuid, numeric, text, timestamptz, text, text, uuid, text, text, text, text, boolean
) TO service_role;

-- 5. Index for the admin "offline gifts" view / reconciliation -----------------
CREATE INDEX IF NOT EXISTS donations_offline_donated_at_idx
  ON public.donations (donated_at DESC)
  WHERE payment_method IS DISTINCT FROM 'stripe';
