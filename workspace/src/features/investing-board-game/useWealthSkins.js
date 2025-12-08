import { useEffect, useState, useCallback } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { WEALTH_SKINS, WEALTH_SKIN_STORAGE_KEY, defaultWealthSkinState } from './skins.js';

export function useWealthSkins() {
  const [state, setState] = useState(defaultWealthSkinState);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WEALTH_SKIN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setState((s) => ({
            ...s,
            ...parsed
          }));
        }
      }
    } catch (error) {
      console.warn('Could not load wealth skin state', error);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(WEALTH_SKIN_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Could not save wealth skin state', error);
    }
  }, [state]);

  useEffect(() => {
    let isActive = true;

    const syncFromSupabase = async () => {
      try {
        const { data: sessionData } = await supabase?.auth?.getSession?.();
        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          setIsSynced(true);
          return;
        }

        const { data, error } = await supabase.from?.('user_wealth_skins').select('skin_id');
        if (error) {
          console.warn('Failed to load wealth skins from Supabase', error);
          setIsSynced(true);
          return;
        }

        const ownedIds = Array.isArray(data) ? data.map((row) => row.skin_id).filter(Boolean) : [];
        if (isActive && ownedIds.length) {
          setState((s) => ({
            ...s,
            ownedSkinIds: Array.from(new Set([...s.ownedSkinIds, ...ownedIds]))
          }));
        }
        setIsSynced(true);
      } catch (error) {
        console.warn('Could not sync wealth skins from Supabase', error);
        setIsSynced(true);
      }
    };

    syncFromSupabase();

    return () => {
      isActive = false;
    };
  }, []);

  const persistOwnedSkin = useCallback(async (id) => {
    try {
      const { data: sessionData } = await supabase?.auth?.getSession?.();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      await supabase.from?.('user_wealth_skins').insert({ user_id: userId, skin_id: id });
    } catch (error) {
      console.warn('Could not persist owned wealth skin', error);
    }
  }, []);

  const setActiveSkin = useCallback((id) => {
    setState((s) => ({
      ...s,
      activeSkinId: id
    }));
  }, []);

  const markSkinOwned = useCallback(
    (id) => {
      setState((s) => ({
        ...s,
        ownedSkinIds: Array.from(new Set([...s.ownedSkinIds, id]))
      }));
      persistOwnedSkin(id);
    },
    [persistOwnedSkin]
  );

  const activeSkin = WEALTH_SKINS.find((skin) => skin.id === state.activeSkinId) ?? WEALTH_SKINS[0];

  return { state, setState, activeSkin, setActiveSkin, markSkinOwned, isSynced };
}
