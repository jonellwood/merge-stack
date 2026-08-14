import { describe, expect, it } from 'vitest';
import { reconciliationDecision } from './sync-manager';

const link={userId:'user',deviceId:'device',revision:4,lastLocalUpdatedAt:100,cloudUpdatedAt:'now'};

describe('cloud reconciliation decisions',()=>{
  it('pulls a newer cloud revision when local state is clean',()=>expect(reconciliationDecision(100,link,5)).toBe('pull'));
  it('pushes local-only changes against the linked revision',()=>expect(reconciliationDecision(101,link,4)).toBe('push'));
  it('requires a choice when both timelines changed',()=>expect(reconciliationDecision(101,link,5)).toBe('conflict'));
  it('honors a durable dirty marker even when timestamps match',()=>expect(reconciliationDecision(100,{...link,dirtyUpdatedAt:100},5)).toBe('conflict'));
  it('requires first-device reconciliation when no link exists',()=>expect(reconciliationDecision(100,undefined,5)).toBe('choice'));
});
