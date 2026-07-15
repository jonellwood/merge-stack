<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { GameState } from '$lib/domain/types';
  import { itemById } from '$lib/catalogs/items';
  import { ticketReady } from '$lib/domain/game';
  import { actions } from '$lib/state/game-store';
  let { state: gameState }: {state:GameState}=$props();
  let resolving=$state<string|null>(null);
  let clock=$state(Date.now());
  let readySince=$state<Record<string,number>>({});
  const nudgeDelay=5_000;
  const owned=(id:string)=>gameState.items.filter(i=>i.definitionId===id).length;
  const remaining=(id:string)=>Math.max(0,Math.ceil((nudgeDelay-(clock-(readySince[id]??clock)))/1000));
  async function resolve(id:string){if(resolving)return;resolving=id;try{await actions.ticket(id)}finally{resolving=null}}
  $effect(()=>{
    const statuses=gameState.tickets.map(ticket=>[ticket.id,ticketReady(gameState,ticket)] as const);
    const current=untrack(()=>readySince), next:Record<string,number>={}; let changed=false;
    for(const [id,isReady] of statuses)if(isReady){next[id]=current[id]??Date.now();if(!current[id])changed=true}
    if(Object.keys(current).some(id=>!(id in next)))changed=true;
    if(changed)readySince=next;
  });
  onMount(()=>{const interval=setInterval(()=>clock=Date.now(),1_000);return()=>clearInterval(interval)});
</script>
<section class="tickets" aria-labelledby="tickets-title">
  <div class="panel-title"><div><span>INCOMING</span><h2 id="tickets-title">Support Queue</h2></div><em>{gameState.tickets.length} ACTIVE</em></div>
  {#each gameState.tickets as ticket (ticket.id)}
    <article class:ready={ticketReady(gameState,ticket)}>
      <div class="ticket-head"><div class="avatar">{ticket.requester.slice(0,2).toUpperCase()}</div><div><small>{ticket.requester}</small><h3>{ticket.title}</h3></div></div>
      <p>{ticket.description}</p>
      <div class="requirements">
        {#each ticket.requirements as requirement}
          {@const definition=itemById.get(requirement.itemId)}
          <div class:complete={owned(requirement.itemId)>=requirement.quantity} title={definition?.name}>
            <span class="req-icon">{definition?.icon}</span><b>{definition?.name}</b><small>{Math.min(owned(requirement.itemId),requirement.quantity)}/{requirement.quantity}</small>
          </div>
        {/each}
      </div>
      <div class="ticket-foot"><span>◈ {ticket.rewards.credits} &nbsp; ✦ {ticket.rewards.xp} XP</span><button class:ready-nudge={ticketReady(gameState,ticket)&&remaining(ticket.id)===0} disabled={!ticketReady(gameState,ticket)||resolving!==null} onclick={()=>resolve(ticket.id)}>{resolving===ticket.id?'Closing…':ticketReady(gameState,ticket)?'Resolve':'Gather items'}</button></div>
    </article>
  {/each}
</section>
