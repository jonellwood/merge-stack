<script lang="ts">
  import { onMount, tick as nextFrame } from 'svelte';
  import AccountDialog from '$lib/components/AccountDialog.svelte'; import BadgeCabinet from '$lib/components/BadgeCabinet.svelte'; import Board from '$lib/components/Board.svelte'; import ContentRegistry from '$lib/components/ContentRegistry.svelte'; import EnergyShop from '$lib/components/EnergyShop.svelte'; import Hud from '$lib/components/Hud.svelte'; import SplashScreen from '$lib/components/SplashScreen.svelte'; import Tickets from '$lib/components/Tickets.svelte';
  import { ANNOUNCEMENTS, type Announcement } from '$lib/catalogs/announcements';
  import { getUnseenAnnouncements } from '$lib/persistence/announcements';
  import { cloudUser, initializeCloudAuth } from '$lib/cloud/account-store';
  import { cloudSync, inspectCloudState, resetCloudSync, watchCloudSave } from '$lib/cloud/sync-manager';
  import { checkpointSave, loadSave, saveGame, watchLocalSaves } from '$lib/persistence/db';
  import { isNativeApp } from '$lib/platform';
  import { findMergeHint, ticketReady } from '$lib/domain/game';
  import { actions, game, initialize, notice, ready, storageRecovery } from '$lib/state/game-store';
  let settingsOpen=$state(false), ticketsOpen=$state(false), registryOpen=$state(false), energyShopOpen=$state(false), accountOpen=$state(false), badgesOpen=$state(false), resetConfirm=$state(false);
  let celebration=$state(0);
  let celebrationTitle=$state<string|null>(null);
  let splashChecked=$state(false);
  let splashAnnouncement=$state<Announcement|null>(null);
  let idleMergeHints=$state<string[]>([]);
  const native=isNativeApp();
  const confetti=Array.from({length:30},(_,index)=>({left:4+(index*37)%92,drift:(index*53)%180-90,delay:(index%8)*.045,duration:1.65+(index%5)*.16,color:['#45e5d0','#5b8cff','#ffc760','#ff6f91','#f7f9ff'][index%5],spin:index%2?'540deg':'-540deg'}));
  $effect(()=>{if($ready&&!splashChecked){splashChecked=true;const unseen=getUnseenAnnouncements();splashAnnouncement=unseen.at(-1)??null}});
  $effect(()=>{if(!native&&$cloudUser&&($cloudSync.phase==='choice'||$cloudSync.phase==='conflict'))accountOpen=true});
  onMount(()=>{
    void initialize();let lastLevel:number|null=null;let lastTitle:string|null=null;let celebrationTimer:ReturnType<typeof setTimeout>;let idleTimer:ReturnType<typeof setTimeout>;let disposeCloud:(()=>void)|undefined,disposeLive=()=>{};let currentUserId:string|undefined,latestState:import('$lib/domain/types').GameState|null=null,coordinatedUser:string|undefined,reconcilePromise:Promise<void>|undefined;
    async function reconcile(announce=false){if(native||!currentUserId||!latestState)return;if(reconcilePromise)return reconcilePromise;reconcilePromise=(async()=>{const cloudState=await inspectCloudState(currentUserId!,latestState!);if(cloudState){await checkpointSave(latestState!,'before-cloud-pull');game.set(cloudState);await saveGame(cloudState,'cloud-pull');if(announce)notice.set('Progress updated from another device.')}})().finally(()=>reconcilePromise=undefined);return reconcilePromise}
    async function coordinate(){if(!currentUserId||!latestState||coordinatedUser===currentUserId)return;coordinatedUser=currentUserId;await reconcile()}
    const blocked=()=>!!(splashAnnouncement||settingsOpen||registryOpen||energyShopOpen||accountOpen||badgesOpen);
    async function idleAssist(){
      if(document.hidden||blocked()||!latestState||!latestState.settings.hints){idleTimer=setTimeout(idleAssist,1_000);return}
      const ready=latestState.tickets.find(ticket=>ticketReady(latestState!,ticket));
      if(ready){
        ticketsOpen=true;await nextFrame();
        const ticket=[...document.querySelectorAll<HTMLElement>('[data-ticket-id]')].find(element=>element.dataset.ticketId===ready.id);
        ticket?.scrollIntoView({behavior:latestState.settings.reducedMotion?'auto':'smooth',block:'center'});
      }else idleMergeHints=findMergeHint(latestState)??[];
    }
    function resetIdle(){clearTimeout(idleTimer);idleMergeHints=[];idleTimer=setTimeout(idleAssist,5_000)}
    const interactionEvents=['pointerdown','keydown','wheel'] as const;
    for(const event of interactionEvents)addEventListener(event,resetIdle,{passive:true});
    const foreground=()=>{if(document.hidden)return;resetIdle();void reconcile(true).then(()=>actions.tick())};document.addEventListener('visibilitychange',foreground);addEventListener('pageshow',foreground);addEventListener('online',foreground);
    resetIdle();
    if(!native)initializeCloudAuth().then(dispose=>disposeCloud=dispose);
    const unsubscribeUser=native?()=>{}:cloudUser.subscribe(user=>{disposeLive();disposeLive=()=>{};currentUserId=user?.id;if(!user){coordinatedUser=undefined;resetCloudSync();return}disposeLive=watchCloudSave(user.id,()=>void reconcile(true));void coordinate()});
    const unsubscribe=game.subscribe(state=>{latestState=state;coordinate();if(!state)return;if(lastLevel!==null&&state.player.level>lastLevel){celebration=state.player.level;celebrationTitle=lastTitle!==null&&lastTitle!==state.player.title?state.player.title:null;clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>{celebration=0;celebrationTitle=null},2_800)}lastLevel=state.player.level;lastTitle=state.player.title});
    const disposeLocal=watchLocalSaves(async updatedAt=>{if(!latestState||updatedAt<=latestState.updatedAt)return;const saved=await loadSave().catch(()=>undefined);if(saved&&saved.updatedAt>latestState.updatedAt){game.set(saved);notice.set('Progress updated from another open tab.')}});
    const interval=setInterval(actions.tick,30_000),cloudPoll=setInterval(()=>{if(!document.hidden)void reconcile()},60_000);addEventListener('focus',foreground);return()=>{disposeCloud?.();disposeLive();disposeLocal();unsubscribeUser();clearTimeout(celebrationTimer);clearTimeout(idleTimer);unsubscribe();clearInterval(interval);clearInterval(cloudPoll);removeEventListener('focus',foreground);removeEventListener('pageshow',foreground);removeEventListener('online',foreground);for(const event of interactionEvents)removeEventListener(event,resetIdle);document.removeEventListener('visibilitychange',foreground)}
  });
