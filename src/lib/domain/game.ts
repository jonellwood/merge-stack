import { BALANCE } from '$lib/catalogs/balance';
import { itemById, itemCatalog } from '$lib/catalogs/items';
import { producerByItemId, producerCatalog } from '$lib/catalogs/producers';
import { ticketRewards, ticketTemplates } from '$lib/catalogs/tickets';
import type { BoardItem, GameState, Ticket } from './types';

export const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const clone = (state: GameState): GameState => structuredClone(state);

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

function availableTemplates(level: number) {
  const ceiling = Math.min(2 + Math.floor((level - 1) / 2), 7);
  return ticketTemplates.filter((template) => (template.minPlayerLevel??1)<=level && template.requirements.every((requirement) => (itemById.get(requirement.itemId)?.level ?? 99) <= ceiling));
}
export function generateTicket(state: GameState, now = Date.now()): Ticket {
  const available = availableTemplates(state.player.level);
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
  const unique: Ticket[] = [];
  for (const ticket of state.tickets) {
    if (!unique.some((candidate) => candidate.title === ticket.title)) unique.push(ticket);
  }
  state.tickets = unique;
  while (state.tickets.length < BALANCE.activeTickets) state.tickets.push(generateTicket(state, now));
  return state.tickets.some((ticket, index) => ticket.title !== originalTitles[index]);
}

export function createGame(now = Date.now()): GameState {
  const state: GameState = { schemaVersion:2, player:{id:'local-player',credits:BALANCE.startingCredits,xp:0,level:1,energy:BALANCE.startingEnergy,maxEnergy:BALANCE.maxEnergy,energyUpdatedAt:now},
    cells:Array.from({length:BALANCE.columns*BALANCE.rows},(_,index)=>({index,locked:index>=BALANCE.initialUnlocked,unlockCost:index>=BALANCE.initialUnlocked ? 50 + Math.floor((index-BALANCE.initialUnlocked)/7)*25 : undefined})),
    items:[{instanceId:makeId(),definitionId:'workstation',cellIndex:3,createdAt:now}], tickets:[], settings:{sound:true,reducedMotion:false,highContrast:false}, energyShop:{windowStartedAt:null,purchases:0}, ticketSequence:0,updatedAt:now };
  while (state.tickets.length < BALANCE.activeTickets) state.tickets.push(generateTicket(state, now));
  return state;
}

export function syncProgressionUnlocks(state:GameState,now=Date.now()):boolean {
  let changed=false;
  for(const producer of producerCatalog){
    if(state.player.level<producer.unlockLevel||state.items.some(item=>item.definitionId===producer.itemId))continue;
    const occupied=new Set(state.items.map(item=>item.cellIndex));
    let cell=state.cells.find(candidate=>!candidate.locked&&!occupied.has(candidate.index));
    if(!cell)cell=state.cells.find(candidate=>candidate.locked&&!occupied.has(candidate.index));
    if(!cell)continue;
    cell.locked=false;cell.unlockCost=undefined;
    state.items.push({instanceId:makeId(),definitionId:producer.itemId,cellIndex:cell.index,createdAt:now});changed=true;
  }
  return changed;
}
function levelPlayer(state: GameState,now=Date.now()) {
  state.player.level = Math.floor(state.player.xp / BALANCE.xpPerLevel) + 1;
  syncProgressionUnlocks(state,now);
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
      state.items.push({instanceId:makeId(),definitionId:sourceDef.nextItemId,cellIndex:targetCellIndex,createdAt:now});
      state.player.xp += (sourceDef.level ?? 1)*BALANCE.mergeXpMultiplier; levelPlayer(state,now); action='merge';
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
  const occupied=new Set(state.items.map(i=>i.cellIndex)); const cell=state.cells.find(c=>!c.locked&&!occupied.has(c.index));
  if (!cell) return {state:original,ok:false,reason:'No free cells—merge something first'};
  if (state.player.energy < producer.energyCost) return {state:original,ok:false,reason:`Need ${producer.energyCost} energy`};
  const drop=weightedDrop(producer.drops,random); if (!drop) return {state:original,ok:false,reason:'No valid drops'};
  state.items.push({instanceId:makeId(),definitionId:drop.itemId,cellIndex:cell.index,createdAt:now}); state.player.energy-=producer.energyCost;if(spendingFromFull)state.player.energyUpdatedAt=now; state.updatedAt=now;
  return {state,ok:true,action:'spawn',message:`Created ${itemById.get(drop.itemId)?.name}`};
}

export function ticketReady(state: GameState, ticket: Ticket): boolean {
  const counts=new Map<string,number>(); state.items.forEach(i=>{if(itemById.get(i.definitionId)?.kind==='mergeable') counts.set(i.definitionId,(counts.get(i.definitionId)??0)+1)});
  return ticket.requirements.every(r=>(counts.get(r.itemId)??0)>=r.quantity);
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
  state.tickets=state.tickets.filter(t=>t.id!==ticketId); state.tickets.push(generateTicket(state,now)); state.updatedAt=now;
  return {state,ok:true,action:'ticket',message:`Ticket closed: +${ticket.rewards.credits} credits, +${ticket.rewards.xp} XP${ticket.rewards.energy?`, +${ticket.rewards.energy} energy`:''}`};
}
export function repairSaveShape(state:GameState):boolean {
  let changed=false;
  if(!state.energyShop){state.energyShop={windowStartedAt:null,purchases:0};changed=true}
  for(const ticket of state.tickets)if(!Number.isFinite(ticket.rewards.energy)){ticket.rewards.energy=ticketRewards(ticket).energy;changed=true}
  if(state.schemaVersion<2){state.schemaVersion=2;changed=true}
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
export function unlockCell(original:GameState,index:number){const state=clone(original),cell=state.cells[index]; if(!cell?.locked)return {state:original,ok:false,reason:'Cell is already available'}; const cost=cell.unlockCost??0;if(state.player.credits<cost)return{state:original,ok:false,reason:`Need ${cost} credits`};state.player.credits-=cost;cell.locked=false;state.updatedAt=Date.now();return{state,ok:true,action:'unlock',message:'Board space unlocked'};}

export function validateState(state:GameState):string[]{const errors:string[]=[];const ids=new Set<string>(),cells=new Set<number>();for(const item of state.items){if(ids.has(item.instanceId))errors.push('Duplicate item ID');ids.add(item.instanceId);if(cells.has(item.cellIndex))errors.push('Duplicate occupancy');cells.add(item.cellIndex);if(!itemById.has(item.definitionId))errors.push('Unknown item');}if(state.cells.length!==63)errors.push('Invalid board');for(const value of [state.player.energy,state.player.credits,state.player.xp,state.player.level])if(!Number.isFinite(value)||value<0)errors.push('Invalid player value');return errors;}
export function catalogErrors(){const ids=new Set<string>();const errors:string[]=[];for(const item of itemCatalog){if(ids.has(item.id))errors.push(`Duplicate ${item.id}`);ids.add(item.id);if(item.nextItemId&&!itemById.has(item.nextItemId))errors.push(`Missing ${item.nextItemId}`)}return errors;}
