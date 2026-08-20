import { BALANCE } from '$lib/catalogs/balance';
import { HACKATHON_CASHOUT_CREDITS, HACKATHON_EVENT, HACKATHON_REDEMPTION, RETRO_CASHOUT_CREDITS, RETRO_COMPUTING_EVENT } from '$lib/catalogs/events';
import { itemById, itemCatalog } from '$lib/catalogs/items';
import { producerByItemId, producerCatalog } from '$lib/catalogs/producers';
import { ticketRewards, ticketTemplates } from '$lib/catalogs/tickets';
import { playerTitle } from '$lib/catalogs/titles';
import type { BoardItem, GameState, RackItem, Ticket } from './types';

export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const clone = (state: GameState): GameState => structuredClone(state);

export function evaluateAchievements(state:GameState,now=Date.now()):string[]{
  const earned:string[]=[];
  const award=(id:string,eventId?:string)=>{if(state.achievements[id])return;state.achievements[id]={earnedAt:now,eventId};earned.push(id)};
  const definitions=new Set([...state.items,...state.serverRack.items].map(item=>item.definitionId));
  if(state.statistics.mergesCompleted>=1)award('first-merge');
  if(state.statistics.ticketsCompleted>=1)award('first-ticket');
  if(definitions.has('application'))award('application-shipped');
  if(definitions.has('cloud_region'))award('cloud-architect');
  if(state.cells.every(cell=>!cell.locked))award('full-board');
  if(state.serverRack.items.length)award('rack-mounted');
  if(definitions.has('html_workbench'))award('html-operator');
  if(definitions.has('production_markup'))award('html-certified');
  if(definitions.has('css_selector_lab'))award('css-operator');
  if(definitions.has('design_system'))award('css-architect');
  if(state.statistics.eventFinalsRedeemed>=1)award('hackathon-winner',HACKATHON_EVENT.id);
  if(definitions.has('cloud_desktop'))award('retro-cloud',RETRO_COMPUTING_EVENT.id);
  return earned;
}

export function normalizeEnergy(state: GameState, now = Date.now()): boolean {
  if (state.player.energy >= state.player.maxEnergy) {
    const changed=state.player.energy>state.player.maxEnergy;
    state.player.energy=state.player.maxEnergy;
    return changed;
  }
  const elapsed = Math.max(0, now - state.player.energyUpdatedAt);
  const gained = Math.floor(elapsed / BALANCE.energyRegenMs);
  if (!gained) return false;
  state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + gained);
  state.player.energyUpdatedAt += gained * BALANCE.energyRegenMs;
  if (state.player.energy >= state.player.maxEnergy) state.player.energyUpdatedAt = now;
  return true;
}

export function weightedDrop<T extends { weight: number }>(choices: readonly T[], random = Math.random): T | undefined {
  const valid = choices.filter((choice) => Number.isFinite(choice.weight) && choice.weight > 0);
  const total = valid.reduce((sum, choice) => sum + choice.weight, 0);
  if (!total) return undefined;
  let point = Math.min(Math.max(random(), 0), 0.999999999) * total;
  return valid.find((choice) => (point -= choice.weight) < 0) ?? valid.at(-1);
}

function availableTemplates(level: number, now = Date.now()) {
  const ceiling = Math.min(2 + Math.floor((level - 1) / 2), 10);
  return ticketTemplates.filter((template) => (template.minPlayerLevel??1)<=level && (template.activeFrom===undefined||now>=template.activeFrom) && (template.activeUntil===undefined||now<template.activeUntil) && template.requirements.every((requirement) => (itemById.get(requirement.itemId)?.level ?? 99) <= ceiling));
}
export function generateTicket(state: GameState, now = Date.now()): Ticket {
  const available = availableTemplates(state.player.level,now);
  const activeTitles = new Set(state.tickets.map((ticket) => ticket.title));
  const uniqueTemplates = available.filter((template) => !activeTitles.has(template.title));
  const templates = uniqueTemplates.length > 0 ? uniqueTemplates : available;
  const template = templates[state.ticketSequence % templates.length];
  state.ticketSequence++;
  const rewards=ticketRewards(template);
  return { id:makeId(), requesterId:template.requester.toLowerCase().replaceAll(' ','-'), requester:template.requester, title:template.title,
    description:template.description, requirements:template.requirements, rewards, status:'active', createdAt:now };
}

