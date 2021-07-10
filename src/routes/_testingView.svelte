<script lang="ts">
  export let internal, player, state;
  export let refSpotify; // Getting reference of our wrapper

  $: loading = internal.isInitializing;
</script>

{#if internal.isAuthorized}
  <p>Authed</p>
  {:else}
  <p>Please Login</p>
  <button on:click={() => refSpotify.login()}>Custom Login</button>
{/if}