import type { GameState } from '$lib/domain/types';
import { getSupabase } from './supabase';

export interface CloudSave { user_id:string;schema_version:number;revision:number;state:GameState;updated_by_device:string;updated_at:string }
export async function loadCloudSave():Promise<CloudSave|undefined>{const supabase=getSupabase();if(!supabase)return;const {data,error}=await supabase.from('game_saves').select('*').maybeSingle();if(error)throw error;return data as CloudSave|undefined}
export async function writeCloudSnapshot(state:GameState,deviceId:string,expectedRevision:number|null):Promise<CloudSave>{
  const supabase=getSupabase();if(!supabase)throw new Error('Cloud save is not configured');
  const {data,error}=await supabase.rpc('save_game_snapshot',{p_expected_revision:expectedRevision,p_schema_version:state.schemaVersion,p_state:state,p_device_id:deviceId});
  if(error)throw error;const saved=(data as CloudSave[]|null)?.[0];if(!saved)throw new Error('Cloud save changed on another device');return saved;
}
