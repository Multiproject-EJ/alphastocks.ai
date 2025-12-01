import { useCallback, useContext, useState } from 'preact/hooks';
import { supabase } from '../../lib/supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { ValueBotContext, ValueBotAnalysisContext } from './types.ts';

type SaveResult = { error?: string; universeWarning?: string };

type InvestmentUniverseInsert = {
  symbol: string;
  name: string | null;
  profile_id: string;
  last_deep_dive_at?: string | null;
  last_risk_label?: string | null;
  last_quality_label?: string | null;
  last_timing_label?: string | null;
  last_composite_score?: number | null;
};

/**
 * The MASTER summary JSON returned by Module 6 is intended to mirror the standardized
 * tables in the MASTER markdown. We expect a fenced ```json block with keys like:
 * {
 *   "summary": "...",
 *   "risk": "Low",
 *   "quality": "World Class",
 *   "timing": "Buy",
 *   "composite_score": 7.8
 * }
 *
 * This helper is defensive: it will try the first fenced ```json block, then fall back
 * to the first/last braces in the markdown. On any parse issue it returns null so the
 * save flow can still proceed without blocking the user.
 */
type MasterSummary = {
  risk_label?: string;
  quality_label?: string;
  timing_label?: string;
  composite_score?: number;
};

function extractMasterSummaryFromMarkdown(markdown: string): MasterSummary | null {
  if (!markdown) return null;

  const fencedMatch = markdown.match(/```json\s*([\s\S]*?)```/i);
  let jsonCandidate: string | null = fencedMatch?.[1]?.trim() || null;

  if (!jsonCandidate) {
    const firstBrace = markdown.indexOf('{');
    const lastBrace = markdown.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonCandidate = markdown.slice(firstBrace, lastBrace + 1);
    }
  }

  if (!jsonCandidate) {
    console.warn('[ValueBot] No JSON block found in Module 6 MASTER markdown.');
    return null;
  }

  try {
    const parsed = JSON.parse(jsonCandidate);
    const source = parsed?.summary && typeof parsed.summary === 'object' ? parsed.summary : parsed;

    const pickString = (keys: string[]) => {
      for (const key of keys) {
        const value = source?.[key];
        if (typeof value === 'string') return value;
      }
      return undefined;
    };

    const pickNumber = (keys: string[]) => {
      for (const key of keys) {
        const value = source?.[key];
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsedNumber = Number.parseFloat(value);
          if (!Number.isNaN(parsedNumber)) return parsedNumber;
        }
      }
      return undefined;
    };

    const summary: MasterSummary = {
      risk_label: pickString(['risk', 'risk_label', 'riskLabel']),
      quality_label: pickString(['quality', 'quality_label', 'qualityLabel']),
      timing_label: pickString(['timing', 'timing_label', 'timingLabel']),
      composite_score: pickNumber(['composite_score', 'score', 'overall_score', 'compositeScore'])
    };

    console.info('[ValueBot] Parsed MASTER summary from Module 6:', summary);
    return summary;
  } catch (error) {
    console.warn('[ValueBot] Unable to parse Module 6 MASTER summary JSON.', error);
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
    const summary = extractMasterSummaryFromMarkdown(module6Markdown);

    try {
      const { error } = await supabase.from('valuebot_deep_dives').insert(payload);

      if (error) {
        const message = error.message || 'Unable to save deep dive right now.';
        setSaveError(message);
        return { error: message };
      }

      let universeWarning: string | null = null;

      if (user?.id) {
        if (!summary) {
          const parsingWarning =
            'Unable to parse MASTER summary JSON. Deep dive saved, but Investing Universe metadata was not updated.';
          console.warn('[ValueBot] Deep dive saved, but MASTER summary could not be parsed for investment_universe payload.');
          setSaveWarning(parsingWarning);
          universeWarning = parsingWarning;
        }

        const investmentUniversePayload: InvestmentUniverseInsert = {
          symbol: (payload?.ticker as string) || '',
          name: (payload?.company_name as string | null) || (payload?.ticker as string) || null,
          profile_id: user.id,
          ...(summary
            ? {
                last_deep_dive_at: new Date().toISOString(),
                last_risk_label: summary.risk_label || null,
                last_quality_label: summary.quality_label || null,
                last_timing_label: summary.timing_label || null,
                last_composite_score:
                  typeof summary.composite_score === 'number' ? summary.composite_score : null
              }
            : {})
        };

        console.info('[ValueBot] Upserting investment_universe payload:', {
          symbol: investmentUniversePayload.symbol,
          last_risk_label: investmentUniversePayload.last_risk_label,
          last_quality_label: investmentUniversePayload.last_quality_label,
          last_timing_label: investmentUniversePayload.last_timing_label,
          last_composite_score: investmentUniversePayload.last_composite_score
        });

        try {
          const { error: universeError } = await supabase
            .from('investment_universe')
            .upsert(investmentUniversePayload, { onConflict: 'profile_id,symbol' });

          if (universeError) {
            const warningMessage =
              'Deep dive saved, but adding to Investing Universe failed. You can still add this ticker manually.';
            setSaveWarning(warningMessage);
            console.error('[ValueBot] Failed to link deep dive to investment_universe', universeError);
            universeWarning = warningMessage;
          } else {
            console.info(
              `[ValueBot] Linked deep dive ticker ${investmentUniversePayload.symbol} to investment_universe for user ${user.id}`
            );
          }
        } catch (universeError) {
          const warningMessage =
            'Deep dive saved, but adding to Investing Universe failed. You can still add this ticker manually.';
          setSaveWarning(warningMessage);
          console.error('[ValueBot] Exception while linking deep dive to investment_universe', universeError);
          universeWarning = warningMessage;
        }
      }

      setSaveSuccess(true);
      return universeWarning ? { universeWarning } : {};
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
