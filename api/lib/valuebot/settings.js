import { getSupabaseAdminClient } from '../supabaseAdmin.js';

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001';

export async function getAutoQueueEnabled() {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('valuebot_settings')
    .select('auto_queue_enabled')
    .eq('id', SETTINGS_ID)
    .single();

  if (error) {
    console.error('[ValueBot settings] Failed to load auto_queue_enabled', error);
    // Fail-safe: treat as enabled so we don't silently stop processing.
    return true;
  }

  return !!data?.auto_queue_enabled;
}

export async function setAutoQueueEnabled(enabled) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('valuebot_settings')
    .upsert(
      {
        id: SETTINGS_ID,
        auto_queue_enabled: !!enabled,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('[ValueBot settings] Failed to update auto_queue_enabled', error);
    throw error;
  }
}
