import Dexie, { type EntityTable } from 'dexie';
import type { GameState } from '$lib/domain/types';

interface SaveRecord { id: 'current'; schemaVersion: number; state: GameState; updatedAt: number; }
class MergeStackDB extends Dexie {
  saves!: EntityTable<SaveRecord, 'id'>;
  constructor() { super('merge-stack'); this.version(1).stores({ saves: 'id, updatedAt' }); }
}
export const db = new MergeStackDB();

export async function loadSave(): Promise<GameState | undefined> { return (await db.saves.get('current'))?.state; }
export async function saveGame(state: GameState): Promise<void> { await db.saves.put({id:'current',schemaVersion:state.schemaVersion,state,updatedAt:state.updatedAt}); }
export async function deleteSave(): Promise<void> { await db.saves.delete('current'); }