export function repairTicketQueue(state: GameState, now = Date.now()): boolean {
  const originalTitles = state.tickets.map((ticket) => ticket.title);
  const currentlyAvailable=new Set(availableTemplates(state.player.level,now).map(template=>template.id));
  const timedTemplateTitles=new Map(ticketTemplates.filter(template=>template.activeFrom!==undefined||template.activeUntil!==undefined).map(template=>[template.title,template.id]));
  const unique: Ticket[] = [];
  for (const ticket of state.tickets) {
    const timedId=timedTemplateTitles.get(ticket.title);
    if(timedId&&!currentlyAvailable.has(timedId))continue;
    if (!unique.some((candidate) => candidate.title === ticket.title)) unique.push(ticket);
  }
  state.tickets = unique;
  while (state.tickets.length < BALANCE.activeTickets) state.tickets.push(generateTicket(state, now));
  return state.tickets.some((ticket, index) => ticket.title !== originalTitles[index]);
}

export function createGame(now = Date.now()): GameState {
  const state: GameState = { schemaVersion:5, player:{id:'local-player',credits:BALANCE.startingCredits,xp:0,level:1,title:playerTitle(1),energy:BALANCE.startingEnergy,maxEnergy:BALANCE.maxEnergy,energyUpdatedAt:now},
    cells:Array.from({length:BALANCE.columns*BALANCE.rows},(_,index)=>({index,locked:index>=BALANCE.initialUnlocked,unlockCost:index>=BALANCE.initialUnlocked ? 50 + Math.floor((index-BALANCE.initialUnlocked)/7)*25 : undefined})),
    items:[{instanceId:makeId(),definitionId:'workstation',cellIndex:3,createdAt:now}], tickets:[], settings:{sound:true,reducedMotion:false,highContrast:false,hints:true,appearance:'dark'}, energyShop:{windowStartedAt:null,purchases:0},tidyService:{windowStartedAt:null,uses:0},serverRack:{capacity:BALANCE.serverRackStartingU,expansions:0,items:[]},achievements:{},statistics:{mergesCompleted:0,ticketsCompleted:0,eventFinalsRedeemed:0},ticketSequence:0,updatedAt:now };
  while (state.tickets.length < BALANCE.activeTickets) state.tickets.push(generateTicket(state, now));
  return state;
}

