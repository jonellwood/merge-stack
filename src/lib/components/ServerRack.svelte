<script lang="ts">
  import { BALANCE } from '$lib/catalogs/balance';
  import { itemById } from '$lib/catalogs/items';
  import { rackExpansionQuote, rackItemSize, rackUsed } from '$lib/domain/game';
  import { actions } from '$lib/state/game-store';
  import type { GameState } from '$lib/domain/types';

  let { state, onClose }: {state:GameState;onClose:()=>void}=$props();
  let used=$derived(rackUsed(state));
  let quote=$derived(rackExpansionQuote(state));
  let boardHasSpace=$derived(state.cells.some(cell=>!cell.locked&&!state.items.some(item=>item.cellIndex===cell.index)));
  let stored=$derived([...state.serverRack.items].sort((a,b)=>rackItemSize(b.definitionId)-rackItemSize(a.definitionId)||a.storedAt-b.storedAt));
</script>

<div class="rack-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&onClose()}>
  <div class="rack-dialog" role="dialog" aria-modal="true" aria-labelledby="rack-title">
    <header><div><small>OFF-BOARD STORAGE · LEVEL {BALANCE.serverRackUnlockLevel}</small><h2 id="rack-title">Server Rack</h2><p>Stored equipment is safe, but cannot merge or close tickets.</p></div><button onclick={onClose} aria-label="Close Server Rack">×</button></header>
    <div class="rack-summary"><div><span>CAPACITY</span><strong>{used}U <small>/ {state.serverRack.capacity}U</small></strong></div><div><span>AVAILABLE</span><strong>{state.serverRack.capacity-used}U</strong></div><div><span>MOUNTED</span><strong>{state.serverRack.items.length}</strong></div></div>
    <div class="rack-chassis" style={`--rack-units:${state.serverRack.capacity}`}>
      <div class="rack-rails" aria-hidden="true">{#each Array(state.serverRack.capacity) as _,index}<i><span>{String(index+1).padStart(2,'0')}U</span></i>{/each}</div>
      <div class="rack-equipment">
        {#each stored as item}
          {@const definition=itemById.get(item.definitionId)!}{@const size=rackItemSize(item.definitionId)}
          <article style={`--item-u:${size}`}><span class="rack-item-icon">{definition.icon}</span><div><small>{size}U · L{definition.level}</small><b>{definition.name}</b><em>{definition.chainId}</em></div><button disabled={!boardHasSpace} onclick={()=>actions.retrieve(item.instanceId)}>{boardHasSpace?'RETURN':'BOARD FULL'}</button></article>
        {/each}
        {#if !stored.length}<div class="rack-empty"><span>▥</span><b>RACK AVAILABLE</b><small>Select an item on the board, then choose STORE.</small></div>{/if}
      </div>
    </div>
    <footer><div><span>{quote.full?'MAXIMUM CAPACITY':`NEXT EXPANSION · +${quote.increase}U`}</span><small>{quote.full?'All rack bays installed.':`Permanent storage upgrade · ◈ ${quote.cost}`}</small></div><button disabled={quote.full||state.player.credits<quote.cost} onclick={()=>actions.expandRack()}>{quote.full?'FULLY EXPANDED':state.player.credits<quote.cost?`NEED ◈ ${quote.cost}`:`EXPAND · ◈ ${quote.cost}`}</button></footer>
  </div>
</div>
