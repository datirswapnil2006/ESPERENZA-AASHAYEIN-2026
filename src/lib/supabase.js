import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('dummy-') &&
  !supabaseAnonKey.includes('dummy_') &&
  supabaseAnonKey.startsWith('eyJ')
);

// Create the Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase environment variables not configured or using placeholders. ' +
    'The app will operate in reactive hybrid store mode with full offline state & seed data. ' +
    'To connect your live PostgreSQL database, update .env with your project URL & Anon key.'
  );
}
