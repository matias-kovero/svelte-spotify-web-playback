<script lang="ts">
  import type { AuthorizationObject, AuthorizationState } from '$lib/types';

  /**
   * Authorization Code Flow with Proof Key for Code Exchange (PKCE)
   * 1. Create the code verifier and challenge
   * 2. Construct authorization URI
   * 3. App redirects the user to the authorization URI
   *  a. User Accepts request - redirect_uri should have { code, state }
   *  b. User Denies request - redirect_uri should have { error, state }
   * 4. App exchanges the code for an access token
   * 5. Use the access token to access the Spotify Web API
   * 6. Requesting a refreshed access token
   */
  import { onMount, afterUpdate, createEventDispatcher } from 'svelte';
  import { getAccessToken, redirectToAuth, refreshAccessToken } from './spotify';
  import { generateCodeVerifier, getHash, getCookie } from './utils';
  import { cookieKeys } from './config';

  /**
   * Events dispatched from child components can be listened to in their parent. 
   * Any data provided when the event was dispatched is available on the detail property of the event object.
   */
  const dispatch = createEventDispatcher();

  /* Authorization information provided by the user */
  export let auth: AuthorizationObject;

  /* Current state of authorization, handle logic */
  export let state = {
    isError: false,
    error: '',
    isAuthorized: false,
    token: null,      // Are these saved if we refresh page?
    refresh: null,    // Are these saved if we refresh page?
    expires_in: 0,
  } as AuthorizationState;

  /* Aquired code from Spotify when user gives access to the application */
  let code;
  /* Authorization token, used to authorize request to Spotify endpoints */
  let auth_token;
  /* Refresh token, used to refresh the authorization token */
  let refresh_token;

  /* As this is implemented without backend - 
  *  the redirect will point to the same url we have the player.
  *  thus we need to check if we have query params - then we know user has completed authorization from Spotify
  */
  onMount(async () => {
    if (!auth.client_id) {
      console.log('[Auth] Client ID is missing. Please provide an client_id!');
      state = {...state, isError: true, error: 'Missing client_id'};
    }
    // Check url for query parameters, { code, state, error }
    const hash = getHash();
    // User gave access to our app -> update state with new code
    if (hash?.code) {
      code = hash.code;

      console.log('[Auth] Got authorization code');
      // Exchange this code for an access token!
      await requestAccessToken();

      // Remove urlendoced stuff from url
      window.history.pushState({}, null, window.location.origin);

    } else if (!code && !auth_token && !refresh_token) {
      /* User has nothing saved, need to create challenges for authorization */
      // 1. Create the code verifier and challenge
      generateCodeVerifier(cookieKeys.code_verifier);
      // Used cookies to save info. Is it smart? Maybe stores?
    }
  });

  /**
   * This will run when the DOM is in sync with data
   */
  afterUpdate(() => {
    // console.log('[Auth] Update', state);
  });

  /* const getToken = async () => {
    let updated;

    const [ saved_at, at ] = ['aa', auth_token];
    // Check if saved token and current token match
    if (saved_at === at && at) {
      // Our auth_token is valid, pass it forward.
      return at;
    } else {
      try {
        if (refresh_token) {
          await requestRefreshToken();
        } else if (code) {
          await requestAccessToken();
        }
      } catch (error) {
        console.log('[Auth] Token update error - ', error.message);
      }
    }
  } */

  /**
   * Step 4. Exchange code for an access token
   */
  const requestAccessToken = async () => {
    try {
      const response = await getAccessToken(auth, code);
      if (response) {
        console.log('[Auth] User is authorized for', response.expires_in, 'seconds.');
        auth_token = response.access_token;
        /*
        * response.expires_in = time in seconds for the access_toke is valid
        * Save this to an cookie? And on every auth - check if cookie is still found? 
        */
        refresh_token = response.refresh_token;
        state = { ...state, isAuthorized: true, token: response.access_token, refresh: response.refresh_token, expires_in: response.expires_in };
        dispatch('success', response.access_token);
      } else {
        console.log('[Auth] Issues while requesting token!');
        state = { ...state, isError: true, error: 'Issues while requesting token' };
      }
    } catch (error) {
      console.log('[Auth] Issues while requesting token!', error.message);
      state = { ...state, isError: true, error: error.message };
      // Why this is not triggering 'afterUpdate' ??
    }
  };

  /**
   * Step 6. Requesting a refreshed access token.
   * A refresh token that has been obtained throught PKCE is valid
   * for access token exchnage once. After which it becomes invalid.
   */
  const requestRefreshToken = async () => {
    // This should happen behind the scene. 
    // If everything goes well, no state changes to user.
    const response = await refreshAccessToken(auth, refresh_token);
    if (response) {
      auth_token = response.access_token;
      refresh_token = response.refresh_token;
      state = { ...state, isAuthorized: true, token: response.access_token, refresh: response.refresh_token, expires_in: response.expires_in };
    } else {
      console.log('[Auth] Issues while refreshing token!');
      state = { ...state, isError: true, error: 'Issues while refreshing token' };
    }
  };

  /* Pass this function to user - user needs to call this for login */
  /**
   * Figure the logic on this. If users has already given access - no need to redirect to auth?
   */
  export const login = async () => {
    console.log('[Auth] User trying to login');

    // Redirect user to give access to the app
    window.location.href = await redirectToAuth(auth);

    /* if (!verifier) return getToken(); // User came back, refresh tokens
    // User is logging in for the first time
    await authStep3(); */
  }

  /**
   * Get token for Spotify Player. If access token isn't valid anymore - refresh it.
   */
  export const getToken = async () => {
    // Check if token is still valid !!

    if (state.isAuthorized && state.token) return state.token;
    else {
      await requestRefreshToken();
      if (state.isAuthorized && state.token) return state.token;
    }
  }

</script>
<svelte:options accessors={true}></svelte:options>
{#if state.error}
  <!-- This forces an trigger to afterUpdate() -->
{/if}