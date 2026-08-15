import { writable } from 'svelte/store';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { GameState } from '$lib/domain/types';
import { loadCloudLink, saveCloudLink } from '$lib/persistence/db';
import { isNativeApp } from '$lib/platform';
import { getSupabase } from './supabase';
import { loadCloudSave, writeCloudSnapshot, type CloudSave } from './save-repository';

export type CloudSyncPhase='idle'|'checking'|'local-only'|'choice'|'synced'|'syncing'|'conflict'|'error';
export interface CloudSyncState {phase:CloudSyncPhase;cloud?:CloudSave;message?:string;dirty?:boolean}
export const cloudSync=writable<CloudSyncState>({phase:'idle',dirty:false});
let syncQueue=Promise.resolve(),currentPhase:CloudSyncPhase='idle',dirty=false,latestQueuedAt=0;

function publish(state:CloudSyncState){currentPhase=state.phase;if(state.dirty!==undefined)dirty=state.dirty;cloudSync.set({...state,dirty})}
function deviceId(){let id=localStorage.getItem('merge-stack-device-id');if(!id){id=crypto.randomUUID();localStorage.setItem('merge-stack-device-id',id)}return id}
function stableValue(value:unknown):unknown{
  if(Array.isArray(value))return value.map(stableValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,stableValue(item)]));
  return value;
}
export function savesMatch(local:GameState,cloud:GameState){return JSON.stringify(stableValue(local))===JSON.stringify(stableValue(cloud))}
async function recordLink(userId:string,save:CloudSave,local:GameState,isDirty=false){dirty=isDirty;await saveCloudLink({userId,deviceId:deviceId(),revision:save.revision,lastLocalUpdatedAt:local.updatedAt,cloudUpdatedAt:save.updated_at,dirtyUpdatedAt:isDirty?local.updatedAt:undefined})}
export function cloudActionBlocked(){return currentPhase==='checking'||currentPhase==='conflict'}
export function resetCloudSync(){dirty=false;latestQueuedAt=0;publish({phase:'idle',dirty:false})}
export function reconciliationDecision(localUpdatedAt:number,link:Awaited<ReturnType<typeof loadCloudLink>>,cloudRevision:number,context?:{equivalent?:boolean;cloudStateUpdatedAt?:number;cloudDeviceId?:string;currentDeviceId?:string}){
  if(context?.equivalent)return 'current' as const;
  if(context?.cloudDeviceId&&context.cloudDeviceId===context.currentDeviceId){
    if((context.cloudStateUpdatedAt??0)>localUpdatedAt)return 'pull' as const;
    if((context.cloudStateUpdatedAt??0)<localUpdatedAt)return 'push' as const;
  }
  if(!link)return 'choice' as const;
  const localChanged=Boolean(link.dirtyUpdatedAt)||localUpdatedAt!==link.lastLocalUpdatedAt,cloudChanged=cloudRevision!==link.revision;
  if(localChanged&&cloudChanged)return 'conflict' as const;
  if(cloudChanged)return 'pull' as const;
  if(localChanged)return 'push' as const;
  return 'current' as const;
}

export async function inspectCloudState(userId:string,local:GameState){
  publish({phase:'checking',message:'Checking for progress from another device…'});
  try{
    await syncQueue;
    const [cloud,link]=await Promise.all([loadCloudSave(),loadCloudLink(userId)]);
    if(!cloud){publish({phase:'local-only',message:'This account has no cloud save yet.'});return}
    const currentDeviceId=deviceId(),equivalent=savesMatch(local,cloud.state);
    const decision=reconciliationDecision(local.updatedAt,link,cloud.revision,{equivalent,cloudStateUpdatedAt:cloud.state.updatedAt,cloudDeviceId:cloud.updated_by_device,currentDeviceId});
    if(decision==='choice'){publish({phase:'choice',cloud,message:'Choose which progress should become authoritative.'});return}
    dirty=decision==='push'||decision==='conflict';
    if(decision==='conflict'){publish({phase:'conflict',cloud,dirty:true,message:'This device and the cloud both changed. Choose which progress to keep.'});return}
    if(decision==='pull'){return chooseCloudSave(userId,cloud)}
    if(decision==='push'){await pushLinkedSnapshot(userId,local);return}
    await recordLink(userId,cloud,local);publish({phase:'synced',cloud,dirty:false,message:'Cloud save is current.'});return undefined;
  }catch(error){publish({phase:'error',dirty,message:error instanceof Error?error.message:'Cloud sync failed'})}
}

