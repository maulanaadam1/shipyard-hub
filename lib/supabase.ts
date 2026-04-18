import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.anon_public || 'placeholder';

const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
                    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
                    !!supabaseAnonKey && 
                    supabaseAnonKey !== 'placeholder';

if (typeof window !== 'undefined') {
  console.log('Supabase Configuration Status:', isConfigured ? 'Configured' : 'NOT Configured', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey
  });
  if (!isConfigured) {
    console.warn('Supabase credentials are missing or using placeholders. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the Settings menu.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { isConfigured };
