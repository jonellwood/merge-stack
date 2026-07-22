<script lang="ts">
  import type { GameState } from '$lib/domain/types';
  import { bugItems, hackathonItems, itemById, itemCatalog, javascriptItems, serverItems } from '$lib/catalogs/items';
  import { ticketRewards, ticketTemplates } from '$lib/catalogs/tickets';
  let { state: gameState, onClose }: {state:GameState;onClose:()=>void}=$props();
  let tab=$state<'paths'|'items'|'queue'|'templates'>('paths');
  const chains=[{name:'JavaScript',items:javascriptItems},{name:'Production Bugs',items:bugItems},{name:'Server Infrastructure',items:serverItems},{name:'Hackathon Weekend',items:hackathonItems}];
</script>
<div class="registry-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&onClose()}>
  <div class="registry" role="dialog" aria-modal="true" aria-labelledby="registry-title">
    <header><div><small>INTERNAL TOOLING · READ ONLY</small><h2 id="registry-title">Content Registry</h2><p>Catalog visibility today. CRUD controls tomorrow.</p></div><button onclick={onClose} aria-label="Close content registry">×</button></header>
    <nav aria-label="Registry sections">
      <button class:active={tab==='paths'} onclick={()=>tab='paths'}>Merge paths</button><button class:active={tab==='items'} onclick={()=>tab='items'}>All items <em>{itemCatalog.length}</em></button><button class:active={tab==='queue'} onclick={()=>tab='queue'}>Active queue <em>{gameState.tickets.length}</em></button><button class:active={tab==='templates'} onclick={()=>tab='templates'}>Ticket catalog <em>{ticketTemplates.length}</em></button>
    </nav>
    <div class="registry-body">
      {#if tab==='paths'}
        {#each chains as chain}<article class="chain"><div class="chain-title"><span>{chain.name.slice(0,2).toUpperCase()}</span><div><small>MERGE CHAIN</small><h3>{chain.name}</h3></div><em>{chain.items.length} LEVELS</em></div><div class="chain-path">{#each chain.items as item,index}<div class="path-item"><span>{item.icon}</span><small>L{item.level}</small><b>{item.name}</b><code>{item.id}</code></div>{#if index<chain.items.length-1}<i>›</i>{/if}{/each}</div></article>{/each}
      {:else if tab==='items'}
        <div class="registry-table"><div class="table-head"><span>ITEM</span><span>TYPE / CHAIN</span><span>LEVEL</span><span>MERGES INTO</span></div>{#each itemCatalog as item}<div class="table-row"><span class="item-name"><i>{item.icon}</i><span><b>{item.name}</b><code>{item.id}</code></span></span><span>{item.kind}<small>{item.chainId??'—'}</small></span><span>{item.level??'—'}</span><span>{item.nextItemId?itemById.get(item.nextItemId)?.name:'MAX / N/A'}</span></div>{/each}</div>
      {:else if tab==='queue'}
        <div class="registry-cards">{#each gameState.tickets as ticket}<article><div class="status-dot"></div><small>{ticket.requester} · ACTIVE</small><h3>{ticket.title}</h3><p>{ticket.description}</p><div class="registry-req">{#each ticket.requirements as req}<span><i>{itemById.get(req.itemId)?.icon}</i>{req.quantity} × {itemById.get(req.itemId)?.name}</span>{/each}</div><footer><code>{ticket.id.slice(0,8)}…</code><b>◈ {ticket.rewards.credits} &nbsp; ✦ {ticket.rewards.xp} XP {#if ticket.rewards.energy}&nbsp; ⚡ {ticket.rewards.energy}{/if}</b></footer></article>{/each}</div>
      {:else}
        <div class="registry-cards templates">{#each ticketTemplates as template}{@const rewards=ticketRewards(template)}<article><small>{template.requester}</small><h3>{template.title}</h3><code>{template.id}</code><p>{template.description}</p><div class="registry-req">{#each template.requirements as req}<span><i>{itemById.get(req.itemId)?.icon}</i>{req.quantity} × {itemById.get(req.itemId)?.name}</span>{/each}</div><footer><span>CALCULATED REWARD</span><b>◈ {rewards.credits} &nbsp; ✦ {rewards.xp} XP {#if rewards.energy}&nbsp; ⚡ {rewards.energy}{/if}</b></footer></article>{/each}</div>
      {/if}
    </div>
  </div>
</div>
