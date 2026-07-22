<script lang="ts">
  import { onMount } from 'svelte';
  import AccountDialog from '$lib/components/AccountDialog.svelte'; import Board from '$lib/components/Board.svelte'; import ContentRegistry from '$lib/components/ContentRegistry.svelte'; import EnergyShop from '$lib/components/EnergyShop.svelte'; import Hud from '$lib/components/Hud.svelte'; import Tickets from '$lib/components/Tickets.svelte';
  import { cloudUser, initializeCloudAuth } from '$lib/cloud/account-store';
  import { inspectCloudState } from '$lib/cloud/sync-manager';
  import { saveGame } from '$lib/persistence/db';
  import { isNativeApp } from '$lib/platform';
  import { ticketReady } from '$lib/domain/game';
  import { actions, game, initialize, notice, ready } from '$lib/state/game-store';
  let settingsOpen=$state(false), ticketsOpen=$state(false), registryOpen=$state(false), energyShopOpen=$state(false), accountOpen=$state(false), resetConfirm=$state(false);
  let celebration=$state(0);
  const native=isNativeApp();
  const confetti=Array.from({length:30},(_,index)=>({left:4+(index*37)%92,drift:(index*53)%180-90,delay:(index%8)*.045,duration:1.65+(index%5)*.16,color:['#45e5d0','#5b8cff','#ffc760','#ff6f91','#f7f9ff'][index%5],spin:index%2?'540deg':'-540deg'}));
  onMount(()=>{
    initialize();let lastLevel:number|null=null;let celebrationTimer:ReturnType<typeof setTimeout>;let disposeCloud:(()=>void)|undefined;let currentUserId:string|undefined,latestState:import('$lib/domain/types').GameState|null=null,coordinatedUser:string|undefined;
    async function coordinate(){if(!currentUserId||!latestState||coordinatedUser===currentUserId)return;coordinatedUser=currentUserId;const cloudState=await inspectCloudState(currentUserId,latestState);if(cloudState){game.set(cloudState);await saveGame(cloudState)}}
    if(!native)initializeCloudAuth().then(dispose=>disposeCloud=dispose);
    const unsubscribeUser=native?()=>{}:cloudUser.subscribe(user=>{currentUserId=user?.id;if(!user)coordinatedUser=undefined;coordinate()});
    const unsubscribe=game.subscribe(state=>{latestState=state;coordinate();if(!state)return;if(lastLevel!==null&&state.player.level>lastLevel){celebration=state.player.level;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>celebration=0,2_800)}lastLevel=state.player.level});
    const interval=setInterval(actions.tick,30_000);const focus=()=>actions.tick();addEventListener('focus',focus);return()=>{disposeCloud?.();unsubscribeUser();clearTimeout(celebrationTimer);unsubscribe();clearInterval(interval);removeEventListener('focus',focus)}
  });
</script>
<svelte:head><title>Merge Stack — Legacy Platform Recovery</title><meta name="description" content="A JavaScript-themed merge game." /><meta property="og:title" content="Merge Stack" /><meta property="og:description" content="Rebuild an ancient software platform one merge at a time." /><meta property="og:image" content="/ms-full.png" /><meta property="og:type" content="website" /></svelte:head>
{#if $ready && $game}
  {@const readyTickets=$game.tickets.filter(ticket=>ticketReady($game,ticket)).length}
  <div class:contrast={$game.settings.highContrast} class:reduced={$game.settings.reducedMotion} class="app">
    {#if celebration}
      <div class="celebration" aria-live="polite"><div class="level-banner"><small>DEPLOYMENT MILESTONE</small><strong>Level {celebration}!</strong></div>{#each confetti as piece}<i aria-hidden="true" style={`--left:${piece.left}%;--drift:${piece.drift}px;--delay:${piece.delay}s;--duration:${piece.duration}s;--color:${piece.color};--spin:${piece.spin}`}></i>{/each}</div>
    {/if}
    <Hud state={$game} onSettings={()=>settingsOpen=true} onRegistry={()=>registryOpen=true} onEnergyShop={()=>energyShopOpen=true} onAccount={()=>accountOpen=true} />
    <main><Board state={$game} /><div class:open={ticketsOpen} class="ticket-drawer"><button class:has-ready={readyTickets>0&&!ticketsOpen} class="drawer-handle" onclick={()=>ticketsOpen=!ticketsOpen} aria-label={`Support Queue, ${readyTickets>0?`${readyTickets} ready`:`${$game.tickets.length} active`}`}><span class="drawer-title">Support Queue</span><span class="drawer-count" aria-live="polite">{readyTickets>0?`${readyTickets} ready`:`${$game.tickets.length} active`}</span><b>{ticketsOpen?'↓':'↑'}</b></button><Tickets state={$game} /></div></main>
    <footer><span>BRANCH: <b>recovery/main</b></span><div class="message" aria-live="polite"><i></i>{$notice}</div><span>LOCAL SAVE <b>● SYNCED</b></span></footer>
    {#if registryOpen}<ContentRegistry state={$game} onClose={()=>registryOpen=false} />{/if}
    {#if energyShopOpen}<EnergyShop state={$game} onClose={()=>energyShopOpen=false} />{/if}
    {#if accountOpen&&!native}<AccountDialog onClose={()=>accountOpen=false} />{/if}
    {#if settingsOpen}<div class="modal-backdrop" role="presentation" onclick={(e)=>e.target===e.currentTarget&&(settingsOpen=false)}><div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button class="close" onclick={()=>settingsOpen=false}>×</button><small>PREFERENCES</small><h2 id="settings-title">System Settings</h2><label><span><b>Sound hooks</b><small>Interface feedback (browser permitting)</small></span><input type="checkbox" checked={$game.settings.sound} onchange={(e)=>actions.setting('sound',e.currentTarget.checked)} /></label><label><span><b>Reduce motion</b><small>Replace movement with subtle fades</small></span><input type="checkbox" checked={$game.settings.reducedMotion} onchange={(e)=>actions.setting('reducedMotion',e.currentTarget.checked)} /></label><label><span><b>High contrast</b><small>Increase board and text contrast</small></span><input type="checkbox" checked={$game.settings.highContrast} onchange={(e)=>actions.setting('highContrast',e.currentTarget.checked)} /></label>{#if import.meta.env.DEV}<div class="dev"><small>DEVELOPMENT TOOLS</small><button onclick={actions.devEnergy}>Restore energy</button>{#if resetConfirm}<button class="danger" onclick={()=>{actions.reset();resetConfirm=false;settingsOpen=false}}>Confirm fresh save</button>{:else}<button onclick={()=>resetConfirm=true}>Reset local save</button>{/if}</div>{/if}</div></div>{/if}
  </div>
{:else}<div class="loading"><div>MS</div><p>Booting legacy platform…</p></div>{/if}
