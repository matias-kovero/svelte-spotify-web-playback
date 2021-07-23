<script lang="ts">
  //import type { InternalStatus, WebPlaybackPlayer, WebPlaybackState } from "$lib/types";
  export let internal: InternalStatus, player: WebPlaybackPlayer, state: WebPlaybackState;
  export let refSpotify; // Getting reference of our wrapper
  // Should just expose accessToken for https://github.com/JMPerez/spotify-web-api-js
  $: console.log(internal);
  // $: loading = internal.isInitializing;
</script>

{#if internal.isAuthorized}
  <p>Authed</p>
  {:else}
  <p>Please Login</p>
  <button on:click={() => refSpotify.login()}>Custom Login</button>
{/if}