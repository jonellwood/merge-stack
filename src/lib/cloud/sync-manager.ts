import { writable } from 'svelte/store';
import type { GameState } from '$lib/domain/types';
import { loadCloudLink, saveCloudLink } from '$lib/persistence/db';
import { getSupabase } from './supabase';
import { loadCloudSave, writeCloudSnapshot, type CloudSave } from './save-repository';

export type CloudSyncPhase='idle'|'checking'|'local-only'|'choice'|'synced'|'syncing'|'conflict'|'error';
export interface CloudSyncState {phase:CloudSyncPhase;cloud?:CloudSave;message?:string}
export const cloudSync=writable<CloudSyncState>({phase:'idle'});
let syncQueue=Promise.resolve();

function deviceId(){let id=localStorage.getItem('merge-stack-device-id');if(!id){id=crypto.randomUUID();localStorage.setItem('merge-stack-device-id',id)}return id}
async function recordLink(userId:string,save:CloudSave,local:GameState){await saveCloudLink({userId,deviceId:deviceId(),revision:save.revision,lastLocalUpdatedAt:local.updatedAt,cloudUpdatedAt:save.updated_at})}

export async function inspectCloudState(userId:string,local:GameState){
  cloudSync.set({phase:'checking'});
  try{
    const [cloud,link]=await Promise.all([loadCloudSave(),loadCloudLink(userId)]);
    if(!cloud){cloudSync.set({phase:'local-only',message:'This account has no cloud save yet.'});return}
    if(!link){cloudSync.set({phase:'choice',cloud,message:'Choose which progress should become authoritative.'});return}
    const localChanged=local.updatedAt!==link.lastLocalUpdatedAt,cloudChanged=cloud.revision!==link.revision;
    if(localChanged&&cloudChanged){cloudSync.set({phase:'conflict',cloud,message:'This device and the cloud both changed since the last sync.'});return}
    if(cloudChanged){const state=await chooseCloudSave(userId,cloud);return state}
    if(localChanged){await pushLinkedSnapshot(userId,local);return}
    cloudSync.set({phase:'synced',cloud,message:'Cloud save is current.'});return undefined;
  }catch(error){cloudSync.set({phase:'error',message:error instanceof Error?error.message:'Cloud sync failed'})}
}

export async function chooseLocalSave(userId:string,local:GameState,cloud?:CloudSave){
  cloudSync.set({phase:'syncing',cloud});
  try{const saved=await writeCloudSnapshot(local,deviceId(),cloud?.revision??null);await recordLink(userId,saved,local);cloudSync.set({phase:'synced',cloud:saved,message:'This device is now saved to the cloud.'});return true}catch(error){cloudSync.set({phase:'error',cloud,message:error instanceof Error?error.message:'Upload failed'});return false}
}
export async function chooseCloudSave(userId:string,cloud:CloudSave){await recordLink(userId,cloud,cloud.state);cloudSync.set({phase:'synced',cloud,message:'Cloud progress loaded on this device.'});return cloud.state}

async function pushLinkedSnapshot(userId:string,state:GameState){
  const link=await loadCloudLink(userId);if(!link)return;
  cloudSync.set({phase:'syncing'});
  try{const saved=await writeCloudSnapshot(state,link.deviceId,link.revision);await recordLink(userId,saved,state);cloudSync.set({phase:'synced',cloud:saved,message:'Progress saved to cloud.'})}
  catch(error){const cloud=await loadCloudSave().catch(()=>undefined);cloudSync.set({phase:cloud?'conflict':'error',cloud,message:error instanceof Error?error.message:'Cloud sync failed'})}
}
export function queueCloudSnapshot(state:GameState){
  const snapshot=structuredClone(state);
  syncQueue=syncQueue.then(async()=>{const supabase=getSupabase();if(!supabase)return;const {data}=await supabase.auth.getSession();if(data.session?.user)await pushLinkedSnapshot(data.session.user.id,snapshot)}).catch(error=>cloudSync.set({phase:'error',message:error instanceof Error?error.message:'Cloud sync failed'}));
}
