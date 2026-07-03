'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SavedRecipesContext = createContext(null);

// One shared saved-recipe-id set for the whole SpoonAssist shell so every
// heart icon (cards, carousels, detail hero) and the Profile "Saved
// recipes" grid stay in sync without each re-fetching independently.
// Signed-out visitors get an always-empty set -- the heart icon just routes
// to /signup instead of toggling (see SaveHeartButton).
export function SavedRecipesProvider({ children }) {
  const [recipeIds, setRecipeIds] = useState(() => new Set());
  const [recipes, setRecipes] = useState([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSignedIn(!!session);
    if (!session) {
      setRecipeIds(new Set());
      setRecipes([]);
      setLoaded(true);
      return;
    }
    try {
      const res = await fetch('/api/spoonassist/saved-recipes');
      const data = await res.json();
      setRecipeIds(new Set(data.recipeIds || []));
      setRecipes(data.recipes || []);
    } catch {
      // leave prior state
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const toggle = useCallback(async (recipeId) => {
    if (!signedIn) return false;
    const isSaved = recipeIds.has(recipeId);
    setRecipeIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(recipeId) : next.add(recipeId);
      return next;
    });
    try {
      if (isSaved) {
        await fetch(`/api/spoonassist/saved-recipes?recipeId=${encodeURIComponent(recipeId)}`, { method: 'DELETE' });
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      } else {
        await fetch('/api/spoonassist/saved-recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId }),
        });
        refresh();
      }
    } catch {
      // best-effort -- next refresh() reconciles if this failed silently
    }
    return true;
  }, [signedIn, recipeIds, refresh]);

  return (
    <SavedRecipesContext.Provider value={{ recipeIds, recipes, signedIn, loaded, toggle, refresh }}>
      {children}
    </SavedRecipesContext.Provider>
  );
}

export function useSavedRecipes() {
  const ctx = useContext(SavedRecipesContext);
  if (!ctx) throw new Error('useSavedRecipes() must be used within a SavedRecipesProvider');
  return ctx;
}