export function syncProgressionUnlocks(state:GameState,now=Date.now()):boolean {
  let changed=false;
  const inactive=(producer:typeof producerCatalog[number])=>state.player.level<producer.unlockLevel||(producer.activeFrom!==undefined&&now<producer.activeFrom)||(producer.activeUntil!==undefined&&now>=producer.activeUntil);
  const gatedProducerIds=new Set(producerCatalog.filter(inactive).map(producer=>producer.itemId));
  if(state.items.some(item=>gatedProducerIds.has(item.definitionId))){state.items=state.items.filter(item=>!gatedProducerIds.has(item.definitionId));changed=true}
  if(state.serverRack.items.some(item=>gatedProducerIds.has(item.definitionId))){state.serverRack.items=state.serverRack.items.filter(item=>!gatedProducerIds.has(item.definitionId));changed=true}
  const deployedOrStored=new Set([...state.items,...state.serverRack.items].map(item=>item.definitionId));
  for(const producer of producerCatalog){
    if(inactive(producer)||deployedOrStored.has(producer.itemId))continue;
    const occupied=new Set(state.items.map(item=>item.cellIndex));
    let cell=state.cells.find(candidate=>!candidate.locked&&!occupied.has(candidate.index));
    if(!cell)cell=state.cells.find(candidate=>candidate.locked&&!occupied.has(candidate.index));
    if(!cell)continue;
    cell.locked=false;cell.unlockCost=undefined;
    state.items.push({instanceId:makeId(),definitionId:producer.itemId,cellIndex:cell.index,createdAt:now,state:producer.burstCapacity?{activationsRemaining:producer.burstCapacity}:undefined});changed=true;
  }
  if(evaluateAchievements(state,now).length)changed=true;
  return changed;
}
export interface LevelResult { newLevel: number; previousLevel: number; newTitle: string; previousTitle: string; promoted: boolean; }
export function checkLevel(state: GameState): LevelResult {
  const previousLevel = state.player.level;
  const previousTitle = state.player.title;
  const newLevel = Math.floor(state.player.xp / BALANCE.xpPerLevel) + 1;
  const newTitle = playerTitle(newLevel);
  return { newLevel, previousLevel, newTitle, previousTitle, promoted: newTitle !== previousTitle };
}
export function applyLevel(state: GameState, now = Date.now()): LevelResult {
  const result = checkLevel(state);
  state.player.level = result.newLevel;
  state.player.title = result.newTitle;
  if (result.promoted) {
    state.player.energy = state.player.maxEnergy;
    state.player.energyUpdatedAt = now;
  }
  syncProgressionUnlocks(state, now);
  return result;
}
function levelPlayer(state: GameState,now=Date.now()) {
  applyLevel(state, now);
}
export function moveOrMerge(original: GameState, sourceId: string, targetCellIndex: number, now = Date.now()): {state:GameState;ok:boolean;reason?:string;action?:string} {
  const state=clone(original), source=state.items.find((i)=>i.instanceId===sourceId), cell=state.cells[targetCellIndex];
  if (!source) return {state:original,ok:false,reason:'Item not found'};
  if (!cell) return {state:original,ok:false,reason:'Invalid cell'};
  if (cell.locked) return {state:original,ok:false,reason:'That cell is locked'};
  if (source.cellIndex===targetCellIndex) return {state:original,ok:false,reason:'Same cell'};
  if (itemById.get(source.definitionId)?.kind==='producer') return {state:original,ok:false,reason:'The workstation is bolted down'};
  const target=state.items.find((i)=>i.cellIndex===targetCellIndex);
  let action='move';
  if (!target) source.cellIndex=targetCellIndex;
  else {
    const sourceDef=itemById.get(source.definitionId);
    if (target.definitionId===source.definitionId && sourceDef?.nextItemId) {
      state.items=state.items.filter((i)=>i.instanceId!==source.instanceId&&i.instanceId!==target.instanceId);
      const originProducerId=source.originProducerId===target.originProducerId?source.originProducerId:(source.originProducerId??target.originProducerId);
      state.items.push({instanceId:makeId(),definitionId:sourceDef.nextItemId,cellIndex:targetCellIndex,createdAt:now,originProducerId});
      state.statistics.mergesCompleted++;state.player.xp += (sourceDef.level ?? 1)*BALANCE.mergeXpMultiplier; levelPlayer(state,now);evaluateAchievements(state,now);action='merge';
    } else {
      if (itemById.get(target.definitionId)?.kind==='producer') return {state:original,ok:false,reason:'The workstation is bolted down'};
      const old=source.cellIndex; source.cellIndex=target.cellIndex; target.cellIndex=old; action='swap';
    }
  }
  state.updatedAt=now; return {state,ok:true,action};
}

