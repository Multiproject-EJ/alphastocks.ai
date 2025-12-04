import { useCallback, useContext, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { resolveEffectiveModelId } from './modelDefaults.ts';
import {
  InvestmentUniverseRow,
  ValueBotContext,
  ValueBotAnalysisContext,
  ValueBotMasterMeta
} from './types.ts';

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

  const resolveProviderAndModel = useCallback(
    (
      deepDiveConfig?: ValueBotAnalysisContext['deepDiveConfig']
    ): { provider: string; modelSnapshot: string | null } => {
      const provider = (deepDiveConfig?.provider || 'openai').trim();
      const rawModel = deepDiveConfig?.model ?? null;
      const modelSnapshot = resolveEffectiveModelId(provider, rawModel);

      return { provider, modelSnapshot };
    },
    []
  );

  const validateAndBuildPayload = useCallback(
    (
      opts?: {
        masterMarkdownOverride?: string | null;
        metaOverride?: ValueBotMasterMeta | null;
      }
    ): { payload: Record<string, unknown>; masterMeta: ValueBotMasterMeta | null } | { error: string } => {
      const resolvedContext = valueBot?.context as ValueBotAnalysisContext | undefined;

      if (!resolvedContext) {
        return { error: 'Deep-dive context is unavailable. Please open ValueBot again.' };
      }

      const deepDiveConfig = resolvedContext.deepDiveConfig || {};
      const { provider, modelSnapshot } = resolveProviderAndModel(deepDiveConfig);
      const resolvedIds = resolvedContext?.resolvedIdentifiers;
      const ticker = resolvedIds?.effectiveTicker?.trim() || deepDiveConfig?.ticker?.trim();
      const companyName =
        resolvedContext?.companyName?.trim() || resolvedIds?.effectiveCompanyName?.trim() || null;
      const effectiveMasterMarkdown =
        opts?.masterMarkdownOverride?.trim() ||
        resolvedContext?.masterMarkdown?.trim?.() ||
        resolvedContext?.module6Markdown?.trim?.() ||
        resolvedContext?.lastPipelineResult?.masterMarkdown?.trim?.() ||
        (resolvedContext as any)?.modules?.master?.markdown?.trim?.() ||
        '';
      const masterMeta = opts?.metaOverride ?? resolvedContext?.masterMeta ?? null;

      if (!ticker && !companyName) {
        return { error: 'Ticker or company name is required for a deep dive.' };
      }

      if (!effectiveMasterMarkdown) {
        console.warn('[ValueBot Save] Missing MASTER markdown. Cannot save deep dive.', {
          hasOverride: !!opts?.masterMarkdownOverride,
          hasStateMaster: !!resolvedContext?.masterMarkdown,
          hasModule6: !!resolvedContext?.module6Markdown
        });
        return { error: 'Final verdict is missing. Run Module 6 to generate the MASTER report before saving.' };
      }

      return {
        payload: {
          ticker: ticker || '',
          provider,
          model: modelSnapshot,
          timeframe: deepDiveConfig?.timeframe || null,
          custom_question: deepDiveConfig?.customQuestion || null,
          company_name: companyName,
          // Using market as the best available proxy for currency until a dedicated currency field exists.
          currency: resolvedContext?.market?.trim() || null,
          module0_markdown: resolvedContext?.module0OutputMarkdown || null,
          module1_markdown: resolvedContext?.module1OutputMarkdown || null,
          module2_markdown: resolvedContext?.module2Markdown || null,
          module3_markdown: resolvedContext?.module3Markdown || null,
          module4_markdown: resolvedContext?.module4Markdown || null,
          module5_markdown: resolvedContext?.module5Markdown || null,
          module6_markdown: effectiveMasterMarkdown,
          source: 'valuebot_deep_dive',
          user_id: user?.id || null
        },
        masterMeta
      };
    },
    [resolveProviderAndModel, user?.id, valueBot]
  );

  const saveDeepDive = useCallback(
    async (opts?: { masterMarkdownOverride?: string | null; metaOverride?: ValueBotMasterMeta | null }): Promise<SaveResult> => {
      setIsSaving(true);
      setSaveError(null);
      setSaveWarning(null);
      setSaveSuccess(false);

      const validation = validateAndBuildPayload(opts);
      if ('error' in validation) {
        const message = validation.error;
        setSaveError(message);
        setIsSaving(false);
        return { error: message };
      }

      if (typeof supabase?.from !== 'function') {
        const message =
          'Supabase client is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable saving.';
        setSaveError(message);
        setIsSaving(false);
        return { error: message };
      }

      const { payload, masterMeta } = validation;
      const resolvedContext = valueBot?.context as ValueBotAnalysisContext | undefined;
      const deepDiveConfig = resolvedContext?.deepDiveConfig || {};
      const { provider, modelSnapshot } = resolveProviderAndModel(deepDiveConfig);
      const compositeScore =
        typeof masterMeta?.composite_score === 'number' ? masterMeta.composite_score : null;

      try {
        const { error } = await supabase.from('valuebot_deep_dives').insert(payload);

        if (error) {
          const message = error.message || 'Unable to save deep dive right now.';
          setSaveError(message);
          return { error: message };
        }

        let metadataWarning: string | null = null;

        const tickerSymbol = (payload?.ticker as string) || '';
        if (!tickerSymbol) {
          metadataWarning =
            '[useSaveDeepDiveToUniverse] Skipping investment_universe upsert because ticker is missing; deep dive will still be saved.';
          setSaveWarning(metadataWarning);
        }

        const universePayload: Partial<InvestmentUniverseRow> & { profile_id: string | null; symbol: string } = {
          profile_id: user?.id || null,
          symbol: tickerSymbol || '',
          last_deep_dive_at: new Date().toISOString(),
          last_risk_label: masterMeta?.risk_label ?? null,
          last_quality_label: masterMeta?.quality_label ?? null,
          last_timing_label: masterMeta?.timing_label ?? null,
          last_composite_score: compositeScore,
          // Snapshot of the model used for the latest MASTER deep dive; this will not retroactively change
          // if default models are updated later.
          last_model: modelSnapshot
        };

        const resolvedCompanyName = companyName || tickerSymbol || null;
        if (resolvedCompanyName) {
          universePayload.name = resolvedCompanyName;
        }

        if (!masterMeta) {
          metadataWarning =
            'Score summary was not generated. Deep dive was saved, but Risk/Quality/Timing/Score were not updated in the Investing Universe.';
          setSaveWarning(metadataWarning);
        }

        if (tickerSymbol) {
          console.log('[ValueBot] Universe upsert payload', {
            ticker: tickerSymbol,
            provider,
            effectiveModelId: modelSnapshot,
            last_model: modelSnapshot,
            last_risk_label: universePayload.last_risk_label,
            last_quality_label: universePayload.last_quality_label,
            last_timing_label: universePayload.last_timing_label,
            last_composite_score: universePayload.last_composite_score
          });
        }

        if (tickerSymbol) {
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
    },
    [resolveProviderAndModel, validateAndBuildPayload]
  );

  return { saveDeepDive, isSaving, saveError, saveWarning, saveSuccess };
};

export default useSaveDeepDiveToUniverse;
