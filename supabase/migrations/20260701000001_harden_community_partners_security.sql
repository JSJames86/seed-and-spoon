-- Brings community_partners in line with its sibling intake tables
-- (food_drives, affiliates, research_inquiries): trigger function needs a
-- pinned search_path, and default anon/authenticated SELECT grants must be
-- revoked so RLS is the only path to reading rows (INSERT stays granted so
-- the public form can still submit).

CREATE OR REPLACE FUNCTION public.set_community_partners_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

REVOKE SELECT ON public.community_partners FROM anon, authenticated;
