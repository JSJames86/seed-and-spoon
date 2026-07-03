import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { findOrCreateHousehold } from '@/lib/spoonassist/household';

// GET /api/spoonassist/list/history -- the signed-in user's saved shopping
// lists, newest first, for the Profile "List history" row.
// -> { lists: [{ id, createdAt, itemCount }] }

async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  });
}

export async function GET() {
  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ lists: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ lists: [] });

  try {
    const householdId = await findOrCreateHousehold(supabase, user.id);
    const { data, error } = await supabase
      .from('shopping_lists')
      .select('id, created_at, shopping_list_items(count)')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({
      lists: (data ?? []).map((row) => ({
        id: row.id,
        createdAt: row.created_at,
        itemCount: row.shopping_list_items?.[0]?.count ?? 0,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load list history' }, { status: 500 });
  }
}