export async function chooseLocalSave(userId:string,local:GameState,cloud?:CloudSave){
  publish({phase:'syncing',cloud,dirty:true});
  try{const saved=await writeCloudSnapshot(local,deviceId(),cloud?.revision??null);await recordLink(userId,saved,local);publish({phase:'synced',cloud:saved,dirty:false,message:'This device is now saved to the cloud.'});return true}catch(error){publish({phase:'error',cloud,dirty:true,message:error instanceof Error?error.message:'Upload failed'});return false}
}
export async function chooseCloudSave(userId:string,cloud:CloudSave){await recordLink(userId,cloud,cloud.state);publish({phase:'synced',cloud,dirty:false,message:'Progress updated from another device.'});return structuredClone(cloud.state)}

async function pushLinkedSnapshot(userId:string,state:GameState){
  const link=await loadCloudLink(userId);if(!link)return;
  await saveCloudLink({...link,dirtyUpdatedAt:state.updatedAt});dirty=true;publish({phase:'syncing',dirty:true});
  try{
    const saved=await writeCloudSnapshot(state,link.deviceId,link.revision),stillDirty=latestQueuedAt>state.updatedAt;
    await recordLink(userId,saved,state,stillDirty);
    publish({phase:'synced',cloud:saved,dirty:stillDirty,message:stillDirty?'Saving newer changes…':'Progress saved to cloud.'});
  }catch(error){
    const cloud=await loadCloudSave().catch(()=>undefined);
    if(cloud&&(savesMatch(state,cloud.state)||(cloud.updated_by_device===deviceId()&&cloud.state.updatedAt>=state.updatedAt))){const stillDirty=latestQueuedAt>cloud.state.updatedAt;await recordLink(userId,cloud,cloud.state,stillDirty);publish({phase:'synced',cloud,dirty:stillDirty,message:stillDirty?'Saving newer changes…':'Progress saved to cloud.'});return}
    publish({phase:cloud?'conflict':'error',cloud,dirty:true,message:cloud?'Another device saved newer progress. Review both saves before continuing.':error instanceof Error?error.message:'Cloud sync failed'})
  }
}
export function queueCloudSnapshot(state:GameState){
  if(isNativeApp())return;
  const snapshot=structuredClone(state);latestQueuedAt=Math.max(latestQueuedAt,snapshot.updatedAt);dirty=true;publish({phase:currentPhase==='conflict'?'conflict':'syncing',dirty:true,message:currentPhase==='conflict'?'Resolve the cloud conflict before continuing.':'Saving progress…'});
  syncQueue=syncQueue.then(async()=>{const supabase=getSupabase();if(!supabase)return;const {data}=await supabase.auth.getSession();if(data.session?.user)await pushLinkedSnapshot(data.session.user.id,snapshot)}).catch(error=>publish({phase:'error',dirty:true,message:error instanceof Error?error.message:'Cloud sync failed'}));
}
export function watchCloudSave(userId:string,onRemoteChange:()=>void){
  const supabase=getSupabase();if(!supabase||isNativeApp())return()=>{};
  let channel:RealtimeChannel|undefined=supabase.channel(`merge-stack-save-${userId}-${deviceId()}`)
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'game_saves',filter:`user_id=eq.${userId}`},payload=>{
      const updatedBy=(payload.new as Partial<CloudSave>).updated_by_device;
      if(updatedBy!==deviceId())onRemoteChange();
    }).subscribe();
  return()=>{if(channel){void supabase.removeChannel(channel);channel=undefined}}
}
