import Dexie, { type EntityTable } from 'dexie';
import { Preferences } from '@capacitor/preferences';
import type { GameState } from '$lib/domain/types';
import { isNativeApp } from '$lib/platform';

interface SaveRecord { id: 'current'; schemaVersion: number; state: GameState; updatedAt: number; }
export interface SaveBackup { id?: number; savedAt: number; reason: string; state: GameState; }
export interface CloudLinkRecord { userId:string;deviceId:string;revision:number;lastLocalUpdatedAt:number;cloudUpdatedAt:string;dirtyUpdatedAt?:number; }
class MergeStackDB extends Dexie {
  saves!: EntityTable<SaveRecord, 'id'>;
  backups!: EntityTable<SaveBackup, 'id'>;
  cloudLinks!: EntityTable<CloudLinkRecord,'userId'>;
  constructor() {
    super('merge-stack');
    this.version(1).stores({ saves: 'id, updatedAt' });
    this.version(2).stores({saves:'id, updatedAt',cloudLinks:'userId, revision'});
    this.version(3).stores({saves:'id, updatedAt',cloudLinks:'userId, revision',backups:'++id, savedAt, reason'});
  }
}
export const db = new MergeStackDB();
const nativeSaveKey='merge-stack-current-save',maxBackups=8;
let saveChannel:BroadcastChannel|undefined;
const tabId=typeof crypto!=='undefined'?crypto.randomUUID():'server';

function broadcastSave(state:GameState){
  if(typeof BroadcastChannel==='undefined'||isNativeApp())return;
  saveChannel??=new BroadcastChannel('merge-stack-saves');
  saveChannel.postMessage({type:'saved',updatedAt:state.updatedAt,tabId});
}
async function preserveBackup(state:GameState,reason:string){
  await db.backups.add({savedAt:Date.now(),reason,state:structuredClone(state)});
  const excess=(await db.backups.orderBy('savedAt').primaryKeys()).slice(0,-maxBackups);
  if(excess.length)await db.backups.bulkDelete(excess as number[]);
}

export async function requestPersistentStorage():Promise<boolean|undefined>{
  if(isNativeApp()||typeof navigator==='undefined'||!navigator.storage?.persist)return undefined;
  if(await navigator.storage.persisted())return true;
  return navigator.storage.persist();
}
export async function loadSave(): Promise<GameState | undefined> {
  if(!isNativeApp())return (await db.saves.get('current'))?.state;
  try{
    const {value}=await Preferences.get({key:nativeSaveKey});
    if(value)return JSON.parse(value) as GameState;
    const legacy=(await db.saves.get('current'))?.state;
    if(legacy)await Preferences.set({key:nativeSaveKey,value:JSON.stringify(legacy)});
    return legacy;
  }catch(error){
    const fallback=(await db.saves.get('current'))?.state;
    if(fallback)return fallback;
    throw error;
  }
}
export async function saveGame(state: GameState,reason='gameplay'): Promise<void> {
  if(isNativeApp()){
    try{await Preferences.set({key:nativeSaveKey,value:JSON.stringify(state)})}
    catch{await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt});return}
    await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt}).catch(()=>undefined);
    return;
  }
  await db.transaction('rw',db.saves,db.backups,async()=>{
    const previous=await db.saves.get('current');
    if(previous&&previous.updatedAt!==state.updatedAt)await preserveBackup(previous.state,reason);
    await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt});
  });
  broadcastSave(state);
}
export async function checkpointSave(state:GameState,reason:string){if(!isNativeApp())await preserveBackup(state,reason)}
export async function loadBackups():Promise<SaveBackup[]>{return isNativeApp()?[]:db.backups.orderBy('savedAt').reverse().toArray()}
export async function restoreBackup(backup:SaveBackup){await saveGame(backup.state,'before-restore');return backup.state}
export function watchLocalSaves(onSave:(updatedAt:number)=>void){
  if(typeof BroadcastChannel==='undefined'||isNativeApp())return()=>{};
  const channel=new BroadcastChannel('merge-stack-saves');
  channel.onmessage=event=>{if(event.data?.type==='saved'&&event.data.tabId!==tabId&&typeof event.data.updatedAt==='number')onSave(event.data.updatedAt)};
  return()=>channel.close();
}
export function downloadSave(state:GameState){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=`merge-stack-save-${new Date().toISOString().slice(0,10)}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1_000);
}
export async function deleteSave(): Promise<void> {
  if(isNativeApp())await Preferences.remove({key:nativeSaveKey});
  await db.saves.delete('current');
}
export async function loadCloudLink(userId:string){return db.cloudLinks.get(userId)}
export async function saveCloudLink(link:CloudLinkRecord){await db.cloudLinks.put(link)}
