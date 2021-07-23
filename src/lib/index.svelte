<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { loadSpotifyPlayer, STATUS, setDevice } from './internal/_utils';
  //import SpotifyAuth from './internal/_auth/index.svelte';
  import { PKCE } from './internal/_auth/pkce';
  import BasicPlayer from './internal/_basicPlayer.svelte';
  //import type { AuthorizationContext, AuthorizationObject } from './types/common';
  /**
   * Spotify Authenticator
   */
  let authenticator: PKCE;
  /**
   * Current player instance
   */
  let player: WebPlaybackPlayer;
  /**
   * Current players playback state
   */
  let playbackState: WebPlaybackState;
  /**
   * Spotify client_id for authentication
   */
  export let client_id: string;
  /**
   * Redirect uri for authorization, use the uri where you will use this component.
   */
  export let redirect_uri: string = null;
  /**
   * Scopes list
   */
  export let scopes: string[] = null;
  /**
   * Player name
   */
  export let name = 'Svelte Web Player';
  /**
   * Player volume
   */
  export let volume = 0.5;

  /* Parameters needed for authorization */
  /* let auth: AuthorizationObject = {
    client_id,
    redirect_uri,
    scopes,
    state
  }; */

  /* Component state at initialization */
  let initialState = {
    deviceId: '',
    error: '',
    errorType: '',
    isActive: false,
    isInitializing: false,
    isPlaying: false,
    isUnsupported: false,
    status: STATUS.IDLE,
    accessToken: '',
  };

  /**
   * Create & hook listeners to our player. Finally add it to Spotify Connect
   */
  const initializePlayer = () => {
    // We need to wait before auth is initialized then we come here
    internalState = { ...internalState, isInitializing: true };

    player = new window.Spotify.Player({
      getOAuthToken: async (cb: SpotifyPlayerCallback) => {
        // This will run every time player.connect()
        // when user's token has expired.
        let token = await authenticator.getToken();
        internalState = {...internalState, accessToken: token };
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
   * Handler for player status changes. 
   * Triggered when add our player to Spotify Connect
   */
  const handlePlayerStatus = async ({ device_id }: WebPlaybackReady) => {
    internalState = {
      ...internalState,
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
      playbackState = _state; // This is relayed to the user
      if (_state) {
        internalState = {
          ...internalState,
          error: '',
          errorType: '',
          isActive: true,
        };
      } else {
        internalState = {
          ...internalState,
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
    const { status } = internalState;
    const isPlaybackError = type === 'playback_error';
    const isInitializationError = type === 'initialization_error';
    let nextStatus = status;

    if (player && !isPlaybackError) await player.disconnect();

    if (isInitializationError) {
      nextStatus = STATUS.UNSUPPORTED;
      // Give the option to the user to select and different device?
      /* ({ devices = [] } = await getDevices(token)); */
    }

    if (!isInitializationError && !isPlaybackError) {
      nextStatus = STATUS.ERROR;
    }

    internalState = {
      ...internalState,
      error: message,
      errorType: type,
      isInitializing: false,
      isUnsupported: isInitializationError,
      status: nextStatus
    };
  };

  onMount(async () => {
    /* Player Mounted - Before initializing Player - Check Auth status. */
    internalState = {...internalState, status: STATUS.INIT };

    if (!authenticator) {
      var tmpObj = new PKCE(client_id, redirect_uri, scopes);
      // https://stackoverflow.com/questions/43431550/async-await-class-constructor
      tmpObj.init(function() {
        authenticator = tmpObj;
      });
    }

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
  });

  /**
   * Handle the logic on slots
   */
  $: internalState = initialState;
  $: isReady = [STATUS.READY, STATUS.UNSUPPORTED].indexOf(internalState.status) >= 0;
  $: isLoading = [STATUS.INIT].indexOf(internalState.status) >= 0;

  /**
   * Spotify Authorization info
   */
  // let authContext: AuthorizationContext;

  /**
   * Triggered when an authorization token is assigned!
   */
  /* const onAuthorized = (event: { detail?: any }) => {
    isAuthorized = true;
    initializePlayer();
  } */

  $: isAuthorized = false;

  /**
   * Function that will prompt to give access to your app or logs the current user in.
   */
  export function login() {
    if (!authenticator) return;
    authenticator.login().then((success) => {
      if (success) {
        isAuthorized = true;
        initializePlayer();
      }
    });
  }

  /**
   * Log user out and clear everything.
   */
  export function logout() {
    if (!authenticator) return;
    authenticator.logout();
    isAuthorized = false;
  }

  /**
   * Select current device as playback device
  */
  export function selectDevice() {
    if (!internalState.deviceId) {
      console.log('[Player] No device found');
      return;
    }
    setDevice(internalState.accessToken, internalState.deviceId);
  }
</script>

<!--
  @component
  Spotify Web Playback
-->

<!-- Handle Spotify Authorization -->
<!-- <SpotifyAuth bind:this={authContext} {auth} on:success={onAuthorized} /> -->

<slot 
  player={player} 
  state={playbackState} 
  error={{type: internalState.errorType, message: internalState.error}}
  internal={{...internalState, isAuthorized, isReady, isLoading }}
  name="all"
  >
</slot>

<slot />

{#if !$$slots.all}

  {#if isAuthorized}
    {#if isLoading}
      <slot name="loading">Loading...</slot>
    {:else if internalState.error}
      <slot name="error" error={{ type: internalState.errorType, message: internalState.error }}>{internalState.errorType}: {internalState.error}</slot>
    {:else if !internalState.isActive}
      <slot name="waiting">
        <button on:click={() => selectDevice()}>Select this device</button>
      </slot>
    {/if}
    {#if isReady && internalState.isActive}
      <slot name="player" player={player} state={playbackState}>
        <BasicPlayer {player} state={playbackState} />
      </slot>
    {/if}
    {#if !isLoading}
      <slot name="logout"></slot>
    {/if}
  {:else}
    <slot name="login">
      <button on:click={() => login()}>Login</button>
    </slot>
  {/if}

{/if}