import { NextResponse } from 'next/server';

const STATIC_MONTHS = [
  { month: "May '25", meals: 25 },
  { month: "Jun '25", meals: 38 },
  { month: "Jul '25", meals: 55 },
  { month: "Aug '25", meals: 72 },
  { month: "Sep '25", meals: 89 },
  { month: "Oct '25", meals: 108 },
  { month: "Nov '25", meals: 134 },
  { month: "Dec '25", meals: 156 },
  { month: "Jan '26", meals: 128 },
  { month: "Feb '26", meals: 112 },
  { month: "Mar '26", meals: 167 },
  { month: "Apr '26", meals: 120 },
];

export const revalidate = 3600;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url.includes('placeholder') || url.includes('your_supabase')) {
    return NextResponse.json({ data: STATIC_MONTHS, dataSource: 'static' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key);

    const since = new Date();
    since.setMonth(since.getMonth() - 12);

    const { data, error } = await supabase
      .from('impact_meals')
      .select('date, quantity')
      .gte('date', since.toISOString().split('T')[0])
      .eq('is_deleted', false)
      .order('date');

    if (error?.code === '42P01') {
      return NextResponse.json({ data: STATIC_MONTHS, dataSource: 'static' });
    }
    if (error) throw error;

    const map = {};
    for (const { date, quantity } of data || []) {
      const d = new Date(date);
      const label = `${d.toLocaleString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`;
      map[label] = (map[label] || 0) + (quantity || 0);
    }

    const monthly = Object.entries(map).map(([month, meals]) => ({ month, meals }));

    return NextResponse.json({
      data: monthly.length ? monthly : STATIC_MONTHS,
      dataSource: monthly.length ? 'live' : 'static',
    });
  } catch {
    return NextResponse.json({ data: STATIC_MONTHS, dataSource: 'static' });
  }
}
