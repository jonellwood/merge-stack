import { get, writable } from 'svelte/store';
import { activateProducer, completeTicket, createGame, moveOrMerge, normalizeEnergy, purchaseEnergy, repairSaveShape, repairTicketQueue, syncProgressionUnlocks, unlockCell, validateState } from '$lib/domain/game';
import type { GameState } from '$lib/domain/types';
import { deleteSave, loadSave, saveGame } from '$lib/persistence/db';
import { queueCloudSnapshot } from '$lib/cloud/sync-manager';

export const game = writable<GameState | null>(null);
export const notice = writable('Loading local save…');
export const ready = writable(false);

async function commit(result: {state:GameState;ok:boolean;reason?:string;message?:string;action?:string}) {
  if (!result.ok) { notice.set(result.reason ?? 'That action is unavailable'); return false; }
  game.set(result.state); notice.set(result.message ?? (result.action==='merge' ? 'Merge complete' : 'Board updated')); await saveGame(result.state); queueCloudSnapshot(result.state); return true;
}
export async function initialize() {
  try {
    const saved=await loadSave(); const state=saved && validateState(saved).length===0 ? saved : createGame(); const repaired=repairSaveShape(state),energyChanged=normalizeEnergy(state); const progressionChanged=syncProgressionUnlocks(state),ticketsChanged=repairTicketQueue(state); if(repaired||energyChanged||progressionChanged||ticketsChanged)state.updatedAt=Date.now(); game.set(state); await saveGame(state); notice.set(progressionChanged?'Infrastructure Workbench unlocked!':saved?'Welcome back, operator.':'Workstation online. Tap it to generate code.');
  } catch { const state=createGame(); game.set(state); notice.set('The old save could not be loaded. A safe new board was created.'); }
  ready.set(true);
}
export const actions = {
  move:(id:string,cell:number)=>{const state=get(game);return state?commit(moveOrMerge(state,id,cell)):Promise.resolve(false)},
  produce:(id:string)=>{const state=get(game);return state?commit(activateProducer(state,id)):Promise.resolve(false)},
  ticket:(id:string)=>{const state=get(game);return state?commit(completeTicket(state,id)):Promise.resolve(false)},
  unlock:(index:number)=>{const state=get(game);return state?commit(unlockCell(state,index)):Promise.resolve(false)},
  buyEnergy:()=>{const state=get(game);return state?commit(purchaseEnergy(state)):Promise.resolve(false)},
  setting:async (key:'sound'|'reducedMotion'|'highContrast',value:boolean)=>{const state=get(game);if(!state)return;const next=structuredClone(state);next.settings[key]=value;next.updatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next)},
  tick:async()=>{const state=get(game);if(!state)return;const next=structuredClone(state);if(normalizeEnergy(next)){next.updatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next)}},
  reset:async()=>{await deleteSave();const state=createGame();game.set(state);await saveGame(state);queueCloudSnapshot(state);notice.set('Fresh environment deployed.')},
  devEnergy:async()=>{const state=get(game);if(!state)return;const next=structuredClone(state);next.player.energy=next.player.maxEnergy;next.player.energyUpdatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next);notice.set('Energy restored.')}
};
