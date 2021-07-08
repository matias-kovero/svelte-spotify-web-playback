<script lang="ts">
  import SpotifyPlayer from '$lib/index.svelte';
  
  /* Mandatory fields for our player */
  const client_id = '';
  const scopes = ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'];
  const state = '';
  const redirect_uri = 'http://localhost:3000';

  const auth = { client_id, scopes, state, redirect_uri };

  let spotify;
</script>

<h5>Spotify Web Playback Player</h5>

<SpotifyPlayer {...auth} name="Svelte Web Testing Player" bind:this={spotify}>
</SpotifyPlayer>