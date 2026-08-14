// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createGame } from '$lib/domain/game';
import { db, loadBackups, loadSave, restoreBackup, saveGame } from './db';

describe('local save recovery',()=>{
  beforeEach(async()=>{db.close();await db.delete();await db.open()});

  it('keeps the prior valid state whenever the current save changes',async()=>{
    const first=createGame(1),second=structuredClone(first);second.player.level=12;second.updatedAt=2;
    await saveGame(first,'initial');await saveGame(second,'level-up');
    const backups=await loadBackups();
    expect(backups).toHaveLength(1);expect(backups[0].state.updatedAt).toBe(1);expect((await loadSave())?.player.level).toBe(12);
  });

  it('caps rolling history and restores a selected checkpoint',async()=>{
    let state=createGame(1);await saveGame(state);
    for(let revision=2;revision<=11;revision++){state=structuredClone(state);state.player.level=revision;state.updatedAt=revision;await saveGame(state,`revision-${revision}`)}
    const backups=await loadBackups();expect(backups).toHaveLength(8);expect(backups[0].state.updatedAt).toBe(10);expect(backups.at(-1)?.state.updatedAt).toBe(3);
    await restoreBackup(backups.at(-1)!);expect((await loadSave())?.updatedAt).toBe(3);
  });
});
