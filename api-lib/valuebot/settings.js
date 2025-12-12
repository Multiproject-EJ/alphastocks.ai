import { getSupabaseAdminClient } from '../supabaseAdmin.js';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export async function getAutoSettings() {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('valuebot_settings')
    .select('auto_queue_enabled, last_auto_run_at')
    .eq('id', SETTINGS_ID)
    .single();

  if (error) {
    console.error('[ValueBot settings] Failed to load auto settings', error);
    // Fail-safe: treat as enabled so we don't silently stop processing.
    return { autoQueueEnabled: true, lastAutoRunAt: null };
  }

  return {
    autoQueueEnabled: data?.auto_queue_enabled !== false,
    lastAutoRunAt: data?.last_auto_run_at ?? null
  };
}

export async function getAutoQueueEnabled() {
  const { autoQueueEnabled } = await getAutoSettings();
  return autoQueueEnabled;
}

export async function setAutoQueueEnabled(enabled) {
  const supabase = getSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('valuebot_settings')
    .upsert(
      {
        id: SETTINGS_ID,
        auto_queue_enabled: !!enabled,
        updated_at: now
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('[ValueBot settings] Failed to update auto_queue_enabled', error);
    throw error;
  }
}

export async function updateLastAutoRunAt(supabaseAdmin) {
  const supabase = supabaseAdmin || getSupabaseAdminClient();
  const lastAutoRunAt = new Date().toISOString();

  const { error } = await supabase
    .from('valuebot_settings')
    .upsert(
      {
        id: SETTINGS_ID,
        last_auto_run_at: lastAutoRunAt,
        updated_at: lastAutoRunAt
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('[ValueBot settings] Failed to update last_auto_run_at', error);
    throw error;
  }

  return lastAutoRunAt;
}
