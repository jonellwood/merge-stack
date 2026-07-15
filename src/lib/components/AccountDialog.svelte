<script lang="ts">
  import { authMessage, cloudAvailable, cloudUser, sendMagicLink, signInWithGoogle, signOut } from '$lib/cloud/account-store';
  import { chooseCloudSave, chooseLocalSave, cloudSync, inspectCloudState } from '$lib/cloud/sync-manager';
  import { game } from '$lib/state/game-store';
  import { saveGame } from '$lib/persistence/db';
  let {onClose}:{onClose:()=>void}=$props();
  let email=$state(''),sending=$state(false);
  let inspectedUser=$state<string|null>(null);
  async function submit(){if(!email||sending)return;sending=true;try{await sendMagicLink(email)}finally{sending=false}}
  async function useLocal(){if(!$cloudUser||!$game)return;sending=true;try{await chooseLocalSave($cloudUser.id,$game,$cloudSync.cloud)}finally{sending=false}}
  async function useCloud(){if(!$cloudUser||!$cloudSync.cloud)return;sending=true;try{const state=await chooseCloudSave($cloudUser.id,$cloudSync.cloud);game.set(state);await saveGame(state)}finally{sending=false}}
  $effect(()=>{if($cloudUser&&$game&&inspectedUser!==$cloudUser.id){inspectedUser=$cloudUser.id;inspectCloudState($cloudUser.id,$game).then(async state=>{if(state){game.set(state);await saveGame(state)}})}});
</script>
<div class="account-backdrop" role="presentation" onclick={(event)=>event.target===event.currentTarget&&onClose()}>
  <div class="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
    <button class="account-close" onclick={onClose} aria-label="Close account dialog">×</button><div class="account-icon">◎</div><small>MERGE STACK CLOUD</small>
    {#if $cloudUser}
      <h2 id="account-title">Cloud progress</h2><p>Signed in as <b>{$cloudUser.email}</b></p>
      {#if $cloudSync.phase==='checking'}<div class="cloud-checking">Checking this device against the cloud…</div>
      {:else if $cloudSync.phase==='local-only'}<div class="save-choice single"><h3>Create your cloud save?</h3><p>No cloud progress exists yet. Upload this device’s level {$game?.player.level??1} save to begin syncing.</p><button onclick={useLocal} disabled={sending}>Use this device’s save</button></div>
      {:else if ($cloudSync.phase==='choice'||$cloudSync.phase==='conflict')&&$cloudSync.cloud}
        <div class:conflict={$cloudSync.phase==='conflict'} class="reconcile-note">{$cloudSync.message}</div><div class="save-options"><article><small>THIS DEVICE</small><b>Level {$game?.player.level}</b><span>◈ {$game?.player.credits} · ⚡ {$game?.player.energy}</span><time>{new Date($game?.updatedAt??0).toLocaleString()}</time><button onclick={useLocal} disabled={sending}>Use local progress</button></article><article><small>CLOUD · REV {$cloudSync.cloud.revision}</small><b>Level {$cloudSync.cloud.state.player.level}</b><span>◈ {$cloudSync.cloud.state.player.credits} · ⚡ {$cloudSync.cloud.state.player.energy}</span><time>{new Date($cloudSync.cloud.updated_at).toLocaleString()}</time><button onclick={useCloud} disabled={sending}>Use cloud progress</button></article></div>
      {:else if $cloudSync.phase==='syncing'}<div class="cloud-checking">Saving progress securely…</div>
      {:else if $cloudSync.phase==='synced'}<div class="sync-foundation"><i></i><div><b>Cloud save synchronized</b><span>Revision {$cloudSync.cloud?.revision}. Successful actions on this device now save automatically.</span></div></div>
      {:else if $cloudSync.phase==='error'}<div class="reconcile-note conflict">{$cloudSync.message}</div>
      {/if}
      <button class="account-secondary" onclick={signOut}>Sign out</button>
    {:else if !$cloudAvailable}
      <h2 id="account-title">Cloud setup required</h2><p>Add the project URL and publishable key to your local <code>.env</code> file, then restart the development server.</p><pre>PUBLIC_SUPABASE_URL=…
PUBLIC_SUPABASE_PUBLISHABLE_KEY=…</pre><small class="account-warning">Never place the service-role key or database password in browser environment variables.</small>
    {:else}
      <h2 id="account-title">Save across devices</h2><p>Create an account or sign in without interrupting your local game.</p><form onsubmit={(event)=>{event.preventDefault();submit()}}><label for="account-email">EMAIL ADDRESS</label><input id="account-email" type="email" bind:value={email} autocomplete="email" placeholder="operator@example.com" required /><button disabled={sending}>{sending?'Sending…':'Email me a sign-in link'}</button></form><div class="account-divider"><span>OR</span></div><button class="google-button" onclick={signInWithGoogle}>Continue with Google</button>{#if $authMessage}<p class="auth-message" aria-live="polite">{$authMessage}</p>{/if}<small class="account-note">Your current IndexedDB save will remain untouched until you choose how to reconcile it with a cloud save.</small>
    {/if}
  </div>
</div>
