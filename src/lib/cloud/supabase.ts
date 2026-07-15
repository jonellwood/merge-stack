import { env } from '$env/dynamic/public';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client:SupabaseClient|undefined;
export function cloudConfigured(){return Boolean(env.PUBLIC_SUPABASE_URL&&env.PUBLIC_SUPABASE_PUBLISHABLE_KEY)}
export function getSupabase(){
  const url=env.PUBLIC_SUPABASE_URL,key=env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return undefined;
  client??=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  return client;
}