export function activateProducer(original: GameState, producerId: string, random=Math.random, now=Date.now()) {
  const state=clone(original); normalizeEnergy(state,now);const spendingFromFull=state.player.energy>=state.player.maxEnergy;
  const producerItem=state.items.find(item=>item.instanceId===producerId);
  const producer=producerByItemId.get(producerItem?.definitionId??'');
  if(!producer||state.player.level<producer.unlockLevel) return {state:original,ok:false,reason:'Producer not found'};
  if(producer.activeFrom!==undefined&&now<producer.activeFrom) return {state:original,ok:false,reason:'This event has not started yet'};
  if(producer.activeUntil!==undefined&&now>=producer.activeUntil) return {state:original,ok:false,reason:'This event has ended'};
  if(producer.burstCapacity&&producer.cooldownMs&&producerItem){
    producerItem.state??={activationsRemaining:producer.burstCapacity};
    if(producerItem.state.cooldownUntil&&now>=producerItem.state.cooldownUntil){producerItem.state.activationsRemaining=producer.burstCapacity;delete producerItem.state.cooldownUntil}
    if((producerItem.state.activationsRemaining??producer.burstCapacity)<=0)return {state:original,ok:false,reason:'Event pipeline is cooling down'};
  }
  const occupied=new Set(state.items.map(i=>i.cellIndex)); const cell=state.cells.find(c=>!c.locked&&!occupied.has(c.index));
  if (!cell) return {state:original,ok:false,reason:'No free cells—merge something first'};
  if (state.player.energy < producer.energyCost) return {state:original,ok:false,reason:`Need ${producer.energyCost} energy`};
  const drop=weightedDrop(producer.drops,random); if (!drop) return {state:original,ok:false,reason:'No valid drops'};
  state.items.push({instanceId:makeId(),definitionId:drop.itemId,cellIndex:cell.index,createdAt:now,originProducerId:producer.itemId}); state.player.energy-=producer.energyCost;if(spendingFromFull)state.player.energyUpdatedAt=now; state.updatedAt=now;
  if(producer.burstCapacity&&producer.cooldownMs&&producerItem){
    producerItem.state??={activationsRemaining:producer.burstCapacity};
    producerItem.state.activationsRemaining=Math.max(0,(producerItem.state.activationsRemaining??producer.burstCapacity)-1);
    if(producerItem.state.activationsRemaining===0)producerItem.state.cooldownUntil=now+producer.cooldownMs;
  }
  return {state,ok:true,action:'spawn',message:`Created ${itemById.get(drop.itemId)?.name}`};
}

