import { useCallback, useContext, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ValueBotContext, ValueBotAnalysisContext } from './types.ts';

type SaveResult = { error?: string; metadataWarning?: string };

type InvestmentUniverseInsert = {
  symbol: string;
  name: string | null;
  profile_id: string | null;
  last_deep_dive_at?: string | null;
  last_risk_label?: string | null;
  last_quality_label?: string | null;
  last_timing_label?: string | null;
  last_composite_score?: number | null;
};

/**
 * Extracts the strict MASTER summary JSON emitted by Module 6. Looks for the last fenced
 * ```json block in the markdown and parses it. Returns null on any failure so the
 * save flow can proceed without blocking the user.
 */
type MasterSummary = {
  risk_label: string;
  quality_label: string;
  timing_label: string;
  composite_score: number;
};

function extractMasterSummaryFromMarkdown(markdown: string): MasterSummary | null {
  if (!markdown) return null;

  const matches = [...markdown.matchAll(/```json\s*([\s\S]*?)\s*```/gi)];
  const lastMatch = matches.at(-1);

  if (!lastMatch || !lastMatch[1]) {
    console.warn('ValueBot MASTER summary parse failed', {
      reason: 'No fenced json block found',
      markdownSnippet: markdown.slice(0, 400)
    });
    return null;
  }

  try {
    const parsed = JSON.parse(lastMatch[1]);

    const compositeScoreValue =
      typeof parsed.composite_score === 'number'
        ? parsed.composite_score
        : typeof parsed.composite_score === 'string'
          ? Number.parseFloat(parsed.composite_score)
          : NaN;

    const summary: MasterSummary = {
      risk_label: typeof parsed.risk_label === 'string' ? parsed.risk_label.trim() : '',
      quality_label: typeof parsed.quality_label === 'string' ? parsed.quality_label.trim() : '',
      timing_label: typeof parsed.timing_label === 'string' ? parsed.timing_label.trim() : '',
      composite_score: compositeScoreValue
    };

    if (
      !summary.risk_label ||
      !summary.quality_label ||
      !summary.timing_label ||
      !Number.isFinite(summary.composite_score)
    ) {
      console.warn('ValueBot MASTER summary parse failed', {
        reason: 'Missing required fields',
        markdownSnippet: markdown.slice(0, 400)
      });
      return null;
    }

    console.log('ValueBot MASTER summary parsed', summary);
    return summary;
  } catch (error) {
    console.warn('ValueBot MASTER summary parse failed', {
      reason: error instanceof Error ? error.message : 'Invalid JSON',
      markdownSnippet: markdown.slice(0, 400)
    });
    return null;
  }
}

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
  const resolvedContext = valueBot?.context as ValueBotAnalysisContext | undefined;
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validateAndBuildPayload = useCallback(
    (): { payload: Record<string, unknown> } | { error: string } => {
      if (!resolvedContext) {
        return { error: 'Deep-dive context is unavailable. Please open ValueBot again.' };
      }

      const deepDiveConfig = resolvedContext.deepDiveConfig || {};
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
          provider: deepDiveConfig?.provider || 'openai',
          model: deepDiveConfig?.model || null,
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
    [resolvedContext, user?.id]
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
    const module6Markdown = (payload?.module6_markdown as string) || '';
    const masterSummary = extractMasterSummaryFromMarkdown(module6Markdown);

    try {
      const { error } = await supabase.from('valuebot_deep_dives').insert(payload);

      if (error) {
        const message = error.message || 'Unable to save deep dive right now.';
        setSaveError(message);
        return { error: message };
      }

      let metadataWarning: string | null = null;

      const nowIso = new Date().toISOString();
      const baseUniversePayload: InvestmentUniverseInsert = {
        symbol: (payload?.ticker as string) || '',
        name: (payload?.company_name as string | null) || (payload?.ticker as string) || null,
        profile_id: user?.id ?? null,
        last_deep_dive_at: nowIso
      };

      const metadata = masterSummary;
      const universePayload: InvestmentUniverseInsert = metadata
        ? {
            ...baseUniversePayload,
            last_risk_label: metadata.risk_label,
            last_quality_label: metadata.quality_label,
            last_timing_label: metadata.timing_label,
            last_composite_score: metadata.composite_score
          }
        : baseUniversePayload;

      if (!metadata) {
        metadataWarning =
          "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
        setSaveWarning(metadataWarning);
      }

      console.info('[ValueBot] Upserting investment_universe payload:', {
        symbol: universePayload.symbol,
        last_risk_label: universePayload.last_risk_label,
        last_quality_label: universePayload.last_quality_label,
        last_timing_label: universePayload.last_timing_label,
        last_composite_score: universePayload.last_composite_score
      });

      try {
        const { error: universeError } = await supabase
          .from('investment_universe')
          .upsert(universePayload, { onConflict: 'profile_id,symbol' });

        if (universeError) {
          metadataWarning =
            "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
          setSaveWarning(metadataWarning);
          console.error('Universe upsert failed', universeError);
        } else {
          console.info(
            `[ValueBot] Linked deep dive ticker ${universePayload.symbol} to investment_universe for user ${user?.id ?? 'anon'}`
          );
        }
      } catch (universeError) {
        metadataWarning =
          "Saved, but couldn't refresh Risk / Quality / Timing / Score. Check console logs and Module 6 JSON block.";
        setSaveWarning(metadataWarning);
        console.error('Universe upsert failed', universeError);
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
