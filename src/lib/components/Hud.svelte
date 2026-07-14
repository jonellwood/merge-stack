<script lang="ts">
  import type { GameState } from '$lib/domain/types';
  import { BALANCE } from '$lib/catalogs/balance';
  let { state, onSettings }: {state:GameState;onSettings:()=>void}=$props();
  let progress=$derived(state.player.xp % BALANCE.xpPerLevel);
</script>
<header class="hud">
  <div class="brand"><span class="logo">MS</span><div><strong>Merge Stack</strong><small>legacy platform recovery</small></div></div>
  <div class="stat level"><span>LVL</span><b>{state.player.level}</b><div class="xp"><i style={`width:${progress}%`}></i></div></div>
  <div class="stat"><span>ENERGY</span><b>⚡ {state.player.energy}<small>/{state.player.maxEnergy}</small></b></div>
  <div class="stat"><span>CREDITS</span><b>◈ {state.player.credits}</b></div>
  <button class="settings" onclick={onSettings} aria-label="Open settings">⚙</button>
</header>
