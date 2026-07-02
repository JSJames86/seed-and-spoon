// Shared by app/api/spoonassist/plan and .../list/consolidate: there's no
// dedicated household-creation endpoint anywhere in the codebase (every
// existing spoonassist route assumes a householdId already exists), so
// "save my plan"/"save my list" for a brand-new signed-up user needs a
// household to attach to. This finds the caller's oldest household or
// creates a minimal default one (size: 1) -- full household setup (name,
// budget, meal slots, dietary tags) stays a separate, optional edit.
export async function findOrCreateHousehold(supabase, userId) {
  const { data: existing, error: findErr } = await supabase
    .from('households')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing.id;

  const { data: created, error: createErr } = await supabase
    .from('households')
    .insert({ user_id: userId, size: 1 })
    .select('id')
    .single();

  if (createErr) throw createErr;
  return created.id;
}
