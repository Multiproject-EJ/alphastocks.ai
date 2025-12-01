import { useCallback, useContext, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { InvestmentUniverseRow, ValueBotContext, ValueBotAnalysisContext } from './types.ts';

type SaveResult = { error?: string; metadataWarning?: string };

// Persists the full deep-dive (modules 0–6) to Supabase so the Investing Universe can read it later.
// Expected table: valuebot_deep_dives
// Columns: id (uuid, PK), created_at (timestamptz, default now()), user_id (uuid, nullable),
// ticker (text), company_name (text, nullable), currency (text, nullable), provider (text), model (text),
// timeframe (text, nullable), custom_question (text, nullable), module0_markdown (text), module1_markdown (text),
// module2_markdown (text), module3_markdown (text), module4_markdown (text), module5_markdown (text),
// module6_markdown (text), source (text, default 'valuebot_deep_dive').
// User ID is pulled from AuthContext when available; otherwise left null.
export const useSaveDeepDiveToUniverse = () => {
  const valueBot = useContext(ValueBotContext);
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validateAndBuildPayload = useCallback(
    (): { payload: Record<string, unknown> } | { error: string } => {
      const resolvedContext = valueBot?.context as ValueBotAnalysisContext | undefined;

      if (!resolvedContext) {
        return { error: 'Deep-dive context is unavailable. Please open ValueBot again.' };
      }

      const deepDiveConfig = resolvedContext.deepDiveConfig || {};
      const provider = deepDiveConfig?.provider?.trim() || 'openai';
      const rawModel = (deepDiveConfig?.model || '').trim();
      const ticker = deepDiveConfig?.ticker?.trim();
      const module6Markdown = resolvedContext?.module6Markdown?.trim();

      if (!ticker) {
        return { error: 'Ticker is required. Run Module 0 — Data Loader to set up the deep dive first.' };
      }

      if (!module6Markdown) {
        return { error: 'Final verdict is missing. Run Module 6 to generate the MASTER report before saving.' };
      }

      return {
        payload: {
          ticker,
          provider,
          model: rawModel || null,
          timeframe: deepDiveConfig?.timeframe || null,
          custom_question: deepDiveConfig?.customQuestion || null,
          company_name: resolvedContext?.companyName?.trim() || null,
          // Using market as the best available proxy for currency until a dedicated currency field exists.
          currency: resolvedContext?.market?.trim() || null,
          module0_markdown: resolvedContext?.module0OutputMarkdown || null,
          module1_markdown: resolvedContext?.module1OutputMarkdown || null,
          module2_markdown: resolvedContext?.module2Markdown || null,
          module3_markdown: resolvedContext?.module3Markdown || null,
          module4_markdown: resolvedContext?.module4Markdown || null,
          module5_markdown: resolvedContext?.module5Markdown || null,
          module6_markdown: module6Markdown,
          source: 'valuebot_deep_dive',
          user_id: user?.id || null
        }
      };
    },
    [user?.id, valueBot]
  );

  const saveDeepDive = useCallback(async (): Promise<SaveResult> => {
    setIsSaving(true);
    setSaveError(null);
    setSaveWarning(null);
    setSaveSuccess(false);

    const validation = validateAndBuildPayload();
    if ('error' in validation) {
      const message = validation.error;
      setSaveError(message);
      setIsSaving(false);
      return { error: message };
    }

    if (typeof supabase?.from !== 'function') {
      const message = 'Supabase client is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable saving.';
      setSaveError(message);
      setIsSaving(false);
      return { error: message };
    }

    const { payload } = validation;
    const resolvedContext = valueBot?.context as ValueBotAnalysisContext | undefined;
    const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
    const masterMeta = resolvedContext?.masterMeta || null;
    const compositeScore =
      typeof masterMeta?.composite_score === 'number' ? masterMeta.composite_score : null;

    const trimmedProvider = (deepDiveConfig?.provider || 'openai').trim();
    const trimmedModel = (deepDiveConfig?.model || '').trim();
    const modelSnapshot = trimmedModel ? `${trimmedProvider}:${trimmedModel}` : trimmedProvider;

    try {
      const { error } = await supabase.from('valuebot_deep_dives').insert(payload);

      if (error) {
        const message = error.message || 'Unable to save deep dive right now.';
        setSaveError(message);
        return { error: message };
      }

      let metadataWarning: string | null = null;

      const tickerSymbol = (payload?.ticker as string) || '';
      const universePayload: Partial<InvestmentUniverseRow> & { profile_id: string | null; symbol: string } = {
        profile_id: user?.id || null,
        symbol: tickerSymbol,
        last_deep_dive_at: new Date().toISOString(),
        last_risk_label: masterMeta?.risk_label ?? null,
        last_quality_label: masterMeta?.quality_label ?? null,
        last_timing_label: masterMeta?.timing_label ?? null,
        last_composite_score: compositeScore,
        // Snapshot of the model used for the latest MASTER deep dive; this will not retroactively change
        // if default models are updated later.
        last_model: modelSnapshot || null
      };

      const companyName = (payload?.company_name as string | null) || tickerSymbol || null;
      if (companyName) {
        universePayload.name = companyName;
      }

      if (!masterMeta) {
        metadataWarning =
          'Score summary was not generated. Deep dive was saved, but Risk/Quality/Timing/Score were not updated in the Investing Universe.';
        setSaveWarning(metadataWarning);
      }

      console.log('[ValueBot] Upserting Investing Universe metadata:', universePayload);

      try {
        const { error: universeError } = await supabase
          .from('investment_universe')
          .upsert(universePayload, { onConflict: 'profile_id,symbol' });

        if (universeError) {
          metadataWarning =
            "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
          setSaveWarning(metadataWarning);
          console.error('Universe upsert failed', universeError, universePayload);
        } else {
          console.info(
            `[ValueBot] Linked deep dive ticker ${universePayload.symbol} to investment_universe for user ${user?.id ?? 'anon'}`
          );
        }
      } catch (universeError) {
        metadataWarning =
          "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
        setSaveWarning(metadataWarning);
        console.error('Universe upsert failed', universeError, universePayload);
      }

      setSaveSuccess(true);
      return metadataWarning ? { metadataWarning } : {};
    } catch (err) {
      const message = err?.message || 'Unexpected error while saving deep dive.';
      setSaveError(message);
      return { error: message };
    } finally {
      setIsSaving(false);
    }
  }, [validateAndBuildPayload]);

  return { saveDeepDive, isSaving, saveError, saveWarning, saveSuccess };
};

export default useSaveDeepDiveToUniverse;
