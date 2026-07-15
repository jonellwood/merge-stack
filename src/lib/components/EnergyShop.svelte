<script lang="ts">
  import { onMount } from 'svelte';
  import type { GameState } from '$lib/domain/types';
  import { energyPurchaseQuote } from '$lib/domain/game';
  import { actions } from '$lib/state/game-store';
  let { state:gameState,onClose }:{state:GameState;onClose:()=>void}=$props();
  let clock=$state(Date.now()),buying=$state(false);
  let quote=$derived(energyPurchaseQuote(gameState,clock));
  let full=$derived(gameState.player.energy>=gameState.player.maxEnergy);
  let resetLabel=$derived(quote.resetsAt?formatRemaining(quote.resetsAt-clock):'Starts with purchase');
  function formatRemaining(ms:number){const seconds=Math.max(0,Math.ceil(ms/1000)),hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60),secs=seconds%60;return hours>0?`${hours}h ${minutes}m`:`${minutes}m ${secs}s`}
  async function buy(){if(buying)return;buying=true;try{if(await actions.buyEnergy())onClose()}finally{buying=false}}
  onMount(()=>{const timer=setInterval(()=>clock=Date.now(),1000);return()=>clearInterval(timer)});
</script>
<div class="shop-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&onClose()}>
  <div class="energy-shop" role="dialog" aria-modal="true" aria-labelledby="energy-shop-title">
    <button class="shop-close" onclick={onClose} aria-label="Close energy shop">×</button>
    <div class="shop-icon">⚡</div><small>CAPACITY MANAGEMENT</small><h2 id="energy-shop-title">Emergency Recharge</h2><p>Restore energy to full immediately. Procurement raises the price after every purchase in the same six-hour window.</p>
    <div class="charge-meter"><div><span>CURRENT ENERGY</span><b>{gameState.player.energy}/{gameState.player.maxEnergy}</b></div><i><em style={`width:${gameState.player.energy/gameState.player.maxEnergy*100}%`}></em></i></div>
    <div class="shop-price"><div><small>CURRENT PRICE</small><strong>◈ {quote.cost}</strong></div><div><small>PURCHASES THIS WINDOW</small><strong>{quote.purchases}</strong></div><div><small>PRICE RESET</small><strong>{resetLabel}</strong></div></div>
    {#if quote.boardComplete}<div class="board-discount">✓ FULL BOARD DISCOUNT ACTIVE · 50% OFF</div>{:else}<div class="board-discount locked">Unlock every board cell to permanently halve recharge prices.</div>{/if}
    <button class="buy-energy" disabled={full||gameState.player.credits<quote.cost||buying} onclick={buy}>{buying?'Processing…':full?'Energy is full':gameState.player.credits<quote.cost?`Need ${quote.cost-gameState.player.credits} more credits`:`Restore to ${gameState.player.maxEnergy} · ◈ ${quote.cost}`}</button>
    <small class="next-price">Next purchase this window: ◈ {quote.cost*2}</small>
  </div>
</div>
