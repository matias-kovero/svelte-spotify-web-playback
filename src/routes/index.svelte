<script lang="ts">
  import SpotifyPlayer from '$lib/index.svelte';
  import { auth as dev } from '../../dev/auth';

  /* Mandatory fields for our player */
  const client_id = dev.client_id;

</script>

<h5>Spotify Web Playback Player</h5>

<SpotifyPlayer client_id={client_id} />