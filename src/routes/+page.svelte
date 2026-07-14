<script lang="ts">
  import { onMount } from 'svelte';
  import Board from '$lib/components/Board.svelte'; import Hud from '$lib/components/Hud.svelte'; import Tickets from '$lib/components/Tickets.svelte';
  import { actions, game, initialize, notice, ready } from '$lib/state/game-store';
  let settingsOpen=$state(false), ticketsOpen=$state(false), resetConfirm=$state(false);
  onMount(()=>{initialize();const interval=setInterval(actions.tick,30_000);const focus=()=>actions.tick();addEventListener('focus',focus);return()=>{clearInterval(interval);removeEventListener('focus',focus)}});
</script>
<svelte:head><title>Merge Stack — Legacy Platform Recovery</title><meta name="description" content="A JavaScript-themed merge game." /></svelte:head>
{#if $ready && $game}
  <div class:contrast={$game.settings.highContrast} class:reduced={$game.settings.reducedMotion} class="app">
    <Hud state={$game} onSettings={()=>settingsOpen=true} />
    <main><Board state={$game} /><div class:open={ticketsOpen} class="ticket-drawer"><button class="drawer-handle" onclick={()=>ticketsOpen=!ticketsOpen}>Support Queue <span>{$game.tickets.length} active</span> <b>{ticketsOpen?'↓':'↑'}</b></button><Tickets state={$game} /></div></main>
    <footer><span>BRANCH: <b>recovery/main</b></span><div class="message" aria-live="polite"><i></i>{$notice}</div><span>LOCAL SAVE <b>● SYNCED</b></span></footer>
    {#if settingsOpen}<div class="modal-backdrop" role="presentation" onclick={(e)=>e.target===e.currentTarget&&(settingsOpen=false)}><div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button class="close" onclick={()=>settingsOpen=false}>×</button><small>PREFERENCES</small><h2 id="settings-title">System Settings</h2><label><span><b>Sound hooks</b><small>Interface feedback (browser permitting)</small></span><input type="checkbox" checked={$game.settings.sound} onchange={(e)=>actions.setting('sound',e.currentTarget.checked)} /></label><label><span><b>Reduce motion</b><small>Replace movement with subtle fades</small></span><input type="checkbox" checked={$game.settings.reducedMotion} onchange={(e)=>actions.setting('reducedMotion',e.currentTarget.checked)} /></label><label><span><b>High contrast</b><small>Increase board and text contrast</small></span><input type="checkbox" checked={$game.settings.highContrast} onchange={(e)=>actions.setting('highContrast',e.currentTarget.checked)} /></label>{#if import.meta.env.DEV}<div class="dev"><small>DEVELOPMENT TOOLS</small><button onclick={actions.devEnergy}>Restore energy</button>{#if resetConfirm}<button class="danger" onclick={()=>{actions.reset();resetConfirm=false;settingsOpen=false}}>Confirm fresh save</button>{:else}<button onclick={()=>resetConfirm=true}>Reset local save</button>{/if}</div>{/if}</div></div>{/if}
  </div>
{:else}<div class="loading"><div>MS</div><p>Booting legacy platform…</p></div>{/if}
