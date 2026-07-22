<script lang="ts">
  import type { Announcement } from '$lib/catalogs/announcements';
  import { markAnnouncementSeen } from '$lib/persistence/announcements';
  let { announcement, onClose }: { announcement: Announcement; onClose: () => void } = $props();
  function close() {
    markAnnouncementSeen(announcement.id);
    onClose();
  }
</script>

<div class="splash-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && close()}>
  <div class="splash-dialog" role="dialog" aria-modal="true" aria-labelledby="splash-headline">
    <button class="splash-close" onclick={close} aria-label="Close announcement">×</button>
    {#if announcement.tag}<small class="splash-tag">{announcement.tag}</small>{/if}
    <div class="splash-icon" aria-hidden="true">{announcement.icon ?? '✨'}</div>
    <h2 id="splash-headline">{announcement.headline}</h2>
    <p>{announcement.body}</p>
    <div class="splash-meta"><span>v{announcement.version}</span><span>{announcement.date}</span></div>
    <button class="splash-primary" onclick={close}>Got it</button>
  </div>
</div>

<style>
  .splash-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: grid;
    place-items: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    padding: 1rem;
  }
  .splash-dialog {
    position: relative;
    width: min(32rem, 100%);
    background: linear-gradient(180deg, #141c2b 0%, #0d121c 100%);
    border: 1px solid rgba(69, 229, 208, 0.25);
    border-radius: 1rem;
    padding: 2rem;
    text-align: center;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(69, 229, 208, 0.05);
  }
  .splash-close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    width: 2rem;
    height: 2rem;
    display: grid;
    place-items: center;
    background: transparent;
    border: none;
    color: #9fb0c7;
    font-size: 1.5rem;
    cursor: pointer;
    border-radius: 0.375rem;
  }
  .splash-close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #f7f9ff;
  }
  .splash-tag {
    display: inline-block;
    margin-bottom: 0.75rem;
    padding: 0.25rem 0.625rem;
    border-radius: 999px;
    background: rgba(69, 229, 208, 0.12);
    color: #45e5d0;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  .splash-icon {
    font-size: 3.5rem;
    line-height: 1;
    margin-bottom: 1rem;
  }
  h2 {
    margin: 0 0 0.75rem;
    font-size: 1.5rem;
    color: #f7f9ff;
  }
  p {
    margin: 0 0 1.5rem;
    color: #9fb0c7;
    line-height: 1.55;
    font-size: 0.95rem;
  }
  .splash-meta {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    font-size: 0.7rem;
    color: #5d7292;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .splash-primary {
    width: 100%;
    padding: 0.875rem;
    border: none;
    border-radius: 0.625rem;
    background: linear-gradient(90deg, #45e5d0, #5b8cff);
    color: #0d121c;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: filter 0.15s ease, transform 0.05s ease;
  }
  .splash-primary:hover {
    filter: brightness(1.1);
  }
  .splash-primary:active {
    transform: translateY(1px);
  }
</style>
