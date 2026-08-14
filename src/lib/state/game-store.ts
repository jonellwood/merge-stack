import { get, writable } from 'svelte/store';
import { activateProducer, cashoutExpiredHackathon, cashoutExpiredRetro, completeTicket, createGame, discardItem, expandRack, moveOrMerge, normalizeEnergy, purchaseEnergy, redeemEventItem, repairSaveShape, repairTicketQueue, retrieveFromRack, storeInRack, syncProgressionUnlocks, tidyBoard, unlockCell, validateState } from '$lib/domain/game';
import { playerTitle, shopFlavorForLevel } from '$lib/catalogs/titles';
import { achievementById } from '$lib/catalogs/achievements';
import type { GameState } from '$lib/domain/types';
import { deleteSave, downloadSave, loadBackups, loadSave, requestPersistentStorage, restoreBackup, saveGame, type SaveBackup } from '$lib/persistence/db';
import { cloudActionBlocked, queueCloudSnapshot } from '$lib/cloud/sync-manager';

export const game = writable<GameState | null>(null);
export const notice = writable('Loading local save…');
export const ready = writable(false);
export const storageRecovery = writable<{required:boolean;message?:string;backups:SaveBackup[]}>({required:false,backups:[]});
let recoveryRequired=false;
function mutationPaused(){
  if(recoveryRequired){notice.set('Local storage needs attention before gameplay can continue.');return true}
  if(cloudActionBlocked()){notice.set('Checking cloud progress. Resolve any save conflict before continuing.');return true}
  return false;
}

function promotionNotice(state: GameState): { text: string; refill?: boolean } | undefined {
  const previous = get(game);
  if (!previous || previous.player.title === state.player.title) return undefined;
  return { text: `Level up! You got promoted to ${state.player.title}`, refill: true };
}

