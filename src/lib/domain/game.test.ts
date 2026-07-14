import { describe, expect, it } from 'vitest';
import { activateProducer, catalogErrors, completeTicket, createGame, moveOrMerge, normalizeEnergy, repairTicketQueue, ticketReady, validateState, weightedDrop } from './game';

describe('catalog and initial state',()=>{
  it('has continuous, unique definitions',()=>expect(catalogErrors()).toEqual([]));
  it('creates a valid board and three different tickets',()=>{const state=createGame(1000);expect(state.cells).toHaveLength(63);expect(state.tickets).toHaveLength(3);expect(new Set(state.tickets.map(ticket=>ticket.title)).size).toBe(3);expect(validateState(state)).toEqual([])});
  it('repairs duplicate tickets from an existing save',()=>{const state=createGame(1000);state.tickets=[state.tickets[0],structuredClone(state.tickets[0]),structuredClone(state.tickets[0])];expect(repairTicketQueue(state,2000)).toBe(true);expect(new Set(state.tickets.map(ticket=>ticket.title)).size).toBe(3)});
});
describe('energy and spawning',()=>{
  it('normalizes elapsed time and clamps at maximum',()=>{const state=createGame(0);state.player.energy=90;normalizeEnergy(state,30*120_000);expect(state.player.energy).toBe(100)});
  it('selects weighted boundaries and ignores invalid weights',()=>{const choices=[{id:'a',weight:3},{id:'bad',weight:0},{id:'b',weight:1}];expect(weightedDrop(choices,()=>0)?.id).toBe('a');expect(weightedDrop(choices,()=>.999)?.id).toBe('b')});
  it('spends energy only after a successful spawn',()=>{const state=createGame(0),producer=state.items[0];const result=activateProducer(state,producer.instanceId,()=>0,1);expect(result.ok).toBe(true);expect(result.state.player.energy).toBe(99);expect(result.state.items.some(i=>i.definitionId==='character')).toBe(true)});
});
describe('board commands',()=>{
  it('moves, swaps, and merges without duplicate occupancy',()=>{let state=createGame(0);state.items.push({instanceId:'a',definitionId:'character',cellIndex:0,createdAt:1},{instanceId:'b',definitionId:'character',cellIndex:1,createdAt:2},{instanceId:'c',definitionId:'typo',cellIndex:2,createdAt:3});let result=moveOrMerge(state,'c',4);expect(result.action).toBe('move');result=moveOrMerge(result.state,'c',0);expect(result.action).toBe('swap');result=moveOrMerge(result.state,'a',1);expect(result.action).toBe('merge');expect(result.state.items.some(i=>i.definitionId==='string')).toBe(true);expect(validateState(result.state)).toEqual([])});
  it('rejects locked cells without mutation',()=>{const state=createGame(0);state.items.push({instanceId:'a',definitionId:'character',cellIndex:0,createdAt:1});const result=moveOrMerge(state,'a',62);expect(result.ok).toBe(false);expect(state.items.at(-1)?.cellIndex).toBe(0)});
});
describe('tickets',()=>{
  it('consumes deterministically and grants rewards atomically',()=>{const state=createGame(0),ticket=state.tickets[0];for(const requirement of ticket.requirements)for(let n=0;n<requirement.quantity;n++)state.items.push({instanceId:`${requirement.itemId}-${n}`,definitionId:requirement.itemId,cellIndex:10+n,createdAt:n});expect(ticketReady(state,ticket)).toBe(true);const result=completeTicket(state,ticket.id,10);expect(result.ok).toBe(true);expect(result.state.tickets).toHaveLength(3);expect(result.state.player.credits).toBeGreaterThan(state.player.credits)});
  it('does nothing when requirements are absent',()=>{const state=createGame(0),before=structuredClone(state);const result=completeTicket(state,state.tickets[0].id,10);expect(result.ok).toBe(false);expect(state).toEqual(before)});
});