</script>
<svelte:head><title>Merge Stack — Legacy Platform Recovery</title><meta name="description" content="A JavaScript-themed merge game." /><meta property="og:title" content="Merge Stack" /><meta property="og:description" content="Rebuild an ancient software platform one merge at a time." /><meta property="og:image" content="/ms-full.png" /><meta property="og:type" content="website" /></svelte:head>
{#if $ready && $game}
  {@const readyTickets=$game.tickets.filter(ticket=>ticketReady($game,ticket)).length}
  <div class:contrast={$game.settings.highContrast} class:reduced={$game.settings.reducedMotion} class={`app theme-${$game.settings.appearance}`}>
    {#if celebration}
      <div class="celebration" aria-live="polite"><div class="level-banner" class:promoted={celebrationTitle!==null}><small>{celebrationTitle?'PROMOTION':'DEPLOYMENT MILESTONE'}</small><strong>Level {celebration}!</strong>{#if celebrationTitle}<span class="promotion-title">Promoted to {celebrationTitle}</span>{/if}</div>{#each confetti as piece}<i aria-hidden="true" style={`--left:${piece.left}%;--drift:${piece.drift}px;--delay:${piece.delay}s;--duration:${piece.duration}s;--color:${piece.color};--spin:${piece.spin}`}></i>{/each}</div>
    {/if}
    {#if splashAnnouncement}<SplashScreen announcement={splashAnnouncement} onClose={()=>splashAnnouncement=null} />{/if}
    <Hud state={$game} onSettings={()=>settingsOpen=true} onRegistry={()=>registryOpen=true} onEnergyShop={()=>energyShopOpen=true} onAccount={()=>accountOpen=true} onAchievements={()=>badgesOpen=true} />
    <main><Board state={$game} hintedItemIds={idleMergeHints} /><div class:open={ticketsOpen} class="ticket-drawer"><button class:has-ready={readyTickets>0&&!ticketsOpen} class="drawer-handle" onclick={()=>ticketsOpen=!ticketsOpen} aria-label={`Support Queue, ${readyTickets>0?`${readyTickets} ready`:`${$game.tickets.length} active`}`}><span class="drawer-title">Support Queue</span><span class="drawer-count" aria-live="polite">{readyTickets>0?`${readyTickets} ready`:`${$game.tickets.length} active`}</span><b>{ticketsOpen?'↓':'↑'}</b></button><Tickets state={$game} /></div></main>
    <footer><span>BRANCH: <b>recovery/main</b></span><div class="message" aria-live="polite"><i></i>{$notice}</div><span>LOCAL SAVE <b>● SYNCED</b></span></footer>
    {#if registryOpen}<ContentRegistry state={$game} onClose={()=>registryOpen=false} />{/if}
    {#if badgesOpen}<BadgeCabinet state={$game} onClose={()=>badgesOpen=false} />{/if}
    {#if energyShopOpen}<EnergyShop state={$game} onClose={()=>energyShopOpen=false} />{/if}
    {#if accountOpen&&!native}<AccountDialog onClose={()=>accountOpen=false} />{/if}
    {#if settingsOpen}
      <div class="modal-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(settingsOpen=false)}>
        <div class="modal settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <button class="close" onclick={()=>settingsOpen=false}>×</button><small>PREFERENCES</small><h2 id="settings-title">System Settings</h2>
          <fieldset class="appearance-settings"><legend>DISPLAY BRIGHTNESS</legend>
            {#each [{id:'dark',name:'Dark Mode',note:'The one true default'},{id:'less-dark',name:'Less Dark Mode',note:'A little more signal'},{id:'not-as-dark',name:'Not as Dark Mode',note:'Daylight is acknowledged'},{id:'dark-lite',name:'Dark Mode Lite',note:'Practically HR compliant'}] as theme}
              <button class:active={$game.settings.appearance===theme.id} aria-pressed={$game.settings.appearance===theme.id} onclick={()=>actions.setting('appearance',theme.id as import('$lib/domain/types').AppearanceTheme)}><span><b>{theme.name}</b><small>{theme.note}</small></span><i aria-hidden="true"></i></button>
            {/each}
          </fieldset>
          <label><span><b>Sound hooks</b><small>Interface feedback (browser permitting)</small></span><input type="checkbox" checked={$game.settings.sound} onchange={(event)=>actions.setting('sound',event.currentTarget.checked)} /></label>
          <label><span><b>Reduce motion</b><small>Replace movement with subtle fades</small></span><input type="checkbox" checked={$game.settings.reducedMotion} onchange={(event)=>actions.setting('reducedMotion',event.currentTarget.checked)} /></label>
          <label><span><b>High contrast</b><small>Increase board and text contrast</small></span><input type="checkbox" checked={$game.settings.highContrast} onchange={(event)=>actions.setting('highContrast',event.currentTarget.checked)} /></label>
          <label><span><b>Idle hints</b><small>Surface ready tickets and mergeable pairs after five seconds</small></span><input type="checkbox" checked={$game.settings.hints} onchange={(event)=>actions.setting('hints',event.currentTarget.checked)} /></label>
          <button class="badge-settings" onclick={()=>{settingsOpen=false;badgesOpen=true}}>🏅 Badge Cabinet <span>{Object.keys($game.achievements).length} EARNED</span></button>
          <div class="save-file-actions"><button class="backup-settings" onclick={actions.exportSave}>⇩ Download save backup <span>JSON</span></button><label class="backup-settings">⇧ Restore save backup <span>JSON</span><input type="file" accept="application/json,.json" onchange={event=>{actions.importSave(event.currentTarget.files?.[0]);event.currentTarget.value=''}} /></label></div>
          {#if import.meta.env.DEV}<div class="dev"><small>DEVELOPMENT TOOLS</small><button onclick={actions.devEnergy}>Restore energy</button><button onclick={()=>splashAnnouncement=ANNOUNCEMENTS.at(-1)??null}>View release</button>{#if resetConfirm}<button class="danger" onclick={()=>{actions.reset();resetConfirm=false;settingsOpen=false}}>Confirm fresh save</button>{:else}<button onclick={()=>resetConfirm=true}>Reset local save</button>{/if}</div>{/if}
        </div>
      </div>
    {/if}
    {#if $storageRecovery.required}<div class="recovery-backdrop"><div class="recovery-dialog" role="alertdialog" aria-modal="true" aria-labelledby="recovery-title"><div class="recovery-icon">⛑</div><small>SAVE PROTECTION</small><h2 id="recovery-title">Local storage needs attention</h2><p>{$storageRecovery.message} Merge Stack has paused gameplay instead of replacing your progress.</p>{#if $storageRecovery.backups.length}<div class="recovery-backups">{#each $storageRecovery.backups as backup}<button onclick={()=>actions.restoreBackup(backup)}><b>Restore level {backup.state.player.level}</b><span>{new Date(backup.savedAt).toLocaleString()} · {backup.reason}</span></button>{/each}</div>{/if}<button class="maintenance-primary" onclick={actions.retryStorage}>Retry local storage</button>{#if resetConfirm}<button class="recovery-danger" onclick={()=>{resetConfirm=false;actions.startFreshAfterRecovery()}}>Confirm: discard recovery options</button>{:else}<button class="recovery-secondary" onclick={()=>resetConfirm=true}>Start a new game instead</button>{/if}</div></div>{/if}
    {#if settingsOpen}<a class="privacy-settings" href="/privacy.html" target="_blank" rel="noreferrer">Privacy Policy <span>↗</span></a>{/if}
  </div>
{:else}<div class="loading"><div>MS</div><p>Booting legacy platform…</p></div>{/if}
