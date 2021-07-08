# svelte-spotify-web-playback

A simple svelte wrapper for Spotify's web playback.  
Includes Wrapper for Spotify Web Playback and Authorization with Proof Key for Code Exchange (PKCE)

## Installation



```bash
npm install -D svelte-spotify-web-playback
```

> Note: svelte will bundle everything, we can add this as dev-dependencies

## Basic Usage
```html
<script>
  import SpotifyPlayer from 'svelte-spotify-web-playback';
  const auth = {
    client_id: 'Your_client_id',
    state: 'some_string_for_auth',
    redirect_uri: 'this_pages_url',
    scopes = ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'],
  };
  let spotify;
</script>

<SpotifyPlayer {...auth} name="Svelte Web Testing Player" bind:this={spotify}>
</SpotifyPlayer>
```
## Using own slots 
```html
<script>
  import SpotifyPlayer from 'svelte-spotify-web-playback';
  const auth = {
    client_id: 'Your_client_id',
    state: 'some_string_for_auth',
    redirect_uri: 'this_pages_url',
    scopes = ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'],
  };
  let spotify;
</script>

<SpotifyPlayer {...auth} name="Svelte Web Testing Player" bind:this={spotify}>
  <div slot="login">
    <button on:click={() => spotify.login()}>Login</button>
  </div>
  <div slot="error" let:error>{error.type}: {error.message}</div>
  <div slot="loading">Player is loading</div>
  <div slot="waiting">Player is not selected</div>
  <div slot="player" let:player let:state>Render your player here</div>
</SpotifyPlayer>
```