<script lang="ts">
  export let state;
  export let player;

</script>

<div>
  <button on:click={() => player.previousTrack()}>{"<"}</button>
  <button on:click={() => player.togglePlay()}>Play/Pause</button>
  <button on:click={() => player.nextTrack()}>{">"}</button>
  <div>
    <span>{state.position}/{state.duration}</span>
  </div>
</div>