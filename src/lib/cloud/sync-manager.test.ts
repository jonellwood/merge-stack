import { describe, expect, it } from 'vitest';
import { reconciliationDecision, savesMatch } from './sync-manager';
import { createGame } from '$lib/domain/game';

const link={userId:'user',deviceId:'device',revision:4,lastLocalUpdatedAt:100,cloudUpdatedAt:'now'};

describe('cloud reconciliation decisions',()=>{
  it('pulls a newer cloud revision when local state is clean',()=>expect(reconciliationDecision(100,link,5)).toBe('pull'));
  it('pushes local-only changes against the linked revision',()=>expect(reconciliationDecision(101,link,4)).toBe('push'));
  it('requires a choice when both timelines changed',()=>expect(reconciliationDecision(101,link,5)).toBe('conflict'));
  it('honors a durable dirty marker even when timestamps match',()=>expect(reconciliationDecision(100,{...link,dirtyUpdatedAt:100},5)).toBe('conflict'));
  it('requires first-device reconciliation when no link exists',()=>expect(reconciliationDecision(100,undefined,5)).toBe('choice'));
  it('does not ask when local and cloud saves are equivalent',()=>expect(reconciliationDecision(101,{...link,dirtyUpdatedAt:101},5,{equivalent:true})).toBe('current'));
  it('pushes a newer local save when this device wrote the cloud revision',()=>expect(reconciliationDecision(120,link,5,{cloudStateUpdatedAt:110,cloudDeviceId:'device',currentDeviceId:'device'})).toBe('push'));
  it('pulls a newer cloud save when this device wrote the cloud revision',()=>expect(reconciliationDecision(100,link,5,{cloudStateUpdatedAt:110,cloudDeviceId:'device',currentDeviceId:'device'})).toBe('pull'));
  it('compares complete saves independent of object key order',()=>{const state=createGame(100),reordered=structuredClone(state);reordered.player=Object.fromEntries(Object.entries(state.player).reverse()) as typeof state.player;expect(savesMatch(state,reordered)).toBe(true)});
});
