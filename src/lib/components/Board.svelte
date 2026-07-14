<script lang="ts">
  import type { GameState, BoardItem } from '$lib/domain/types';
  import { itemById } from '$lib/catalogs/items';
  import { actions, notice } from '$lib/state/game-store';
  let { state: gameState }: {state:GameState}=$props();
  let dragging=$state<string|null>(null), over=$state<number|null>(null), selected=$state<string|null>(null), info=$state<string|null>(null);
  const itemAt=(index:number)=>gameState.items.find(i=>i.cellIndex===index);
  const mergeTarget=(index:number)=>{const source=gameState.items.find(i=>i.instanceId===dragging);const target=itemAt(index);return !!source&&!!target&&source.definitionId===target.definitionId&&!!itemById.get(source.definitionId)?.nextItemId};
  function down(event:PointerEvent,item:BoardItem){if(itemById.get(item.definitionId)?.kind==='producer')return;dragging=item.instanceId;info=item.definitionId;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);document.body.classList.add('dragging');}
  function move(event:PointerEvent){if(!dragging)return;const element=document.elementFromPoint(event.clientX,event.clientY)?.closest<HTMLElement>('[data-cell]');over=element?Number(element.dataset.cell):null;}
  async function up(){if(dragging!==null&&over!==null)await actions.move(dragging,over);dragging=null;over=null;document.body.classList.remove('dragging');}
  async function useCell(index:number,item?:BoardItem){
    if(gameState.cells[index].locked){await actions.unlock(index);return}
    if(item&&itemById.get(item.definitionId)?.kind==='producer'){info=item.definitionId;await actions.produce(item.instanceId);return}
    if(selected){if(item?.instanceId===selected){selected=null;$notice='Selection cleared';return}await actions.move(selected,index);selected=null;return}
    if(item){selected=item.instanceId;info=item.definitionId;$notice=`${itemById.get(item.definitionId)?.name} selected. Choose a destination.`}
  }
</script>
<section class="board-wrap" aria-labelledby="board-title">
  <div class="board-heading"><div><span>PRODUCTION</span><h1 id="board-title">Development Environment</h1></div><div class="online"><i></i> SYSTEM ONLINE</div></div>
  <div class="board" role="grid" aria-label="7 by 9 merge board">
    {#each gameState.cells as cell}
      {@const item=itemAt(cell.index)}
      {@const definition=item && itemById.get(item.definitionId)}
      <button class:locked={cell.locked} class:occupied={!!item} class:producer={definition?.kind==='producer'} class:drag-over={over===cell.index} class:merge-over={over===cell.index&&mergeTarget(cell.index)} class:selected={item?.instanceId===selected} class="cell" data-cell={cell.index} role="gridcell" aria-label={cell.locked?`Locked cell, costs ${cell.unlockCost} credits`:item?`${definition?.name}, level ${definition?.level ?? 'producer'}`:`Empty cell ${cell.index+1}`} onclick={()=>useCell(cell.index,item)}>
        {#if cell.locked}<span class="lock">▧<small>{cell.unlockCost}</small></span>
        {:else if item}
          <span role="presentation" class="item" class:being-dragged={dragging===item.instanceId} onpointerdown={(e)=>down(e,item)} onpointermove={move} onpointerup={up} onpointercancel={up}>
            {#if definition?.kind==='producer'}<small class="producer-label">TAP TO COMPILE</small>{/if}
            <strong class:wide={(definition?.icon.length??0)>2}>{definition?.icon}</strong><span>{definition?.name}</span>
            {#if definition?.level}<em>L{definition.level}</em>{:else}<i class="energy-cost">⚡1</i>{/if}
          </span>
        {/if}
      </button>
    {/each}
  </div>
  <div class="selection-help">{selected?'Item selected — choose any unlocked cell to move, merge, or swap.':'Tap the workstation to generate. Drag items together, or select an item then its destination.'}</div>
  {#if info && itemById.get(info)}
    {@const detail=itemById.get(info)!}<aside class="item-info"><span class="info-icon">{detail.icon}</span><div><small>{detail.chainId?.toUpperCase() ?? 'PRODUCER'} {detail.level?`· LEVEL ${detail.level}`:''}</small><b>{detail.name}</b><p>{detail.description}</p></div>{#if detail.nextItemId}<div class="next">MERGES INTO <strong>{itemById.get(detail.nextItemId)?.name}</strong></div>{/if}</aside>
  {/if}
</section>
