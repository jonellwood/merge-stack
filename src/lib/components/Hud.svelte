<script lang="ts">
  import type { GameState } from '$lib/domain/types';
  import { BALANCE } from '$lib/catalogs/balance';
  let { state, onSettings, onRegistry, onEnergyShop, onAccount }: {state:GameState;onSettings:()=>void;onRegistry:()=>void;onEnergyShop:()=>void;onAccount:()=>void}=$props();
  let logoClicks=0, logoTimer:ReturnType<typeof setTimeout>;
  function logoAction(){logoClicks++;clearTimeout(logoTimer);if(logoClicks>=3){logoClicks=0;onRegistry();return}logoTimer=setTimeout(()=>logoClicks=0,700)}
  let progress=$derived(state.player.xp % BALANCE.xpPerLevel);
</script>
<header class="hud">
  <div class="brand"><button class="logo" onclick={logoAction} aria-label="Merge Stack">MS</button><div><strong>Merge Stack</strong><small>legacy platform recovery</small></div></div>
  <div class="stat level"><span>LVL</span><b>{state.player.level}</b><div class="xp"><i style={`width:${progress}%`}></i></div></div>
  <button class="stat energy-stat" onclick={onEnergyShop} aria-label={`Energy ${state.player.energy} of ${state.player.maxEnergy}. Open energy shop.`}><span>ENERGY · RECHARGE</span><b>⚡ {state.player.energy}<small>/{state.player.maxEnergy}</small></b></button>
  <div class="stat"><span>CREDITS</span><b>◈ {state.player.credits}</b></div>
  <button class="account-button" onclick={onAccount} aria-label="Account and cloud save">♙</button>
  <button class="settings" onclick={onSettings} aria-label="Open settings">⚙</button>
</header>
