<script lang="ts">
  import type { GameState } from '$lib/domain/types';
  import { itemById } from '$lib/catalogs/items';
  import { ticketReady } from '$lib/domain/game';
  import { actions } from '$lib/state/game-store';
  let { state: gameState }: {state:GameState}=$props();
  let resolving=$state<string|null>(null);
  const owned=(id:string)=>gameState.items.filter(i=>i.definitionId===id).length;
  async function resolve(id:string){if(resolving)return;resolving=id;try{await actions.ticket(id)}finally{resolving=null}}
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
      <div class="ticket-foot"><span>◈ {ticket.rewards.credits} &nbsp; ✦ {ticket.rewards.xp} XP</span><button disabled={!ticketReady(gameState,ticket)||resolving!==null} onclick={()=>resolve(ticket.id)}>{resolving===ticket.id?'Closing…':ticketReady(gameState,ticket)?'Resolve':'Gather items'}</button></div>
    </article>
  {/each}
</section>
