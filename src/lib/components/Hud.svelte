<script lang="ts">
  import type { GameState } from '$lib/domain/types';
  import { BALANCE } from '$lib/catalogs/balance';
  import { cloudUser } from '$lib/cloud/account-store';
  import { cloudSync } from '$lib/cloud/sync-manager';
  let { state, onSettings, onRegistry, onEnergyShop, onAccount }: {state:GameState;onSettings:()=>void;onRegistry:()=>void;onEnergyShop:()=>void;onAccount:()=>void}=$props();
  let logoClicks=0, logoTimer:ReturnType<typeof setTimeout>;
  function logoAction(){logoClicks++;clearTimeout(logoTimer);if(logoClicks>=3){logoClicks=0;onRegistry();return}logoTimer=setTimeout(()=>logoClicks=0,700)}
  let progress=$derived(state.player.xp % BALANCE.xpPerLevel);
</script>
<header class="hud">
  <div class="brand"><button class="logo" onclick={logoAction} aria-label="Merge Stack"><img src="/ms-small.png" alt="" /></button><div><strong>Merge Stack</strong><small>legacy platform recovery</small></div></div>
  <div class="stat level"><span>LVL</span><b>{state.player.level}</b><div class="xp"><i style={`width:${progress}%`}></i></div></div>
  <button class="stat energy-stat" onclick={onEnergyShop} aria-label={`Energy ${state.player.energy} of ${state.player.maxEnergy}. Open energy shop.`}><span>ENERGY · RECHARGE</span><b>⚡ {state.player.energy}<small>/{state.player.maxEnergy}</small></b></button>
  <div class="stat"><span>CREDITS</span><b>◈ {state.player.credits}</b></div>
  <button class:signed-in={!!$cloudUser} class:synced={$cloudSync.phase==='synced'} class:syncing={$cloudSync.phase==='syncing'||$cloudSync.phase==='checking'} class:sync-conflict={$cloudSync.phase==='conflict'||$cloudSync.phase==='error'} class="account-button" onclick={onAccount} aria-label={!$cloudUser?'Account and cloud save':$cloudSync.phase==='synced'?'Account signed in and progress synchronized':$cloudSync.phase==='conflict'?'Account signed in; cloud save needs attention':'Account signed in; cloud save connecting'} title={!$cloudUser?'Sign in to sync progress':$cloudSync.phase==='synced'?'Signed in · Cloud save synchronized':$cloudSync.phase==='conflict'?'Signed in · Sync needs attention':'Signed in · Cloud save active'}><span aria-hidden="true">{$cloudUser?'☁':'♙'}</span><i aria-hidden="true"></i></button>
  <button class="settings" onclick={onSettings} aria-label="Open settings">⚙</button>
</header>
