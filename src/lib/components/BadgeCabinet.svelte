<script lang="ts">
  import { achievementCatalog } from '$lib/catalogs/achievements';
  import type { GameState } from '$lib/domain/types';
  let { state, onClose }: {state:GameState;onClose:()=>void}=$props();
  let earned=$derived(achievementCatalog.filter(badge=>state.achievements[badge.id]));
</script>

<div class="badge-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&onClose()}>
  <div class="badge-cabinet" role="dialog" aria-modal="true" aria-labelledby="badge-title">
    <header><div><small>OPERATOR CREDENTIALS</small><h2 id="badge-title">Badge Cabinet</h2><p>{earned.length} of {achievementCatalog.length} credentials earned</p></div><button onclick={onClose} aria-label="Close badge cabinet">×</button></header>
    <div class="badge-grid">
      {#each achievementCatalog as badge}
        {@const record=state.achievements[badge.id]}
        <article class:earned={!!record} class:event-badge={badge.category==='event'}>
          <span>{record?badge.icon:'?'}</span>
          <small>{badge.category}{badge.eventId?' · LIMITED EVENT':''}</small>
          <h3>{badge.name}</h3>
          <p>{badge.description}</p>
          <footer>{record?`EARNED ${new Date(record.earnedAt).toLocaleDateString()}`:'NOT YET EARNED'}</footer>
        </article>
      {/each}
    </div>
  </div>
</div>
