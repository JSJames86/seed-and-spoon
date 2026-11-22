-- Security hardening (Nov 2026)
--
-- 1. Views run with the caller's permissions (security_invoker) so they can
--    never bypass Row Level Security on the tables underneath. Before this,
--    the allergen / household / volunteer views ran as their owner and were
--    readable with the public anon key.
-- 2. Logged-out (anon) and generic signed-in (authenticated) roles lose all
--    direct access to sensitive views and family/child tables. The app reads
--    and writes these only through API routes using the service role, which
--    is unaffected.
-- 3. "Anyone can insert" policies on family and assessment tables are dropped.
--    Every public form already posts to an API route (service role), so these
--    policies only offered a way around the API's validation.
-- 4. Functions get a fixed search_path.

-- 1. Views respect RLS ------------------------------------------------------
alter view public.survey_metrics               set (security_invoker = true);
alter view public.household_next_eligible_date set (security_invoker = true);
alter view public.delivery_run_schedule        set (security_invoker = true);
alter view public.confirmed_prices             set (security_invoker = true);
alter view public.kitchen_allergen_summary     set (security_invoker = true);
alter view public.severe_allergen_households   set (security_invoker = true);
alter view public.assessment_statement_results set (security_invoker = true);
alter view public.assessment_participation     set (security_invoker = true);
alter view public.volunteer_review_queue       set (security_invoker = true);
alter view public.volunteer_hours_summary      set (security_invoker = true);

-- 2. No direct client access to sensitive views/tables ----------------------
revoke all on
  public.survey_metrics,
  public.household_next_eligible_date,
  public.delivery_run_schedule,
  public.kitchen_allergen_summary,
  public.severe_allergen_households,
  public.assessment_statement_results,
  public.assessment_participation,
  public.volunteer_review_queue,
  public.volunteer_hours_summary
from anon, authenticated;

revoke all on
  public.household_enrollments,
  public.household_children,
  public.allergen_flags,
  public.family_referrals,
  public.household_zone_assignments,
  public.service_deliveries,
  public.survey_responses,
  public.assessments,
  public.assessment_invites,
  public.assessment_responses,
  public.assessment_ratings,
  public.assessment_texts,
  public.receipt_consents,
  public.receipt_submissions,
  public.receipt_uploads,
  public.receipt_line_items,
  public.receipt_unmatched_lines
from anon, authenticated;

-- 3. Drop open insert policies (API routes use the service role) -----------
drop policy if exists "Anyone can submit enrollments"       on public.household_enrollments;
drop policy if exists "Anyone can add children"             on public.household_children;
drop policy if exists "Anyone can add allergen flags"       on public.allergen_flags;
drop policy if exists "Anyone can submit survey responses"  on public.survey_responses;
drop policy if exists "Anon can submit responses"           on public.assessment_responses;
drop policy if exists "Anon can submit ratings"             on public.assessment_ratings;
drop policy if exists "Anon can submit texts"               on public.assessment_texts;
drop policy if exists "Public insert price_points"          on public.price_points;
drop policy if exists "anon_insert"                         on public.affiliates;
drop policy if exists "anon_insert"                         on public.career_applications;
drop policy if exists "anon_insert"                         on public.community_partners;
drop policy if exists "anon_insert"                         on public.research_inquiries;
drop policy if exists "service_insert"                      on public.food_drives;

-- Write-side functions are not for direct client calls.
revoke execute on function public.increment_campaign_total(uuid, bigint) from anon, authenticated, public;
revoke execute on function public.publish_scheduled_posts()              from anon, authenticated, public;

-- 4. Fixed search_path ------------------------------------------------------
alter function public.set_updated_at()                          set search_path = public, pg_temp;
alter function public.update_updated_at()                       set search_path = public, pg_temp;
alter function public.set_client_service_rules_updated_at()     set search_path = public, pg_temp;
alter function public.set_service_deliveries_updated_at()       set search_path = public, pg_temp;
alter function public.set_donation_receipt_id()                 set search_path = public, pg_temp;
alter function public.publish_scheduled_posts()                 set search_path = public, pg_temp;
alter function public.increment_campaign_total(uuid, bigint)    set search_path = public, pg_temp;
alter function public.get_recipe_cost_for_store(uuid, uuid)     set search_path = public, pg_temp;
alter function public.get_recipe_ingredient_costs(uuid, uuid)   set search_path = public, pg_temp;
