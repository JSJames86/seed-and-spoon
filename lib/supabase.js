import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://clsepfwqnphjjmnosqff.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc2VwZndxbnBoamptbm9zcWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MTE3NzYsImV4cCI6MjA4Mjk4Nzc3Nn0.uc3bbBw_moprc2FXO-eo0wIuGO7xJqF4MNm2vKmc4SQ';

// Only warn in browser context (not during build)
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn('Supabase credentials not found. OAuth features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