export function ticketReady(state: GameState, ticket: Ticket): boolean {
  const counts=new Map<string,number>(); state.items.forEach(i=>{if(itemById.get(i.definitionId)?.kind==='mergeable') counts.set(i.definitionId,(counts.get(i.definitionId)??0)+1)});
  return ticket.requirements.every(r=>(counts.get(r.itemId)??0)>=r.quantity);
}
export function findMergeHint(state:GameState):[string,string]|undefined{
  const candidates=state.items.filter(item=>itemById.get(item.definitionId)?.nextItemId).sort((a,b)=>a.cellIndex-b.cellIndex);
  const firstByDefinition=new Map<string,BoardItem>();
  for(const item of candidates){
    const first=firstByDefinition.get(item.definitionId);
    if(first)return[first.instanceId,item.instanceId];
    firstByDefinition.set(item.definitionId,item);
  }
  return undefined;
}
export function findProducerHint(state:GameState,now=Date.now()):string|undefined{
  const hasFreeCell=state.cells.some(cell=>!cell.locked&&!state.items.some(item=>item.cellIndex===cell.index));
  if(!hasFreeCell)return undefined;
  const producers=state.items.filter(item=>{
    const producer=producerByItemId.get(item.definitionId);
    if(!producer||state.player.energy<producer.energyCost)return false;
    if(producer.activeFrom!==undefined&&now<producer.activeFrom)return false;
    if(producer.activeUntil!==undefined&&now>=producer.activeUntil)return false;
    return !(item.state?.cooldownUntil&&item.state.cooldownUntil>now&&(item.state.activationsRemaining??producer.burstCapacity??1)<=0);
  }).sort((a,b)=>a.cellIndex-b.cellIndex);
  const canProduce=(producerId:string,targetId:string)=>{
    const producer=producerByItemId.get(producerId);if(!producer)return false;
    return producer.drops.some(drop=>{
      let itemId:string|undefined=drop.itemId;const visited=new Set<string>();
      while(itemId&&!visited.has(itemId)){if(itemId===targetId)return true;visited.add(itemId);itemId=itemById.get(itemId)?.nextItemId}
      return false;
    });
  };
  const boardCounts=new Map<string,number>();
  for(const item of state.items)if(itemById.get(item.definitionId)?.kind==='mergeable')boardCounts.set(item.definitionId,(boardCounts.get(item.definitionId)??0)+1);
  for(const ticket of state.tickets)for(const requirement of ticket.requirements){
    if((boardCounts.get(requirement.itemId)??0)>=requirement.quantity)continue;
    const useful=producers.find(item=>canProduce(item.definitionId,requirement.itemId));
    if(useful)return useful.instanceId;
  }
  return producers[0]?.instanceId;
}
export function itemsContributingToTicket(state:GameState,ticket:Ticket):BoardItem[]{
  return ticket.requirements.flatMap(requirement=>state.items.filter(item=>item.definitionId===requirement.itemId).sort((a,b)=>a.cellIndex-b.cellIndex).slice(0,requirement.quantity));
}
export function itemsForTicket(state:GameState,ticket:Ticket):BoardItem[]{
  return ticketReady(state,ticket)?itemsContributingToTicket(state,ticket):[];
}
export function completeTicket(original: GameState, ticketId: string, now=Date.now()) {
  const state=clone(original), ticket=state.tickets.find(t=>t.id===ticketId); if(!ticket) return {state:original,ok:false,reason:'Ticket not found'};
  const ticketItems=itemsForTicket(state,ticket);if(!ticketItems.length)return {state:original,ok:false,reason:'Required items are still missing'};
  const consumed=new Set(ticketItems.map(item=>item.instanceId));
  state.items=state.items.filter(i=>!consumed.has(i.instanceId)); state.player.credits+=ticket.rewards.credits; state.player.xp+=ticket.rewards.xp; state.player.energy=Math.min(state.player.maxEnergy,state.player.energy+(ticket.rewards.energy??0));if(state.player.energy>=state.player.maxEnergy)state.player.energyUpdatedAt=now; levelPlayer(state,now);
  state.statistics.ticketsCompleted++;evaluateAchievements(state,now);state.tickets=state.tickets.filter(t=>t.id!==ticketId); state.tickets.push(generateTicket(state,now)); state.updatedAt=now;
  return {state,ok:true,action:'ticket',message:`Ticket closed: +${ticket.rewards.credits} credits, +${ticket.rewards.xp} XP${ticket.rewards.energy?`, +${ticket.rewards.energy} energy`:''}`};
}
export function redeemEventItem(original:GameState,itemId:string,reward:'energy'|'credits',now=Date.now()){
  const item=original.items.find(candidate=>candidate.instanceId===itemId);
  if(!item||item.definitionId!==HACKATHON_REDEMPTION.itemId)return{state:original,ok:false,reason:'Event reward not found'};
  if(reward==='energy'&&original.player.energy>=original.player.maxEnergy)return{state:original,ok:false,reason:'Energy is already full'};
  const state=clone(original);
  state.items=state.items.filter(candidate=>candidate.instanceId!==itemId);
  state.statistics.eventFinalsRedeemed++;
  if(reward==='energy'){
    state.player.energy=Math.min(state.player.maxEnergy,state.player.energy+HACKATHON_REDEMPTION.energy);
    if(state.player.energy>=state.player.maxEnergy)state.player.energyUpdatedAt=now;
  }else state.player.credits+=HACKATHON_REDEMPTION.credits;
  evaluateAchievements(state,now);state.updatedAt=now;
  const amount=reward==='energy'?`${HACKATHON_REDEMPTION.energy} energy`:`${HACKATHON_REDEMPTION.credits} credits`;
  return{state,ok:true,action:'event-redemption',message:`Goal redeemed: +${amount}`};
}
export function hackathonCashoutQuote(state:GameState){
  const items=[...state.items,...state.serverRack.items].filter(item=>itemById.get(item.definitionId)?.chainId==='hackathon');
  const credits=items.reduce((total,item)=>total+(HACKATHON_CASHOUT_CREDITS[itemById.get(item.definitionId)?.level??0]??0),0);
  return{items:items.length,credits};
}
export function cashoutExpiredHackathon(original:GameState,now=Date.now()){
  if(now<HACKATHON_EVENT.endsAt)return{state:original,ok:false,reason:'Hackathon is still active'};
  const quote=hackathonCashoutQuote(original);if(!quote.items)return{state:original,ok:false,reason:'No Hackathon items to cash out'};
  const state=clone(original);state.items=state.items.filter(item=>itemById.get(item.definitionId)?.chainId!=='hackathon');state.serverRack.items=state.serverRack.items.filter(item=>itemById.get(item.definitionId)?.chainId!=='hackathon');state.player.credits+=quote.credits;state.updatedAt=now;
  return{state,ok:true,action:'event-cashout',message:`Hackathon payout: ${quote.items} items · +${quote.credits} credits`};
}
export function cashoutExpiredRetro(original:GameState,now=Date.now()){
  if(now<RETRO_COMPUTING_EVENT.endsAt)return{state:original,ok:false,reason:'Retro Computing Week is still active'};
  const items=[...original.items,...original.serverRack.items].filter(item=>itemById.get(item.definitionId)?.chainId==='retro');
  if(!items.length)return{state:original,ok:false,reason:'No retro items to archive'};
  const credits=items.reduce((total,item)=>total+(RETRO_CASHOUT_CREDITS[itemById.get(item.definitionId)?.level??0]??0),0),state=clone(original);
  state.items=state.items.filter(item=>itemById.get(item.definitionId)?.chainId!=='retro');state.serverRack.items=state.serverRack.items.filter(item=>itemById.get(item.definitionId)?.chainId!=='retro');state.player.credits+=credits;state.updatedAt=now;
  return{state,ok:true,action:'event-cashout',message:`Retro archive: ${items.length} items · +${credits} credits`};
}
export function discardQuote(state:GameState,itemId:string){
  const item=state.items.find(candidate=>candidate.instanceId===itemId),definition=item&&itemById.get(item.definitionId);
  if(!item||!definition||definition.kind==='producer')return undefined;
  const level=definition.level??1;if(level<=3)return{kind:'none' as const,amount:0,level};
  const creditOrigin=item.originProducerId==='infrastructure_workbench'||item.originProducerId==='event_pipeline'||(!item.originProducerId&&(definition.chainId==='servers'||definition.chainId==='hackathon'));
  return creditOrigin?{kind:'credits' as const,amount:(level-3)*25,level}:{kind:'energy' as const,amount:(level-3)*2,level};
}
export function discardItem(original:GameState,itemId:string,now=Date.now()){
  const quote=discardQuote(original,itemId);if(!quote)return{state:original,ok:false,reason:'That item cannot be discarded'};
  const state=clone(original);state.items=state.items.filter(item=>item.instanceId!==itemId);
  let awarded=quote.amount;
  if(quote.kind==='credits')state.player.credits+=awarded;
  if(quote.kind==='energy'){awarded=Math.min(quote.amount,state.player.maxEnergy-state.player.energy);state.player.energy+=awarded;if(state.player.energy>=state.player.maxEnergy)state.player.energyUpdatedAt=now}
  state.updatedAt=now;
  const reward=quote.kind==='none'?'No salvage value':`+${awarded} ${quote.kind}`;
  return{state,ok:true,action:'discard',message:`Item recycled · ${reward}`};
}
export function tidyQuote(state:GameState,now=Date.now()){
  const service=state.tidyService??{windowStartedAt:null,uses:0};
  const expired=service.windowStartedAt===null||now-service.windowStartedAt>=BALANCE.tidyBoardWindowMs;
  const uses=expired?0:service.uses;
  return{cost:BALANCE.tidyBoardBaseCost*2**Math.min(uses,10),uses,resetsAt:expired?null:(service.windowStartedAt??now)+BALANCE.tidyBoardWindowMs};
}
export function tidyBoard(original:GameState,now=Date.now()){
  const quote=tidyQuote(original,now);
  if(original.player.credits<quote.cost)return{state:original,ok:false,reason:`Need ${quote.cost} credits to tidy the board`};
  const state=clone(original),producers=state.items.filter(item=>itemById.get(item.definitionId)?.kind==='producer'),producerCells=new Set(producers.map(item=>item.cellIndex));
  const cells=state.cells.filter(cell=>!cell.locked&&!producerCells.has(cell.index)).sort((a,b)=>a.index-b.index);
  const items=state.items.filter(item=>itemById.get(item.definitionId)?.kind==='mergeable').sort((a,b)=>{
    const aDef=itemById.get(a.definitionId)!,bDef=itemById.get(b.definitionId)!;
    return(aDef.level??0)-(bDef.level??0)||(aDef.chainId??'').localeCompare(bDef.chainId??'')||aDef.name.localeCompare(bDef.name)||a.createdAt-b.createdAt;
  });
  if(items.length>cells.length)return{state:original,ok:false,reason:'Not enough unlocked board space'};
  items.forEach((item,index)=>item.cellIndex=cells[index].index);
  if(quote.uses===0)state.tidyService={windowStartedAt:now,uses:1};else state.tidyService.uses++;
  state.player.credits-=quote.cost;state.updatedAt=now;
  return{state,ok:true,action:'tidy',message:`Board tidied for ${quote.cost} credits`};
}
export function rackItemSize(definitionId:string):number{
  const definition=itemById.get(definitionId);if(definition?.kind==='producer')return 4;
  const level=definition?.level??1;
  return level>=7?3:level>=4?2:1;
}
export function rackUsed(state:GameState):number{return state.serverRack.items.reduce((total,item)=>total+rackItemSize(item.definitionId),0)}
export function rackExpansionQuote(state:GameState){
  const full=state.serverRack.capacity>=BALANCE.serverRackMaxU;
  return{cost:BALANCE.serverRackExpansionBaseCost*2**state.serverRack.expansions,increase:BALANCE.serverRackExpansionU,full};
}
export function storeInRack(original:GameState,itemId:string,now=Date.now()){
  if(original.player.level<BALANCE.serverRackUnlockLevel)return{state:original,ok:false,reason:`Server Rack unlocks at level ${BALANCE.serverRackUnlockLevel}`};
  const item=original.items.find(candidate=>candidate.instanceId===itemId),definition=item&&itemById.get(item.definitionId);
  if(!item||!definition)return{state:original,ok:false,reason:'Item not found'};
  const size=rackItemSize(item.definitionId),free=original.serverRack.capacity-rackUsed(original);
  if(size>free)return{state:original,ok:false,reason:`Need ${size}U of rack space`};
  const state=clone(original),stored:RackItem={instanceId:item.instanceId,definitionId:item.definitionId,createdAt:item.createdAt,storedAt:now,originProducerId:item.originProducerId,state:item.state};
  state.items=state.items.filter(candidate=>candidate.instanceId!==itemId);state.serverRack.items.push(stored);evaluateAchievements(state,now);state.updatedAt=now;
  return{state,ok:true,action:'rack-store',message:`${definition.name} mounted · ${size}U`};
}
export function retrieveFromRack(original:GameState,itemId:string,now=Date.now()){
  const stored=original.serverRack.items.find(item=>item.instanceId===itemId);if(!stored)return{state:original,ok:false,reason:'Rack item not found'};
  const occupied=new Set(original.items.map(item=>item.cellIndex)),cell=original.cells.find(candidate=>!candidate.locked&&!occupied.has(candidate.index));
  if(!cell)return{state:original,ok:false,reason:'No free board cell available'};
  const state=clone(original);state.serverRack.items=state.serverRack.items.filter(item=>item.instanceId!==itemId);state.items.push({instanceId:stored.instanceId,definitionId:stored.definitionId,cellIndex:cell.index,createdAt:stored.createdAt,originProducerId:stored.originProducerId,state:stored.state});state.updatedAt=now;
  return{state,ok:true,action:'rack-retrieve',message:`${itemById.get(stored.definitionId)?.name} returned to board`};
}
export function expandRack(original:GameState,now=Date.now()){
  if(original.player.level<BALANCE.serverRackUnlockLevel)return{state:original,ok:false,reason:`Server Rack unlocks at level ${BALANCE.serverRackUnlockLevel}`};
  const quote=rackExpansionQuote(original);if(quote.full)return{state:original,ok:false,reason:'Server Rack is fully expanded'};if(original.player.credits<quote.cost)return{state:original,ok:false,reason:`Need ${quote.cost} credits`};
  const state=clone(original);state.player.credits-=quote.cost;state.serverRack.capacity+=quote.increase;state.serverRack.expansions++;state.updatedAt=now;
  return{state,ok:true,action:'rack-expand',message:`Server Rack expanded to ${state.serverRack.capacity}U`};
}
export function repairSaveShape(state:GameState):boolean {
  let changed=false;
  if(!state.energyShop){state.energyShop={windowStartedAt:null,purchases:0};changed=true}
  if(!state.tidyService){state.tidyService={windowStartedAt:null,uses:0};changed=true}
  if(!state.serverRack){state.serverRack={capacity:BALANCE.serverRackStartingU,expansions:0,items:[]};changed=true}
  if(!state.settings){state.settings={sound:true,reducedMotion:false,highContrast:false,hints:true,appearance:'dark'};changed=true}
  if(state.settings.hints===undefined){state.settings.hints=true;changed=true}
  if(state.settings.appearance===undefined){state.settings.appearance='dark';changed=true}
  if(!state.achievements){state.achievements={};changed=true}
  if(!state.statistics){state.statistics={mergesCompleted:0,ticketsCompleted:0,eventFinalsRedeemed:0};changed=true}
  for(const ticket of state.tickets)if(!Number.isFinite(ticket.rewards.energy)){ticket.rewards.energy=ticketRewards(ticket).energy;changed=true}
  if(state.schemaVersion<5){state.schemaVersion=5;changed=true}
  if(!state.player.title){state.player.title=playerTitle(state.player.level);changed=true}
  if(evaluateAchievements(state).length)changed=true;
  return changed;
}
export function energyPurchaseQuote(state:GameState,now=Date.now()){
  const shop=state.energyShop??{windowStartedAt:null,purchases:0};
  const expired=shop.windowStartedAt===null||now-shop.windowStartedAt>=BALANCE.energyShopWindowMs;
  const purchases=expired?0:shop.purchases;
  const boardComplete=state.cells.every(cell=>!cell.locked);
  const cost=Math.round(BALANCE.energyShopBaseCost*2**Math.min(purchases,10)*(boardComplete?BALANCE.energyShopBoardDiscount:1));
  const resetsAt=expired?null:(shop.windowStartedAt??now)+BALANCE.energyShopWindowMs;
  return {cost,purchases,boardComplete,resetsAt};
}
export function purchaseEnergy(original:GameState,now=Date.now()){
  const state=clone(original);repairSaveShape(state);normalizeEnergy(state,now);
  if(state.player.energy>=state.player.maxEnergy)return{state:original,ok:false,reason:'Energy is already full'};
  const quote=energyPurchaseQuote(state,now);if(state.player.credits<quote.cost)return{state:original,ok:false,reason:`Need ${quote.cost} credits`};
  if(quote.purchases===0)state.energyShop={windowStartedAt:now,purchases:1};else state.energyShop.purchases++;
  state.player.credits-=quote.cost;state.player.energy=state.player.maxEnergy;state.player.energyUpdatedAt=now;state.updatedAt=now;
  return{state,ok:true,action:'energy-purchase',message:`Energy restored for ${quote.cost} credits`};
}
export function unlockCell(original:GameState,index:number){const state=clone(original),cell=state.cells[index]; if(!cell?.locked)return {state:original,ok:false,reason:'Cell is already available'}; const cost=cell.unlockCost??0;if(state.player.credits<cost)return{state:original,ok:false,reason:`Need ${cost} credits`};state.player.credits-=cost;cell.locked=false;state.updatedAt=Date.now();evaluateAchievements(state,state.updatedAt);return{state,ok:true,action:'unlock',message:'Board space unlocked'};}

