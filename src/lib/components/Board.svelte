<script lang="ts">
  import { onMount } from 'svelte';
  import type { GameState, BoardItem } from '$lib/domain/types';
  import { itemById } from '$lib/catalogs/items';
  import { BALANCE } from '$lib/catalogs/balance';
  import ServerRack from './ServerRack.svelte';
  import { producerByItemId } from '$lib/catalogs/producers';
import { HACKATHON_EVENT, HACKATHON_REDEMPTION } from '$lib/catalogs/events';
import { discardQuote, itemsContributingToTicket, hackathonCashoutQuote, rackItemSize, rackUsed, tidyQuote } from '$lib/domain/game';
  import { actions, notice } from '$lib/state/game-store';
  let { state: gameState, hintedItemIds=[] }: {state:GameState;hintedItemIds?:string[]}=$props();
  let dragging=$state<string|null>(null), over=$state<number|null>(null), overTrash=$state(false), selected=$state<string|null>(null), info=$state<string|null>(null),movingGenerator=$state<string|null>(null);
  let energyWarning=$state(0);
  let clock=$state(Date.now());
  let redemption=$state<string|null>(null),lastTapItem=$state<string|null>(null),lastTapAt=$state(0);
  let hackathonPayout=$state(false),tidyConfirm=$state(false),capacityPrompt=$state(false),rackOpen=$state(false),rackConfirm=$state(false),rewardSplash=$state<{icon:string;title:string;detail:string}|null>(null);
  let energyWarningTimer:ReturnType<typeof setTimeout>;
  let rewardTimer:ReturnType<typeof setTimeout>;
  let ticketItemIds=$derived(new Set(gameState.tickets.flatMap(ticket=>itemsContributingToTicket(gameState,ticket).map(item=>item.instanceId))));
  let hackathonQuote=$derived(hackathonCashoutQuote(gameState));
  let selectedDiscard=$derived(selected?discardQuote(gameState,selected):undefined);
  let nextLockedCell=$derived(gameState.cells.find(cell=>cell.locked&&!gameState.items.some(item=>item.cellIndex===cell.index)));
  let freeCells=$derived(gameState.cells.filter(cell=>!cell.locked&&!gameState.items.some(item=>item.cellIndex===cell.index)).length);
  let rackUsage=$derived(rackUsed(gameState));
  let currentTidyQuote=$derived(tidyQuote(gameState,clock));
  let selectedDefinition=$derived(selected?itemById.get(gameState.items.find(item=>item.instanceId===selected)?.definitionId??''):undefined);
  onMount(()=>{const timer=setInterval(()=>clock=Date.now(),1_000);return()=>{clearInterval(timer);clearTimeout(rewardTimer)}});
  function duration(ms:number){const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`}
  function producerLabel(item:BoardItem,producer:NonNullable<ReturnType<typeof producerByItemId.get>>){
    if(producer.activeFrom!==undefined&&clock<producer.activeFrom)return 'SOON';
    if(producer.activeUntil!==undefined&&clock>=producer.activeUntil)return producer.itemId==='event_pipeline'&&hackathonQuote.items?`CASH OUT · ${hackathonQuote.items}`:'ENDED';
    const coolingUntil=item.state?.cooldownUntil;
    if(coolingUntil&&clock<coolingUntil)return `↻ ${duration(coolingUntil-clock)}`;
    if(gameState.player.energy<producer.energyCost)return 'NO ENERGY';
    if(producer.burstCapacity){const remaining=coolingUntil&&clock>=coolingUntil?producer.burstCapacity:(item.state?.activationsRemaining??producer.burstCapacity);return `DEPLOY · ${remaining}/${producer.burstCapacity}`}
    return producer.actionLabel.replace(/^TAP TO /,'');
  }
  function showEnergyWarning(){clearTimeout(energyWarningTimer);energyWarning++;energyWarningTimer=setTimeout(()=>energyWarning=0,2_600)}
  const itemAt=(index:number)=>gameState.items.find(i=>i.cellIndex===index);
  const mergeTarget=(index:number)=>{const source=gameState.items.find(i=>i.instanceId===dragging);const target=itemAt(index);return !!source&&!!target&&source.definitionId===target.definitionId&&!!itemById.get(source.definitionId)?.nextItemId};
  function down(event:PointerEvent,item:BoardItem){if(itemById.get(item.definitionId)?.kind==='producer')return;dragging=item.instanceId;info=item.definitionId;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);document.body.classList.add('dragging');}
  function move(event:PointerEvent){if(!dragging)return;const point=document.elementFromPoint(event.clientX,event.clientY);overTrash=!!point?.closest('[data-trash]');const element=point?.closest<HTMLElement>('[data-cell]');over=overTrash?null:element?Number(element.dataset.cell):null;}
  async function recycle(itemId:string){const quote=discardQuote(gameState,itemId);if(!quote)return;const actual=quote.kind==='energy'?Math.min(quote.amount,gameState.player.maxEnergy-gameState.player.energy):quote.amount;if(await actions.discard(itemId)){selected=null;rewardSplash=quote.kind==='none'?{icon:'♻',title:'Item recycled',detail:'No salvage value at levels 1–3'}:{icon:quote.kind==='energy'?'⚡':'◈',title:`+${actual} ${quote.kind}`,detail:'Salvage recovered'};clearTimeout(rewardTimer);rewardTimer=setTimeout(()=>rewardSplash=null,2_200)}}
  async function collectHackathon(){const credits=hackathonQuote.credits;if(await actions.cashoutHackathon()){hackathonPayout=false;rewardSplash={icon:'◈',title:`+${credits} credits`,detail:'Hackathon items archived'};clearTimeout(rewardTimer);rewardTimer=setTimeout(()=>rewardSplash=null,2_500)}}
  async function storeSelected(){if(!selected)return;const stored=await actions.store(selected);if(stored)selected=null;rackConfirm=false;rackOpen=true}
  async function runTidy(){const cost=currentTidyQuote.cost;if(await actions.tidy()){tidyConfirm=false;rewardSplash={icon:'✓',title:'Board tidied',detail:`Service fee · ${cost} credits`};clearTimeout(rewardTimer);rewardTimer=setTimeout(()=>rewardSplash=null,2_200)}}
  function useRack(){if(!selected){rackOpen=true;return}const reserved=ticketItemIds.has(selected),topLevel=!selectedDefinition?.nextItemId;if(reserved||topLevel){rackConfirm=true;return}storeSelected()}
  async function up(){if(dragging!==null){if(overTrash)await recycle(dragging);else if(over!==null)await actions.move(dragging,over)}dragging=null;over=null;overTrash=false;document.body.classList.remove('dragging');}
  async function useCell(index:number,item?:BoardItem){
    if(movingGenerator){
      if(item?.instanceId===movingGenerator){movingGenerator=null;$notice='Generator move cancelled';return}
      if(gameState.cells[index].locked){$notice='Choose an unlocked cell for the generator';return}
      if(item){$notice='Choose an empty cell for the generator';return}
      if(await actions.moveGenerator(movingGenerator,index)){movingGenerator=null;selected=null}
      return
    }
    if(gameState.cells[index].locked){await actions.unlock(index);return}
    if(item&&itemById.get(item.definitionId)?.kind==='producer'){
      info=item.definitionId;
      if(item.definitionId==='event_pipeline'&&clock>=HACKATHON_EVENT.endsAt&&hackathonQuote.items){hackathonPayout=true;return}
      if(!gameState.cells.some(cell=>!cell.locked&&!gameState.items.some(candidate=>candidate.cellIndex===cell.index))){capacityPrompt=true;return}
      const producer=producerByItemId.get(item.definitionId);
      const produced=await actions.produce(item.instanceId);
      if(!produced&&producer&&gameState.player.energy<producer.energyCost)showEnergyWarning();
      return
    }
    if(item?.definitionId===HACKATHON_REDEMPTION.itemId&&clock<HACKATHON_EVENT.endsAt){
      const now=Date.now();
      if(lastTapItem===item.instanceId&&now-lastTapAt<500){redemption=item.instanceId;selected=null;lastTapItem=null;lastTapAt=0;return}
      lastTapItem=item.instanceId;lastTapAt=now;
    }else{lastTapItem=null;lastTapAt=0}
    if(selected){if(item?.instanceId===selected){selected=null;$notice='Selection cleared';return}await actions.move(selected,index);selected=null;return}
    if(item){selected=item.instanceId;info=item.definitionId;$notice=`${itemById.get(item.definitionId)?.name} selected. Choose a destination.`}
  }
</script>
<section class="board-wrap" aria-labelledby="board-title">
  {#key energyWarning}{#if energyWarning>0}<div class="energy-warning" role="status"><b>⚡ Energy depleted</b><span>Workstation paused · +1 energy every 2 minutes</span></div>{/if}{/key}
  <div class="board-heading"><div><span>PRODUCTION</span><h1 id="board-title">Development Environment</h1></div><div class="board-actions">{#if freeCells<=5}<div class:critical={freeCells<=2} class="capacity-meter" role="status"><i></i>{freeCells} {freeCells===1?'CELL':'CELLS'} FREE</div>{/if}<button class="tidy-button" onclick={()=>tidyConfirm=true} aria-label={`Tidy board for ${currentTidyQuote.cost} credits`}>↥ TIDY <b>◈{currentTidyQuote.cost}</b></button><div class="online"><i></i> ONLINE</div></div></div>
  <div class="board" role="grid" tabindex="0" aria-label="7 by 9 merge board" ondblclick={(event)=>event.preventDefault()} oncontextmenu={(event)=>event.preventDefault()}>
    {#each gameState.cells as cell}
      {@const item=itemAt(cell.index)}
      {@const definition=item && itemById.get(item.definitionId)}
      {@const producerConfig=definition?.kind==='producer'?producerByItemId.get(definition.id):undefined}
      {@const reservedForTicket=!!item&&ticketItemIds.has(item.instanceId)}
      <button class:locked={cell.locked} class:occupied={!!item} class:producer={definition?.kind==='producer'} class:chain-javascript={definition?.chainId==='javascript'} class:chain-bugs={definition?.chainId==='bugs'} class:chain-servers={definition?.chainId==='servers'} class:chain-html={definition?.chainId==='html'} class:chain-css={definition?.chainId==='css'} class:chain-hackathon={definition?.chainId==='hackathon'} class:chain-retro={definition?.chainId==='retro'} class:ticket-reserved={reservedForTicket} class:idle-merge-hint={definition?.kind==='mergeable'&&!!item&&hintedItemIds.includes(item.instanceId)} class:idle-generator-hint={definition?.kind==='producer'&&!!item&&hintedItemIds.includes(item.instanceId)} class:generator-moving={item?.instanceId===movingGenerator} class:generator-destination={!!movingGenerator&&!cell.locked&&!item} class:redeemable={definition?.id===HACKATHON_REDEMPTION.itemId&&clock<HACKATHON_EVENT.endsAt} class:infrastructure={definition?.id==='infrastructure_workbench'} class:event-pipeline={definition?.id==='event_pipeline'} class:html-workbench={definition?.id==='html_workbench'} class:css-selector-lab={definition?.id==='css_selector_lab'} class:energy-empty={!!producerConfig&&gameState.player.energy<producerConfig.energyCost} class:denied-a={definition?.kind==='producer'&&energyWarning>0&&energyWarning%2===1} class:denied-b={definition?.kind==='producer'&&energyWarning>0&&energyWarning%2===0} class:drag-over={over===cell.index} class:merge-over={over===cell.index&&mergeTarget(cell.index)} class:selected={item?.instanceId===selected} class="cell" data-cell={cell.index} role="gridcell" aria-label={cell.locked?`Locked cell, costs ${cell.unlockCost} credits`:item?`${definition?.name}, level ${definition?.level ?? 'producer'}${reservedForTicket?', contributes to a support ticket':''}${definition?.id===HACKATHON_REDEMPTION.itemId&&clock<HACKATHON_EVENT.endsAt?', double tap to redeem':''}`:`Empty cell ${cell.index+1}`} onclick={()=>useCell(cell.index,item)}>
        {#if cell.locked}<span class="lock">▧<small>{cell.unlockCost}</small></span>
        {:else if item}
          <span role="presentation" class="item" class:being-dragged={dragging===item.instanceId} onpointerdown={(e)=>down(e,item)} onpointermove={move} onpointerup={up} onpointercancel={up}>
            {#if reservedForTicket}<small class="ticket-badge">✓ TICKET</small>{/if}
            {#if definition?.id===HACKATHON_REDEMPTION.itemId&&clock<HACKATHON_EVENT.endsAt}<small class="goal-badge">WIN!</small>{/if}
            {#if producerConfig}<small class="producer-label">{producerLabel(item,producerConfig)}</small>{/if}
            <strong class:wide={(definition?.icon.length??0)>2}>{definition?.icon}</strong><span>{definition?.name}</span>
            {#if definition?.level}<em>L{definition.level}</em>{:else}<i class="energy-cost">⚡{producerConfig?.energyCost??1}</i>{/if}
          </span>
        {/if}
      </button>
    {/each}
  </div>
  <div class:rack-unlocked={gameState.player.level>=BALANCE.serverRackUnlockLevel} class="board-utilities">{#if gameState.player.level>=BALANCE.serverRackUnlockLevel}<button class:has-selection={!!selected} class="rack-zone" onclick={useRack} aria-label={selected?`Store selected item in Server Rack`:`Open Server Rack, ${rackUsage} of ${gameState.serverRack.capacity} units used`}><span>▥</span><div><b>{selected?`STORE SELECTED · ${rackItemSize(selectedDefinition?.id??'')}U`:'SERVER RACK'}</b><small>{selected?'Move this item off the board':`${rackUsage}U / ${gameState.serverRack.capacity}U mounted · tap to manage`}</small></div></button>{/if}<button class:active={overTrash} class:has-selection={!!selected} class="trash-zone" data-trash onclick={()=>selected&&recycle(selected)} aria-disabled={!selected&&!dragging} aria-label={selected?'Recycle selected item':'Drag an item here to recycle it'}><span>♲</span><div><b>{selectedDiscard?.kind==='energy'?`RECYCLE · +${Math.min(selectedDiscard.amount,gameState.player.maxEnergy-gameState.player.energy)} ENERGY`:selectedDiscard?.kind==='credits'?`RECYCLE · +${selectedDiscard.amount} CREDITS`:selected?'RECYCLE · NO SALVAGE':'DROP TO RECYCLE'}</b><small>Levels 4+ return generator salvage</small></div></button></div>
  <div class:generator-move-help={!!movingGenerator} class="selection-help">{movingGenerator?'Move mode — tap an empty unlocked cell, or tap the generator again to cancel.':selected?`Item selected — merge, move, store in the ${rackItemSize(selectedDefinition?.id??'')}U rack, or recycle.`:'Tap a workstation to generate. Select an item to move it or mount it in the Server Rack.'}</div>
  {#if info && itemById.get(info)}
    {@const detail=itemById.get(info)!}{@const detailProducer=producerByItemId.get(detail.id)}{@const detailProducerItem=detailProducer?gameState.items.find(item=>item.definitionId===detail.id):undefined}<aside class="item-info"><span class="info-icon">{detail.icon}</span><div><small>{detail.chainId?.toUpperCase() ?? 'PRODUCER'} {detail.level?`· LEVEL ${detail.level}`:detailProducer?`· ${detailProducer.energyCost} ENERGY`:''}</small><b>{detail.name}</b><p>{detail.description}</p></div>{#if detail.id===HACKATHON_REDEMPTION.itemId&&clock<HACKATHON_EVENT.endsAt}<div class="next">FINAL REWARD <strong>DOUBLE-TAP TO REDEEM</strong></div>{:else if detail.chainId==='hackathon'&&clock>=HACKATHON_EVENT.endsAt}<div class="next">EVENT ENDED <strong>CASH OUT AT PIPELINE</strong></div>{:else if detail.nextItemId}<div class="next">MERGES INTO <strong>{itemById.get(detail.nextItemId)?.name}</strong></div>{:else if detailProducer?.burstCapacity}<div class="next">EVENT BURST <strong>{detailProducer.burstCapacity} ITEMS · {Math.round((detailProducer.cooldownMs??0)/60_000)} MIN</strong></div>{:else if detailProducer}<div class="next">DROP TABLE <strong>{detailProducer.drops.length} ITEMS</strong></div>{/if}{#if detailProducerItem}<button class:active={movingGenerator===detailProducerItem.instanceId} class="move-generator" disabled={!movingGenerator&&!gameState.cells.some(cell=>!cell.locked&&!gameState.items.some(item=>item.cellIndex===cell.index))} onclick={()=>movingGenerator=movingGenerator===detailProducerItem.instanceId?null:detailProducerItem.instanceId}>{movingGenerator===detailProducerItem.instanceId?'CANCEL MOVE':'↔ MOVE GENERATOR'}</button>{/if}</aside>
  {/if}
</section>
{#if redemption}
  <div class="goal-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(redemption=null)}>
    <div class="goal-dialog" role="dialog" aria-modal="true" aria-labelledby="goal-title">
      <button class="goal-close" onclick={()=>redemption=null} aria-label="Close reward choice">×</button><span class="goal-cup">🏆</span><small>HACKATHON WEEKEND COMPLETE</small><h2 id="goal-title">Winner!</h2><p>Trade your Winning Hack for one reward.</p>
      <div class="goal-options"><button disabled={gameState.player.energy>=gameState.player.maxEnergy} onclick={async()=>{if(await actions.redeemEvent(redemption!,'energy'))redemption=null}}><i>⚡</i><b>+{HACKATHON_REDEMPTION.energy} Energy</b><span>{gameState.player.energy>=gameState.player.maxEnergy?'Energy already full':'Refuel production'}</span></button><button onclick={async()=>{if(await actions.redeemEvent(redemption!,'credits'))redemption=null}}><i>◈</i><b>+{HACKATHON_REDEMPTION.credits} Credits</b><span>Fund the recovery</span></button></div>
    </div>
  </div>
{/if}
{#if hackathonPayout}
  <div class="maintenance-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(hackathonPayout=false)}><div class="maintenance-dialog event-payout" role="dialog" aria-modal="true" aria-labelledby="payout-title"><button class="maintenance-close" onclick={()=>hackathonPayout=false} aria-label="Close">×</button><span class="maintenance-icon">💻</span><small>EVENT WRAP-UP</small><h2 id="payout-title">Weekend wrap-up</h2><p>Hackathon Weekend has ended. Archive every hackathon item still on the board and collect its level-scaled value.</p><div class="payout-total"><span>{hackathonQuote.items} ITEMS</span><strong>◈ {hackathonQuote.credits}</strong><small>TOTAL CREDITS</small></div><button class="maintenance-primary" onclick={collectHackathon}>ARCHIVE &amp; COLLECT</button></div></div>
{/if}
{#if tidyConfirm}
  <div class="maintenance-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(tidyConfirm=false)}><div class="maintenance-dialog" role="dialog" aria-modal="true" aria-labelledby="tidy-title"><button class="maintenance-close" onclick={()=>tidyConfirm=false} aria-label="Close">×</button><span class="maintenance-icon">↥</span><small>BOARD MAINTENANCE · SIX-HOUR WINDOW</small><h2 id="tidy-title">Tidy the board?</h2><p>Compact all movable items at the top, ordered from lowest to highest level. Each use doubles the fee until this window resets.</p><div class="tidy-price"><span>{currentTidyQuote.uses?`USE ${currentTidyQuote.uses+1} IN CURRENT WINDOW`:'NEW SERVICE WINDOW'}</span><strong>◈ {currentTidyQuote.cost}</strong>{#if currentTidyQuote.resetsAt}<small>RESETS IN {duration(currentTidyQuote.resetsAt-clock)}</small>{/if}</div><button class="maintenance-primary" disabled={gameState.player.credits<currentTidyQuote.cost} onclick={runTidy}>CONFIRM TIDY</button></div></div>
{/if}
{#if capacityPrompt}
  <div class="maintenance-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(capacityPrompt=false)}><div class="maintenance-dialog capacity-dialog" role="dialog" aria-modal="true" aria-labelledby="capacity-title"><button class="maintenance-close" onclick={()=>capacityPrompt=false} aria-label="Close">×</button><span class="maintenance-icon">▦</span><small>CAPACITY ALERT</small><h2 id="capacity-title">The board is full</h2>{#if nextLockedCell}<p>Production needs an empty cell. Another board slot is available for <strong>◈ {nextLockedCell.unlockCost??0}</strong>.</p><div class="capacity-actions"><button class="maintenance-primary" disabled={gameState.player.credits<(nextLockedCell.unlockCost??0)} onclick={async()=>{if(await actions.unlock(nextLockedCell!.index))capacityPrompt=false}}>UNLOCK SLOT · ◈ {nextLockedCell.unlockCost??0}</button>{#if gameState.player.credits<(nextLockedCell.unlockCost??0)}<small>Need {(nextLockedCell.unlockCost??0)-gameState.player.credits} more credits</small>{/if}{#if gameState.player.level>=BALANCE.serverRackUnlockLevel}<button class="capacity-secondary" onclick={()=>{capacityPrompt=false;rackOpen=true}}>OPEN SERVER RACK · {gameState.serverRack.capacity-rackUsage}U FREE</button>{/if}</div>{:else}<p>Every board slot is already allocated. Store an item in the Server Rack, merge a matching pair, or recycle something before generating more.</p>{#if gameState.player.level>=BALANCE.serverRackUnlockLevel}<button class="maintenance-primary" onclick={()=>{capacityPrompt=false;rackOpen=true}}>OPEN SERVER RACK · {gameState.serverRack.capacity-rackUsage}U FREE</button>{:else}<button class="maintenance-primary capacity-recycle" onclick={()=>{capacityPrompt=false;$notice='Select an item, then use Drop to Recycle below the board.'}}>SHOW ME THE BOARD</button>{/if}{/if}</div></div>
{/if}
{#if rackConfirm}<div class="maintenance-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&(rackConfirm=false)}><div class="maintenance-dialog" role="dialog" aria-modal="true" aria-labelledby="rack-confirm-title"><button class="maintenance-close" onclick={()=>rackConfirm=false} aria-label="Close">×</button><span class="maintenance-icon">▥</span><small>STORAGE CONFIRMATION</small><h2 id="rack-confirm-title">Mount {selectedDefinition?.name}?</h2><p>{selected&&ticketItemIds.has(selected)?'This item currently contributes to a support ticket. Stored items cannot be submitted until returned to the board.':'This is a top-level item. It will be safe in storage, but unavailable to tickets until returned.'}</p><button class="maintenance-primary" onclick={storeSelected}>STORE ITEM · {rackItemSize(selectedDefinition?.id??'')}U</button></div></div>{/if}
{#if rackOpen}<ServerRack state={gameState} onClose={()=>rackOpen=false} />{/if}
{#if rewardSplash}<div class="reward-splash" role="status"><span>{rewardSplash.icon}</span><div><b>{rewardSplash.title}</b><small>{rewardSplash.detail}</small></div></div>{/if}