async function commit(result: {state:GameState;ok:boolean;reason?:string;message?:string;action?:string}) {
  if(mutationPaused())return false;
  if (!result.ok) { notice.set(result.reason ?? 'That action is unavailable'); return false; }
  const promotion = promotionNotice(result.state);
  const previous=get(game);
  const unlocked=Object.keys(result.state.achievements).find(id=>!previous?.achievements?.[id]);
  game.set(result.state); notice.set(promotion?.text ?? (unlocked?`Badge unlocked: ${achievementById.get(unlocked)?.name??unlocked}`:result.message) ?? (result.action==='merge' ? 'Merge complete' : 'Board updated')); await saveGame(result.state); queueCloudSnapshot(result.state); return true;
}
export async function initialize() {
  void requestPersistentStorage().catch(()=>undefined);
  try {
    const saved=await loadSave();let state=saved;
    if(saved&&validateState(saved).length){const backups=await loadBackups();state=backups.find(backup=>validateState(backup.state).length===0)?.state;if(!state)throw new Error('The current save is invalid and no valid backup was found.')}
    state??=createGame();const repaired=repairSaveShape(state),energyChanged=normalizeEnergy(state);const hackathonArchive=cashoutExpiredHackathon(state);if(hackathonArchive.ok)state=hackathonArchive.state;const retroArchive=cashoutExpiredRetro(state);if(retroArchive.ok)state=retroArchive.state;const progressionChanged=syncProgressionUnlocks(state),ticketsChanged=repairTicketQueue(state);if(repaired||energyChanged||progressionChanged||ticketsChanged||hackathonArchive.ok||retroArchive.ok)state.updatedAt=Date.now();game.set(state);await saveGame(state,saved?'startup':'new-game');notice.set(retroArchive.ok?retroArchive.message!:hackathonArchive.ok?hackathonArchive.message!:progressionChanged?'New generator deployed!':saved?`Welcome back, ${state.player.title.toLowerCase()}.`:'Workstation online. Tap it to generate code.');
  } catch(error) {const backups=await loadBackups().catch(()=>[]),backup=backups.find(entry=>validateState(entry.state).length===0);if(backup){const state=await restoreBackup(backup);game.set(state);notice.set('Recovered your most recent valid local backup.')}else{recoveryRequired=true;storageRecovery.set({required:true,message:error instanceof Error?error.message:'Local storage could not be opened.',backups});game.set(createGame());notice.set('Local storage could not be opened. Gameplay is paused to protect your progress.')}}
  ready.set(true);
}
export const actions = {
  move:(id:string,cell:number)=>{const state=get(game);return state?commit(moveOrMerge(state,id,cell)):Promise.resolve(false)},
  produce:(id:string)=>{const state=get(game);return state?commit(activateProducer(state,id)):Promise.resolve(false)},
  ticket:(id:string)=>{const state=get(game);return state?commit(completeTicket(state,id)):Promise.resolve(false)},
  redeemEvent:(id:string,reward:'energy'|'credits')=>{const state=get(game);return state?commit(redeemEventItem(state,id,reward)):Promise.resolve(false)},
  cashoutHackathon:()=>{const state=get(game);return state?commit(cashoutExpiredHackathon(state)):Promise.resolve(false)},
  discard:(id:string)=>{const state=get(game);return state?commit(discardItem(state,id)):Promise.resolve(false)},
  tidy:()=>{const state=get(game);return state?commit(tidyBoard(state)):Promise.resolve(false)},
  store:(id:string)=>{const state=get(game);return state?commit(storeInRack(state,id)):Promise.resolve(false)},
  retrieve:(id:string)=>{const state=get(game);return state?commit(retrieveFromRack(state,id)):Promise.resolve(false)},
  expandRack:()=>{const state=get(game);return state?commit(expandRack(state)):Promise.resolve(false)},
  unlock:(index:number)=>{const state=get(game);return state?commit(unlockCell(state,index)):Promise.resolve(false)},
  buyEnergy:()=>{const state=get(game);return state?commit(purchaseEnergy(state)):Promise.resolve(false)},
  setting:async (key:'sound'|'reducedMotion'|'highContrast'|'hints',value:boolean)=>{if(mutationPaused())return;const state=get(game);if(!state)return;const next=structuredClone(state);next.settings[key]=value;next.updatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next)},
  tick:async()=>{if(mutationPaused())return;const state=get(game);if(!state)return;let next=structuredClone(state),changed=normalizeEnergy(next);const retroArchive=cashoutExpiredRetro(next);if(retroArchive.ok){next=retroArchive.state;changed=true}if(syncProgressionUnlocks(next))changed=true;if(repairTicketQueue(next))changed=true;if(changed){next.updatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next)}},
  reset:async()=>{if(mutationPaused())return;await deleteSave();const state=createGame();game.set(state);await saveGame(state);queueCloudSnapshot(state);notice.set('Fresh environment deployed.')},
  exportSave:()=>{const state=get(game);if(state)downloadSave(state)},
  importSave:async(file?:File)=>{if(!file||mutationPaused())return;try{const candidate=JSON.parse(await file.text()) as GameState;repairSaveShape(candidate);const errors=validateState(candidate);if(errors.length)throw new Error(errors[0]);candidate.updatedAt=Date.now();await saveGame(candidate,'before-import');game.set(candidate);queueCloudSnapshot(candidate);notice.set('Save backup imported successfully.')}catch(error){notice.set(error instanceof Error?`Could not import save: ${error.message}`:'Could not import that save backup.')}},
  restoreBackup:async(backup:SaveBackup)=>{const state=await restoreBackup(backup);recoveryRequired=false;storageRecovery.set({required:false,backups:[]});game.set(state);notice.set('Local backup restored.')},
  retryStorage:async()=>{try{const state=await loadSave();if(!state)throw new Error('No local save was found.');recoveryRequired=false;storageRecovery.set({required:false,backups:[]});game.set(state);notice.set('Local save reopened successfully.')}catch(error){storageRecovery.update(value=>({...value,message:error instanceof Error?error.message:'Storage is still unavailable.'}))}},
  startFreshAfterRecovery:async()=>{await deleteSave();const state=createGame();await saveGame(state,'recovery-reset');recoveryRequired=false;storageRecovery.set({required:false,backups:[]});game.set(state);notice.set('Fresh environment deployed.')},
  devEnergy:async()=>{if(mutationPaused())return;const state=get(game);if(!state)return;const next=structuredClone(state);next.player.energy=next.player.maxEnergy;next.player.energyUpdatedAt=Date.now();game.set(next);await saveGame(next);queueCloudSnapshot(next);notice.set('Energy restored.')}
};
