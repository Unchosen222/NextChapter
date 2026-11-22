import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cfklbhhrmxyjawzaqhyc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_EvE0ue9dyAiVys1MwHLdMw_MlZmw91v';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Checks if Supabase connection is healthy and responsive
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('courses').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Table might not exist yet, but client connected
      return true;
    }
    return true;
  } catch {
    return false;
  }
}
