import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';
import { cloudConfigured, getSupabase } from './supabase';

export const cloudAvailable=writable(cloudConfigured());
export const cloudUser=writable<User|null>(null);
export const authMessage=writable('');

export async function initializeCloudAuth(){
  const supabase=getSupabase();if(!supabase)return;
  const {data}=await supabase.auth.getSession();cloudUser.set(data.session?.user??null);
  const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>cloudUser.set(session?.user??null));
  return()=>listener.subscription.unsubscribe();
}
export async function sendMagicLink(email:string){const supabase=getSupabase();if(!supabase)return false;const {error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin}});authMessage.set(error?error.message:'Check your email for a secure sign-in link.');return !error}
export async function signInWithGoogle(){const supabase=getSupabase();if(!supabase)return;const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin}});if(error)authMessage.set(error.message)}
export async function signOut(){const supabase=getSupabase();if(!supabase)return;await supabase.auth.signOut();authMessage.set('Signed out. Local progress is still available on this device.')}
