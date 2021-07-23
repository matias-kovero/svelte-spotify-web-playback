<script lang="ts">
  import { onInterval, msToMinSec } from './_utils';
  import { fade } from 'svelte/transition';
  import icon from './spotify-icon-w.png';
  import { cubicOut, cubicIn } from 'svelte/easing';
  export let player: WebPlaybackPlayer, state: WebPlaybackState;

  let hovered = false;

  $: album_url = state.track_window.current_track.album.images?.find((i) => i.width === 64)?.url;
  $: position = state.position;
  /**
   * When song is playing, adds progress to position. 
   * Use this to display progress of the song.
  */
  onInterval(() => position += state.paused ? 0 : 300, 300);
</script>

<div class="basic-player" on:mouseenter={() => hovered = true} on:mouseleave={() => hovered = false}>
  <div class="left-slot">
    <div class="album-image">
      {#key album_url}
        <img src={album_url} alt="album cover" 
          in:fade="{{ easing: cubicIn, duration: 1000 }}"
          out:fade="{{ easing: cubicOut, duration: 2000 }}"
        />
      {/key}
    </div>
    <div class="play-pause" class:hidden={!hovered} on:click={() => player.togglePlay()}>
      <div class="button" class:pause={!state.paused}></div>
    </div>
  </div>
  <div class="right-slot">
    <div class="track-info">
      <div class="top">
        <div class="prev" on:click={() => player.previousTrack()} class:hidden={!hovered}></div>
        <div class="next" on:click={() => player.nextTrack()} class:hidden={!hovered}></div>
        <div class="logo">
          <img src={icon} alt="spotify logo" />
        </div>
      </div>
      <div class="middle">
        <div class="name"><b>{state.track_window.current_track.name}</b></div>
        <div class="artists"><small>{state.track_window.current_track.artists.map((a) => a.name).join(', ')}</small></div>
      </div>
      <div class="bottom">
        <div class="progress-bar">
          <div class="progress" style={`width: ${position/state.duration*100}%;`}></div>
        </div>
        <div><small>{msToMinSec(state.duration)}</small></div>
      </div>
    </div>
  </div>
</div>

<style>
  .basic-player {
    font-family: sans-serif, Helvetica, Arial;
    display: inline-grid;
    position: relative;
    grid-template-columns: 80px 1fr;
    background: #3e3d3d;
    color: #FFF;
    box-shadow: 3px 2px 4px 0px #0003;
    place-items: center;
    border-radius: 3px;
  }
  .left-slot, .right-slot {
    display: grid;
    place-items: center;
    border-radius: inherit;
    height: 100%;
  }
  .right-slot {
    box-shadow: inset 4px 0px 4px 0px #0003;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    min-width: 180px;
    padding: 0 .5em;
  }
  .album-image, img {
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
    height: 80px;
    grid-column: 1/2;
    grid-row: 1/2;
    display: grid;
  }
  .track-info {
    display: grid;
    grid-template-rows: 20px 40px 20px;
    width: 100%;
  }
  .play-pause {
    background: #1db954;
    height: 40px;
    width: 40px;
    box-sizing: border-box;
    border-radius: 50%;
    display: grid;
    place-items: center;
    grid-column: 1/2;
    grid-row: 1/2;
    z-index: 1;
    cursor: pointer;
    filter: drop-shadow(1px 1px 2px #0000003b);
  }
  .button {
    box-sizing: border-box;
    height: 20px;
    padding-right: 2px;
    border-color: transparent transparent transparent #FFF;
    transition: 100ms all ease;
    will-change: border-width;

    border-style: solid;
    border-width: 10px 0 10px 15px;
  }
  .next, .prev {
    box-sizing: border-box;
    height: 7.5px;
    border-style: solid;
    cursor: pointer;
  }
  .next {
    border-color: transparent transparent transparent #1DB954;
    border-width: 5px 0 5px 7.5px;
  }
  .prev {
    border-color: transparent #1db954 transparent transparent;
    border-width: 5px 7.5px 5px 0;
  }
  .button.pause {
    border-style: double;
    border-width: 0px 0 0px 15px;
  }
  .hidden {
    display: none !important;
  }
  .top {
    position: relative;
    display: flex;
    gap: .75em;
    justify-content: flex-start;
    place-items: center;
  }
  .bottom {
    display: grid;
    grid-template-columns: 1fr auto;
    place-items: center;
    gap: .25em;
    color:#ffffff3b;
    font-size: small;
  }
  .progress-bar {
    background-color: #00000029;
    border-radius: 3px;
    height: 5px;
    max-width: 100%;
    width: 100%;
  }
  .progress {
    background: #ffffff3b;
    height: 5px;
    border-radius: 3px;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;
  }
  .logo img {
    position: absolute;
    width: 15px;
    height: 15px;
    top: 5px;
    right: -3px;
    filter: brightness(0.5);
  }
</style>