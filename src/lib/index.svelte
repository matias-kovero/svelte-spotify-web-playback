<script context="module">
  /* export function getPlayer() {
    return player;
  } */
</script>

<script lang="ts">
  import { onMount, onDestroy, SvelteComponent } from 'svelte';
  import { getDevices, getPlaybackState } from './_spotify';
  import type { AuthorizationContext, AuthorizationObject, AuthorizationState, SpotifyDevice, SpotifyPlayerCallback, SpotifyPlayerStatus, WebPlaybackError, WebPlaybackPlayer, WebPlaybackReady, WebPlaybackState } from './types';
  import { loadSpotifyPlayer, parseVolume, STATUS } from './_utils';
  import SpotifyAuth from './_auth/index.svelte';

  /* Web SDK Player */
  let player: WebPlaybackPlayer;
  /**
   * Web Playback state
   */
  let playbackState: WebPlaybackState;
  /**
   * Spotify client_id for authentication
   */
  export let client_id: string;
  /**
   * Redirect uri for authorization, use the uri where you will add this component.
   */
  export let redirect_uri: string;
  /**
   * Scopes list
   */
  export let scopes: string[];
  /**
   * State used for protecting authorization on XSS forgery.
   */
  export let state: string;
  /**
   * Player name
   */
  export let name = 'Svelte Web Player';
  /**
   * Player volume
   */
  export let volume = 0.5;

  /* Should we remeber the selected device cross sessions */
  let persistDeviceSelection = false;
  /* Polling interval object */
  let interval = null;
  /* Empty track object */
  let emptyTrack = {
    artists: '',
    durationMs: 0,
    id: '',
    image: '',
    name: '',
    uri: '',
  };

  /* Parameters needed for authorization */
  export let auth: AuthorizationObject = {
    client_id,
    redirect_uri,
    scopes,
    state
  };

  /* Component state at initialization */
  let initialState = {
    currentDeviceId: '',
    deviceId: '',
    devices: [],
    error: '',
    errorType: '',
    isActive: false,
    isInitializing: false,
    isPlaying: false,
    isSaved: false,
    isUnsupported: false,
    needsUpdate: false,
    nextTracks: [],
    position: 0, // Used to find position on an playlist.
    previousTracks: [],
    progressMs: 0,
    status: STATUS.IDLE,
    track: emptyTrack,
    volume: parseVolume(volume) || 1,
  };

  /* const isExternalPlayer = (): boolean => {
    const { currentDeviceId, deviceId, status } = state;
    console.log('Checking if external:', (currentDeviceId && currentDeviceId !== deviceId) || status === STATUS.UNSUPPORTED);
    return (currentDeviceId && currentDeviceId !== deviceId) || status === STATUS.UNSUPPORTED;
  } */

  /**
   * Create & hook listeners to our player. Finally add it to Spotify Connect
   */
  const initializePlayer = () => {
    // We need to wait before auth is initialized then we come here
    playerState = { ...playerState, isInitializing: true };

    player = new window.Spotify.Player({
      getOAuthToken: async (cb: SpotifyPlayerCallback) => {
        // This will run every time player.connect()
        // when user's token has expired.
        let token = await authContext.getToken();
        cb(token);
      },
      name,
      volume,
    });

    player.addListener('ready', handlePlayerStatus);
    player.addListener('not_ready', handlePlayerStatus);
    player.addListener('player_state_changed', handlePlayerStateChange);
    player.addListener('initialization_error', (error: WebPlaybackError) => {
      handlePlayerError('initialization_error', error.message);
    });
    player.addListener('authentication_error', (error: WebPlaybackError) => {
      handlePlayerError('authentication_error', error.message);
    });
    player.addListener('playback_error', (error: WebPlaybackError) => {
      handlePlayerError('playback_error', error.message);
    });
    // Add player to Spotify Connect
    player.connect();
  }

  /**
   * Check our devices in Spotify Connect and if we want to save device id to session storage
   */
  /* const initializeDevices = async (id: string) => {
    const { devices } = await getDevices(token);
    let currentDeviceId = id;

    if (persistDeviceSelection) {
      const savedDeviceId = sessionStorage.getItem(persistDeviceStorageKey);

      if (!savedDeviceId || !devices.find((d: SpotifyDevice) => d.id === savedDeviceId)) {
        sessionStorage.setItem(persistDeviceStorageKey, currentDeviceId);
      } else {
        currentDeviceId = savedDeviceId;
      }
    }

    return { currentDeviceId, devices };
  }; */

  /**
   * Handler for player status changes. 
   * Triggered when add our player to Spotify Connect
   */
  const handlePlayerStatus = async ({ device_id }: WebPlaybackReady) => {
    /* const { currentDeviceId, devices } = await initializeDevices(device_id); */
    console.log('[Player] Player ready', device_id ? true : false);
    playerState = {
      ...playerState,
      deviceId: device_id,
      isInitializing: false,
      status: device_id ? STATUS.READY : STATUS.IDLE
    };
  };

  
   /**
   * Main source of info on our player. If we interact with the player - we will get an state change.
   * This will also fire "in random intervals".
   * However, to get an accurate song position, we need to create an interval when songs are playing.
   */
  const handlePlayerStateChange = async(_state: WebPlaybackState | null) => {
    try {
      playbackState = _state;
      if (_state) {
        // console.log(_state);
        /* const {
          paused,
          position,
          track_window: {
            current_track: { album, artists, duration_ms, id, name, uri },
            next_tracks,
            previous_tracks,
          },
        } = _state;
        const isPlaying = !paused;
        const volume = await player!.getVolume();
        const track = {
          artists: artists.map((a) => a.name).join(', '),
          durationMs: duration_ms,
          id,
          image: '', // function to get image url
          name,
          uri,
        };
        let trackState;
        if (position === 0) {
          trackState = {
            nextTracks: next_tracks,
            position: 0,
            previousTracks: previous_tracks,
            track,
          };
        } */
        playerState = {
          ...playerState,
          error: '',
          errorType: '',
          isActive: true,
          volume: volume,
        };
      } else {
        playerState = {
          ...playerState,
          isActive: false,
          isPlaying: false,
        };
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Errors from Spotify will get funned here.
   */
  const handlePlayerError = async (type: string, message: string) => {
    // Save status from this somewhere
    const { status } = playerState;
    const isPlaybackError = type === 'playback_error';
    const isInitializationError = type === 'initialization_error';
    let nextStatus = status;
    let devices: SpotifyDevice[] = [];

    if (player && !isPlaybackError) await player.disconnect();

    if (isInitializationError) {
      nextStatus = STATUS.UNSUPPORTED;
      /* ({ devices = [] } = await getDevices(token)); */
    }

    if (!isInitializationError && !isPlaybackError) {
      nextStatus = STATUS.ERROR;
    }

    playerState = {
      ...playerState,
      devices,
      error: message,
      errorType: type,
      isInitializing: false,
      isUnsupported: isInitializationError,
      status: nextStatus
    };
  };

  /**
   * Music is played on current account but not on our Spotify Connect Device.
   * This will sync the info from the other player to our player
   */
  /* const syncDevice = async () => {
    if (!state.isActive) return;
    const { deviceId } = state;

    try {
      const playback: SpotifyPlayerStatus = await getPlaybackState(token);
      let track = emptyTrack;

      if (!playback) { throw new Error('No Player'); }

      if (playback.item) {
        track = {
          artists: playback.item.artists.map((a) => a.name).join(', '),
          durationMs: playback.item.duration_ms,
          id: playback.item.id,
          image: '', // function to parse image url,
          name: playback.item.name,
          uri: playback.item.uri,
        };
      }
      state = {
        ...state,
        error: '',
        errorType: '',
        isActive: true,
        isPlaying: playback.is_playing,
        nextTracks: [],
        previousTracks: [],
        progressMs: playback.item ? playback.progress_ms : 0,
        status: STATUS.READY,
        track,
        volume: parseVolume(playback.device.volume_percent),
      };
    } catch (error) {
      const errState = {
        isActive: false,
        isPlaying: false,
        position: 0,
        track: emptyTrack,
      };

      if (deviceId) {
        state = {
          ...state,
          currentDeviceId: deviceId,
          ...errState,
        }
        return;
      }

      state = {
        ...state,
        error: error.message,
        errorType: 'player_status',
        status: STATUS.ERROR,
        ...errState
      };
    }
  } */

  onMount(async () => {
    /* Player Mounted - Before initializing Player - Check Auth status. */
    playerState = {...playerState, status: STATUS.INIT };

    if (isAuthorized) {
      if (!window.onSpotifyWebPlaybackSDKReady) {
        window.onSpotifyWebPlaybackSDKReady = initializePlayer;
      } else {
        initializePlayer();
      }
    } else { 
      // Template - as it will else throw errors
      window.onSpotifyWebPlaybackSDKReady = () => {}; 
    } 

    // Will this cause race conditions?
    await loadSpotifyPlayer();
  });

  onDestroy(() => {
    // Toggle state that component is destroyed?
    // Remove player from Spotify Connect
    if (player) player.disconnect();

    // Stop polling info from our player
    if (interval) clearInterval(interval);
  });


  /* TESTING - Export functions to use outside of this component */
  export function play() {
    if (!player) return;
    player.togglePlay();
  }

  /**
   * Player state
   */
  $: playerState = initialState;

  $: isReady = [STATUS.READY, STATUS.UNSUPPORTED].indexOf(playerState.status) >= 0;
  $: isLoading = [STATUS.INIT].indexOf(playerState.status) >= 0;

  /**
   * Spotify Authorization
   */
  let authContext: AuthorizationContext;

  /**
   * Triggered when an authorization token is assigned!
   */
  const onAuthorized = (event: { detail?: any }) => {
    console.log('[Player] User is now authorized.');
    isAuthorized = true;
    authToken = event.detail;
    initializePlayer();
  }

  $: isAuthorized = false;
  $: authToken = null;

  /**
   * Function that will prompt to give access to your app.
   */
  export function login() {
    if (!authContext) return;
    authContext.login();
  }
</script>

<!--
  @component
  Spotify Web Playback
  {props}
-->

<!-- Handle Spotify Authorization -->
<SpotifyAuth bind:this={authContext} {auth} on:success={onAuthorized} />



{#if isAuthorized}
  {#if isLoading}
    <slot name="loading">Loading...</slot>
  {:else if playerState.error}
    <slot name="error" error={{ message: playerState.error, type: playerState.errorType}}>{playerState.errorType}: {playerState.error}</slot>
  {:else if !playerState.isActive}
    <slot name="waiting">Device is not selected</slot>
  {/if}
  {#if isReady && playerState.isActive}
    <slot name="player" {player} state={playbackState}>
      <div>
        <b>{playbackState.track_window.current_track.name}</b>
      </div>
      <button on:click={() => player.previousTrack()}>{"<"}</button>
      <button on:click={() => player.togglePlay()}>{playbackState.paused ? 'Play' : 'Pause'}</button>
      <button on:click={() => player.nextTrack()}>{">"}</button>
      <div>
        <span>{playbackState.position}/{playbackState.duration}</span>
      </div>
    </slot>
  {/if}
{:else}
  <slot name="login">
    <button on:click={() => login()}>Login</button>
  </slot>
{/if}