export function validateState(state:GameState):string[]{const errors:string[]=[];const ids=new Set<string>(),cells=new Set<number>();for(const item of state.items){if(ids.has(item.instanceId))errors.push('Duplicate item ID');ids.add(item.instanceId);if(cells.has(item.cellIndex))errors.push('Duplicate occupancy');cells.add(item.cellIndex);if(!itemById.has(item.definitionId))errors.push('Unknown item');}for(const item of state.serverRack?.items??[]){if(ids.has(item.instanceId))errors.push('Duplicate item ID');ids.add(item.instanceId);if(!itemById.has(item.definitionId))errors.push('Unknown rack item')}if(state.serverRack&&rackUsed(state)>state.serverRack.capacity)errors.push('Rack over capacity');if(state.cells.length!==63)errors.push('Invalid board');for(const value of [state.player.energy,state.player.credits,state.player.xp,state.player.level])if(!Number.isFinite(value)||value<0)errors.push('Invalid player value');return errors;}
export function catalogErrors(){const ids=new Set<string>();const errors:string[]=[];for(const item of itemCatalog){if(ids.has(item.id))errors.push(`Duplicate ${item.id}`);ids.add(item.id);if(item.nextItemId&&!itemById.has(item.nextItemId))errors.push(`Missing ${item.nextItemId}`)}return errors;}
