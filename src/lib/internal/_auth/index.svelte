<script lang="ts">
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
  import { onMount, createEventDispatcher } from 'svelte';
  import { getAccessToken, redirectToAuth, refreshAccessToken } from './spotify';
  import { generateCodeVerifier, getHash, getCookie } from './utils';
  import { cookieKeys } from './config';
  import type { AuthorizationObject, AuthorizationState } from '$lib/types/common';
  /**
   * Events dispatched from child components can be listened to in their parent. 
   * Any data provided when the event was dispatched is available on the detail property of the event object.
   */
  const dispatch = createEventDispatcher();

  /**
   * How long should we keep users refresh_token.
   * Possible give this option to users.
   */
  const refreshExpirationDays = 30;

  /**
   * Authorization information provided by the user
   */
  export let auth: AuthorizationObject;

  /**
   * State of authorization
   */
  export let state = {
    isError: false,
    error: '',
    isAuthorized: false,
    token: null,      // Are these saved if we refresh page?
    refresh: null,    // Are these saved if we refresh page?
    code: null,
    expires_in: 0,
  } as AuthorizationState;

 /**
  * As the callback is tied to the same uri as the player, 
  * we need to check if we are loading the player or reading info as callback
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
      state = {...state, code: hash.code };

      // Exchange this code for an access token!
      await requestAccessToken();

      // Remove urlendoced stuff from url
      window.history.pushState({}, null, window.location.origin);
    } else if (!state.code && !state.token && !state.refresh) {
      // 1. Create the code verifier and challenge
      generateCodeVerifier(cookieKeys.code_verifier);
    }
  });

  /**
   * Step 4. Exchange code for an access token
   */
  const requestAccessToken = async () => {
    try {
      const response = await getAccessToken(auth, state.code);
      if (response) {
        // Save the token for instant auth inside time period. Remove token 1min before expire time. (Just to be sure, invalid token won't get used)
        document.cookie = `${cookieKeys.access_token}=${response.access_token};samesite=strict;max-age=${response.expires_in-60}`;
        // How long we want to save refresh_token? Also this is user-specific?
        document.cookie = `${cookieKeys.refresh_token}=${response.refresh_token};samesite=strict;max-age=${60*60*24*refreshExpirationDays}`;
        state = { 
          ...state, 
          isAuthorized: true, 
          token: response.access_token, 
          refresh: response.refresh_token, 
          expires_in: response.expires_in 
        };
        dispatch('success', response.access_token);
      } else {
        console.log('[Auth] Issues while requesting token!');
        state = { ...state, isError: true, error: 'Issues while requesting token' };
      }
    } catch (error) {
      console.log('[Auth] Issues while requesting token!', error.message);
      state = { ...state, isError: true, error: error.message };
    }
  };

  /**
   * Step 6. Requesting a refreshed access token.
   * A refresh token that has been obtained throught PKCE is valid
   * for access token exchnage once. After which it becomes invalid.
   */
  const requestRefreshToken = async () => {
    const response = await refreshAccessToken(auth, state.refresh);
    if (response) {
      document.cookie = `${cookieKeys.access_token}=${response.access_token};samesite=strict;max-age=${response.expires_in-60}`;
      document.cookie = `${cookieKeys.refresh_token}=${response.refresh_token};samesite=strict;max-age=${60*60*24*refreshExpirationDays}`;
      state = { 
        ...state, 
        isAuthorized: true, 
        token: response.access_token, 
        refresh: response.refresh_token, 
        expires_in: response.expires_in 
      };
    } else {
      console.log('[Auth] Issues while refreshing token!');
      state = { ...state, isError: true, error: 'Issues while refreshing token' };
    }
  };

  /**
   * Figure the logic on this. If users has already given access - no need to redirect to auth?
   */
  export const login = async () => {
    // Check if access or refresh tokens are found - auth user with them. No need to show pop-up
    const [access, refresh] = [getCookie(cookieKeys.access_token), getCookie(cookieKeys.refresh_token)];

    if (access && access.length > 0 && refresh && refresh.length > 0) {
      state = { ...state, token: access, refresh, isAuthorized: true };

      dispatch('success', state.token);
    } else if (refresh && refresh.length > 0) {
      state = { ...state, refresh };
      await requestRefreshToken();

      dispatch('success', state.token);
    } else {
      // else redirect user to give access to the app
      window.location.href = await redirectToAuth(auth);
    }
  }

  /**
   * Nuking cookies, forgetting the user fully. 
   * Will need an full authorization the next time.
   */
  export const logout = () => {
    // Mandatory, to destroy current session
    document.cookie = `${cookieKeys.access_token}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // However, this will fully forget the user - and needs to auth fully again later.
    document.cookie = `${cookieKeys.refresh_token}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    state = { ...state, token: null, refresh: null, isAuthorized: false };
  }

  /**
   * Get token for Spotify Player. If access token isn't valid anymore - refresh it.  
   * Returns valid token.
   */
  export const getToken = async () => {
    // Check if token is still valid !!
    if (state.isAuthorized) {
      if (state.token && getCookie(cookieKeys.access_token) === state.token) return state.token;
      // Token went invalid - refresh
      if (state.refresh) {
        await requestRefreshToken();
        if (state.isAuthorized && state.token) return state.token;
      } else {
        console.log('[Auth] Missing refresh_token. Out of sync.');
      }
    } else { 
      // Redirect user to give access to the app
      window.location.href = await redirectToAuth(auth);
    }
  }

</script>
<svelte:options accessors={true}></svelte:options>
{#if state.error}
  <!-- This forces an trigger to afterUpdate() -->
{/if}