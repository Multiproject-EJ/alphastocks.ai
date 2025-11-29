import { supabase } from './supabaseClient.js';
import { isDemoMode } from '../config/runtimeConfig.js';

const deriveDisplayName = (user) => {
  const fallbackFromEmail = user?.email?.split('@')[0] ?? 'Workspace user';
  return (
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    fallbackFromEmail
  );
};

const resolveTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (_error) {
    return null;
  }
};

const maybeFetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, timezone')
    .eq('id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

const upsertProfile = async (user) => {
  const profilePayload = {
    id: user.id,
    email: user.email ?? '',
    display_name: deriveDisplayName(user),
    role: 'member',
    timezone: resolveTimezone()
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profilePayload)
    .select('id, display_name, email, role, timezone')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

const ensureSettingsForProfile = async (profileId) => {
  const tableCandidates = ['settings', 'user_settings'];

  for (const table of tableCandidates) {
    const { data, error } = await supabase
      .from(table)
      .select('profile_id')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      if (error.code === '42P01') {
        console.warn(`Supabase settings table "${table}" is missing. Skipping.`);
        continue;
      }

      if (error.code !== 'PGRST116') {
        console.error(`Failed to read ${table} for profile`, error);
        continue;
      }
    }

    if (data) {
      return table;
    }

    const { error: upsertError } = await supabase.from(table).upsert({
      profile_id: profileId,
      currency: 'USD',
      number_format: 'compact',
      ai_api_key_placeholder: '',
      alert_channels: { email: true }
    });

    if (upsertError) {
      if (upsertError.code === '42P01') {
        console.warn(`Supabase settings table "${table}" is missing. Skipping.`);
        continue;
      }

      console.error(`Failed to initialize ${table} for profile`, upsertError);
      continue;
    }

    return table;
  }

  return null;
};

export const bootstrapUserWorkspace = async (user) => {
  if (!user || isDemoMode()) {
    return null;
  }

  try {
    const existingProfile = await maybeFetchProfile(user.id);
    const profile = existingProfile || (await upsertProfile(user));

    await ensureSettingsForProfile(profile.id);
    return profile;
  } catch (error) {
    console.error('Failed to bootstrap workspace profile', error);
    return null;
  }
};
