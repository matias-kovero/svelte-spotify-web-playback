# Svelte Spotify Web Playback
 [![npm](https://img.shields.io/npm/v/svelte-spotify-web-playback)](https://www.npmjs.com/package/svelte-spotify-web-playback)
[![npm]( https://img.shields.io/bundlephobia/minzip/svelte-spotify-web-playback)](https://bundlephobia.com/package/svelte-spotify-web-playback)

A simple svelte wrapper for Spotify's web playback. Lets you focus on building your own player 
and not needing to worry about the underlying logic/authorizations needed to get things running.
## Features
- Wrapper for [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk/reference/)
- Built-in authorization with [PKCE](https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-code-flow-with-proof-key-for-code-exchange-pkce) + token refreshing.

## Installation
```bash
npm install -D svelte-spotify-web-playback
```
## Simple usage
This simple version will render an basic player with few controls. Mainly used for testing purposes.
```html
<script>
  import SpotifySDK from 'svelte-spotify-web-playback';
  const client_id = 'your_client_id';
</script>

<SpotifySDK {client_id} />
```
#### Notes
You can get your `client_id` by creating an Spotify App [here](https://developer.spotify.com/dashboard/applications). Remember to add urls to your callback on Spotify Dashboard. 
__You should add the url where this player will locate__, no need to add `/callback`
Example when developing you probaly will have the player on your development server `http://localhost:3000/` <- Trailing slash.

## Using custom slots
You propably want to customize your player - this is done via slots. 
You can use slots directly or pass it to your custom elements. _(Suggesting the latter, keeps things tidy.)_
```html
<script>
  import SpotifySDK from 'svelte-spotify-web-playback';
  import CustomPlayer from './src/my_custom_player.svelte';
  const client_id = 'your_client_id';
  let spotify; // Reference to our wrapper element.
</script>

<SpotifySDK {client_id} name="My Spotify Player" volume={0.5} bind:this={spotify}>
    <div slot="login">
        <button on:click={() => spotify.login()}>Login with Spotify</button>
    </div>
    <CustomPlayer slot="player" let:player let:state {player} {state} />
</SpotifySDK>
```
## Wrapper element 
### Functions
| functions | description |
| ------ | ------ |
| `login()` | Called when you want to log an user in |
| `selectDevice()` | Called when you want to select this player active. |
| `logout()` | Called when you want to log an user out |
### Props
| name | default value | type | description|
| ------ | ------ | ------ | ------ |
| _client\_id_ | (required) | `string` |  |
| name | Svelte Web Player | `string` | Name of your player in Spotify Connect |
| volume | 0.5 |`number` | Initial volume of the player |
| scopes | ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'] |`string[]` | [Scopes](https://developer.spotify.com/documentation/general/guides/scopes/) for your player. |
| state | random string |`string` | Mitigate cross-site request forgery attacks |
| redirect_uri | current window url |`string` | The url where your player is located. |
### Slots
| name | props | 
| ------ | ------ | 
| error | `{ error:{ type: string, message: string } }` |
| login | - | 
| loading | - |
| waiting | - |
| player | `{ player: WebPlaybackPlayer, state: WebPlaybackState }` |
| logout | - |
| all | `{ player: WebPlaybackPlayer, state: WebPlaybackState, error: { type: string, message: string }, internal: InternalStatus }` |
Slot "all" is ment for users who want to heavily modify the flow of the player. It will expose the internal state to the user.

## Examples
Small snippets on how to use custom elements.
```html
// Index.svelte
<script>
  import SpotifySDK from 'svelte-spotify-web-playback';
  import CustomPlayer from 'src/my_custom_player.svelte';
  const client_id = 'your_client_id';
  let spotify; // Reference to our wrapper element.
</script>

<SpotifySDK {client_id} name="My Spotify Player" volume={0.5} bind:this={spotify}>
    <CustomPlayer slot="player" let:player let:state {player} {state} />
</SpotifySDK>
```
```html
// my_custom_player.svelte
<script lang="ts">
  import type {WebPlaybackState, WebPlaybackPlayer} from 'svelte-spotify-web-playback/types';
  export let player: WebPlaybackPlayer, state: WebPlaybackState;
  $: loaded = player && state;
  $: position = state.position;
</script>

{#if loaded}
<div class="simple-player">
  <div class="track-info">
    <b>{state.track_window.current_track.name}</b>
  </div>
  <div class="controls">
    <button on:click={() => player.previousTrack()}>{"<"}</button>
    <button on:click={() => player.togglePlay()}>{state.paused ? 'Play' : 'Pause'}</button>
    <button on:click={() => player.nextTrack()}>{">"}</button>
  </div>
  <div class="progress">
    <div>{position} / {state.duration}</div>
  </div>
</div>
{/if}
```