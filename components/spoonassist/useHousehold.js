'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Resolves the signed-in user's householdId + household record for Profile
// sub-pages (Pantry, Stores & ZIP) that need one. status: 'loading' |
// 'signed-out' | 'ready' | 'error'.
export function useHousehold() {
  const [status, setStatus] = useState('loading');
  const [householdId, setHouseholdId] = useState(null);
  const [household, setHousehold] = useState(null);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setStatus('signed-out');
      return;
    }
    try {
      const res = await fetch('/api/spoonassist/household');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setHouseholdId(data.householdId);
      setHousehold(data.household);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, householdId, household, setHousehold, refresh };
}
