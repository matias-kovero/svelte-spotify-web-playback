 [![npm](https://img.shields.io/npm/v/svelte-spotify-web-playback)](https://www.npmjs.com/package/svelte-spotify-web-playback)
# svelte-spotify-web-playback

A simple svelte wrapper for Spotify's web playback.  
### Includes:
- Wrapper for [Spotify Web Playback](https://developer.spotify.com/documentation/web-playback-sdk/reference/)
- Authorization with [PKCE](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce) + automatic token refreshing.

## Installation

```bash
npm install -D svelte-spotify-web-playback
```
> Note: svelte will bundle everything, we can add this as dev-dependencies

## Basic Usage
```html
<script>
  import SpotifyPlayer from 'svelte-spotify-web-playback/index.svelte'; // No idea why index is needed?
  const auth = {
    client_id: 'Your_client_id',           // https://developer.spotify.com/dashboard/applications
    state: 'SVELTEKIT',                    // Just some string, used to mitigate cross-site request forgery attacks.
    redirect_uri: 'http://localhost:3000', // This pages url
    scopes: ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'],
  };
</script>

<SpotifyPlayer {...auth} />
```
## Using own slots 
```html
<script>
  import SpotifyPlayer from 'svelte-spotify-web-playback/index.svelte'; // No idea why index is needed?
  const auth = {
    client_id: 'Your_client_id',           // https://developer.spotify.com/dashboard/applications
    state: 'SVELTEKIT',                    // Just some string, used to mitigate cross-site request forgery attacks.
    redirect_uri: 'http://localhost:3000', // This pages url
    scopes: ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'],
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