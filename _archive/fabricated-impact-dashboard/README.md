Moved out of `app/impact/` on 2026-07-09. This page rendered fabricated "actual" impact
numbers (meals delivered, donations raised, activity feed) that were never real — the
Five Loaves pilot hadn't launched yet. It's kept here, not routed, in case it's wanted
later once there's real data to show. `/impact` now serves the Impact Engine projections
tool instead (see `app/impact/page.tsx`).
