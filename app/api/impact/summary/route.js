import { NextResponse } from 'next/server';

/*
 * To enable live data, create these tables in Supabase:
 * See scripts/create-impact-tables.sql
 */

const STATIC = {
  mealsDelivered: 1247,
  youthServed: 89,
  activeVolunteers: 14,
  citiesCovered: 3,
  donationsReceived: 8430,
  costPerMeal: 2.85,
  repeatRecipients: 62,
  lastUpdated: '2026-05-01T00:00:00Z',
  dataSource: 'static',
};

export const revalidate = 300;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes('placeholder') || url.includes('your_supabase')) {
    return NextResponse.json(STATIC);
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    const [meals, vols, donations] = await Promise.all([
      supabase.from('impact_meals').select('quantity').eq('is_deleted', false),
      supabase.from('impact_volunteers').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('impact_donations').select('amount'),
    ]);

    if (meals.error?.code === '42P01') {
      return NextResponse.json({ ...STATIC, dataSource: 'static' });
    }
    if (meals.error) throw meals.error;

    const mealsDelivered = (meals.data || []).reduce((s, r) => s + (r.quantity || 0), 0);
    const activeVolunteers = vols.count ?? 0;
    const donationsReceived = Math.round(
      (donations.data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0)
    );

    return NextResponse.json({
      mealsDelivered: mealsDelivered || STATIC.mealsDelivered,
      youthServed: STATIC.youthServed,
      activeVolunteers: activeVolunteers || STATIC.activeVolunteers,
      citiesCovered: STATIC.citiesCovered,
      donationsReceived: donationsReceived || STATIC.donationsReceived,
      costPerMeal:
        mealsDelivered > 0
          ? Math.round((donationsReceived / mealsDelivered) * 100) / 100
          : STATIC.costPerMeal,
      repeatRecipients: STATIC.repeatRecipients,
      lastUpdated: new Date().toISOString(),
      dataSource: 'live',
    });
  } catch {
    return NextResponse.json(STATIC);
  }
}
