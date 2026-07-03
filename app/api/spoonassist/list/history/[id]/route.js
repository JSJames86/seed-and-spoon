import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/spoonassist/list/history/[id] -- one saved shopping list's items,
// read-only detail for the Profile "List history" row.
// -> { list: { id, createdAt, items: [{ name, quantity, unit, isChecked }] } }
// RLS scopes this to lists the caller's household owns -- a foreign id just
// resolves to zero rows, surfaced here as 404.

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

export async function GET(_request, { params }) {
  const { id } = await params;

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.json({ error: 'SpoonAssist not configured' }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: list, error: listErr } = await supabase
    .from('shopping_lists')
    .select('id, created_at')
    .eq('id', id)
    .maybeSingle();
  if (listErr) return NextResponse.json({ error: 'Failed to load list' }, { status: 500 });
  if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });

  const { data: items, error: itemsErr } = await supabase
    .from('shopping_list_items')
    .select('id, custom_name, quantity, unit, is_checked, canonical_ingredients(name)')
    .eq('list_id', id);
  if (itemsErr) return NextResponse.json({ error: 'Failed to load list items' }, { status: 500 });

  return NextResponse.json({
    list: {
      id: list.id,
      createdAt: list.created_at,
      items: (items ?? []).map((row) => ({
        name: row.canonical_ingredients?.name ?? row.custom_name,
        quantity: row.quantity,
        unit: row.unit,
        isChecked: row.is_checked,
      })),
    },
  });
}
