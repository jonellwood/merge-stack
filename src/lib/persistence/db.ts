import Dexie, { type EntityTable } from 'dexie';
import type { GameState } from '$lib/domain/types';

interface SaveRecord { id: 'current'; schemaVersion: number; state: GameState; updatedAt: number; }
export interface CloudLinkRecord { userId:string;deviceId:string;revision:number;lastLocalUpdatedAt:number;cloudUpdatedAt:string; }
class MergeStackDB extends Dexie {
  saves!: EntityTable<SaveRecord, 'id'>;
  cloudLinks!: EntityTable<CloudLinkRecord,'userId'>;
  constructor() { super('merge-stack'); this.version(1).stores({ saves: 'id, updatedAt' }); this.version(2).stores({saves:'id, updatedAt',cloudLinks:'userId, revision'}); }
}
export const db = new MergeStackDB();

export async function loadSave(): Promise<GameState | undefined> { return (await db.saves.get('current'))?.state; }
export async function saveGame(state: GameState): Promise<void> { await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt}); }
export async function deleteSave(): Promise<void> { await db.saves.delete('current'); }
export async function loadCloudLink(userId:string){return db.cloudLinks.get(userId)}
export async function saveCloudLink(link:CloudLinkRecord){await db.cloudLinks.put(link)}
