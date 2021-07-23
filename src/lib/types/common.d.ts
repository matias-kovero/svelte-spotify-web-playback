// types/common.d.ts
import type { SvelteComponentTyped } from 'svelte';

interface AuthorizationContext extends SvelteComponentTyped {
  state: AuthorizationState,
  auth: AuthorizationObject,
  getToken: () => Promise<string>,
  login: () => Promise<void>,
  logout: () => void,
}
interface AuthorizationState {
  code: null | string,
  isError: boolean,
  error: string,
  isAuthorized: boolean,
  token: null | string,
  refresh: null | string,
  expires_in: number,
}
interface AuthorizationObject {
  /**
   * Available from the [Developer Dashboard](https://developer.spotify.com/dashboard/applications)
   */
  client_id: string,
  /**
   * A space-separated list of scopes.  
   * View valid scopes: [developer.spotify.com](https://developer.spotify.com/documentation/general/guides/scopes/)
   */
  scopes: string[],
  /**
   * Used to mitigate cross-site request forgery attacks.
   */
  state: string,
  /**
   * This value should match one of the _redirect_uri_ values you have registered in the Developer Dashboard.  
   * __This should be the url where you use svelte-spotify-web-playback.__
   */
  redirect_uri: string
}
interface AuthURIParams {
  [key: string]: string;
  client_id: string,
  response_type: 'code',
  redirect_uri: string,
  code_challenge_method: 'S256',
  code_challenge: string,
  state: string,
  scope: string,
}
interface AccessTokenBody {
  [key: string]: string;
  client_id: string,
  grant_type: 'authorization_code',
  code: string,
  redirect_uri: string,
  code_verifier: string,
}
interface AccessTokenResponse {
  access_token: string,
  token_type: string,
  scope: string,
  expires_in: number,
  refresh_token: string
}
interface RequestRefreshBody {
  [key: string]: string;
  grant_type: 'refresh_token',
  refresh_token: string,
  client_id: string,
}