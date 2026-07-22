import Dexie, { type EntityTable } from 'dexie';
import { Preferences } from '@capacitor/preferences';
import type { GameState } from '$lib/domain/types';
import { isNativeApp } from '$lib/platform';

interface SaveRecord { id: 'current'; schemaVersion: number; state: GameState; updatedAt: number; }
export interface CloudLinkRecord { userId:string;deviceId:string;revision:number;lastLocalUpdatedAt:number;cloudUpdatedAt:string; }
class MergeStackDB extends Dexie {
  saves!: EntityTable<SaveRecord, 'id'>;
  cloudLinks!: EntityTable<CloudLinkRecord,'userId'>;
  constructor() { super('merge-stack'); this.version(1).stores({ saves: 'id, updatedAt' }); this.version(2).stores({saves:'id, updatedAt',cloudLinks:'userId, revision'}); }
}
export const db = new MergeStackDB();
const nativeSaveKey='merge-stack-current-save';

export async function loadSave(): Promise<GameState | undefined> {
  if(!isNativeApp())return (await db.saves.get('current'))?.state;
  try{
    const {value}=await Preferences.get({key:nativeSaveKey});
    if(value)return JSON.parse(value) as GameState;
    const legacy=(await db.saves.get('current'))?.state;
    if(legacy)await Preferences.set({key:nativeSaveKey,value:JSON.stringify(legacy)});
    return legacy;
  }catch{return (await db.saves.get('current'))?.state}
}
export async function saveGame(state: GameState): Promise<void> {
  if(isNativeApp()){
    try{await Preferences.set({key:nativeSaveKey,value:JSON.stringify(state)})}
    catch{await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt});return}
    await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt}).catch(()=>undefined);
    return;
  }
  await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt});
}
export async function deleteSave(): Promise<void> {
  if(isNativeApp())await Preferences.remove({key:nativeSaveKey});
  await db.saves.delete('current');
}
export async function loadCloudLink(userId:string){return db.cloudLinks.get(userId)}
export async function saveCloudLink(link:CloudLinkRecord){await db.cloudLinks.put(link)}
