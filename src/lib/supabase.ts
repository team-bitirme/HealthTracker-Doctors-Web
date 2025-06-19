import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';

// Kullanıcının verdiği Supabase credentials
const supabaseUrl = 'https://vdxnnxkgrgghairrzrvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeG5ueGtncmdnaGFpcnJ6cnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMjE3NzUsImV4cCI6MjA2MzU5Nzc3NX0.KpFBsYSb4ENDFtczbt-JTRrj0MihDYTeYPCdvJqhgyM';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Development user credentials
export const DEV_USER = {
  email: process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'ayse@example.com',
  password: process.env.NEXT_PUBLIC_DEV_USER_PASSWORD || '123456',
};

// Log development user info in dev mode
if (process.env.NODE_ENV === 'development') {
  console.log('=== DEV MODE - Supabase Auth ===');
  console.log('Supabase URL:', supabaseUrl);
  console.log('Development User:');
  console.log('  Email:', DEV_USER.email);
  console.log('  Password:', DEV_USER.password);
  console.log('================================');
}