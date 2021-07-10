<script lang="ts">
  import SpotifyPlayer from '$lib/index.svelte';
  import HandleAll from './_testingView.svelte';
  import { auth as dev } from '../../dev/auth';

  /* Mandatory fields for our player */
  const client_id = dev.client_id;
  let spotify;
  $: spotify;
</script>

<h5>Spotify Web Playback Player</h5>

<SpotifyPlayer client_id={client_id} bind:this={spotify}>
  <HandleAll slot="all" let:internal let:player let:state {internal} {player} {state} refSpotify={spotify} />
</SpotifyPlayer>