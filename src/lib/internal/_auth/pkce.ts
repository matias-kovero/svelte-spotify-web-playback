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
import type { AccessTokenResponse, AuthorizationObject, AuthorizationState } from '$lib/types/common';
import { cookieKeys } from './config';
import { getAccessToken, redirectToAuth, refreshAccessToken } from './spotify';
import { getHash, getCookie, generateCodeVerifier } from './utils';

/**
 * How long should we keep users refresh_token.
 * Possible give this option to users.
 */
const refreshExpirationDays = 30;

class PKCE {
  private auth_obj: AuthorizationObject;
  private state: AuthorizationState;

  constructor(client_id: string, redirect_uri?: string, scopes?: string[]) {
    if (!client_id) console.error('[Auth] Client ID is missing. Please provide an client_id!');

    this.auth_obj = {
      client_id,
      redirect_uri,
      scopes,
      state: undefined,
    };

    this.state = {
      isError: false,
      error: '',
      isAuthorized: false,
      token: null,
      refresh: null,
      code: null,
      expires_in: 0,
    };
  }

  /**
   * Initialize. Checks if user gave access to app.
   * @param callback return reference to this object.
   */
  public init(callback) {
    // Check url for query parameters, { code, state, error }
    const hash = getHash();
    if (hash?.code) {
      // Check if state matches!!
      this.state = { ...this.state, code: hash.code };
      // Remove urlendoced stuff from url
      window.history.pushState({}, null, window.location.origin);
      // Exchange code for an access token
      this.requestToken().then(() => {
        callback.bind(this)();
      });
    } else if (!this.state.code && !this.state.token && !this.state.refresh) {
      // 1. Create the code verifier and challenge
      generateCodeVerifier(cookieKeys.code_verifier);
      callback.bind(this)();
    }
  }

  /** 
   * Checks if any users info is saved, and uses it to login the user.  
   * If no info found, will redirect user to log in with spotify and give access to the app.
   */
  public async login() {
    return new Promise(async (resolve, reject) => {
      const [token, refresh] = [getCookie(cookieKeys.access_token), getCookie(cookieKeys.refresh_token)];
      if (token && refresh) {
        this.state = {...this.state, refresh, token, isAuthorized: true };
        resolve(this.state.isAuthorized);
      } else if (refresh) {
        this.state = {...this.state, refresh };
        await this.refreshToken();
        resolve(this.state.isAuthorized);
      } else {
        resolve(this.state.isAuthorized);
        // Redirect user to give access to the app
        window.location.href = await redirectToAuth(this.auth_obj);
      }
    });
  }

  /**
   * __Logs current user out.__  
   * Nuking cookies, client won't remeber user anymore.  
   * Will need an full authorization the next time.
   */
  public logout() {
    // Mandatory, to destroy current session
    document.cookie = `${cookieKeys.access_token}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // However, this will fully forget the user - and needs to auth fully again later.
    // TODO: Stash refresh token for x days? If user comes back, no need to fully auth? Give option to user to opt for staching.
    document.cookie = `${cookieKeys.refresh_token}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    this.state = { ...this.state, token: null, refresh: null, isAuthorized: false };
  }

  /**
   * Get current access token. This will also refresh the token if it has expired.
   */
  public async getToken() {
    if (this.state.isAuthorized) {
      if (this.state.token && getCookie(cookieKeys.access_token) === this.state.token) {
        return this.state.token;
      }
      else if (this.state.refresh) {
        await this.refreshToken();
        if (this.state.isAuthorized && this.state.token) {
          return this.state.token;
        }
      } else {
        console.warn('[Auth] Missing refersh_token. Out of sync.');
      }
    } else {
      // Redirect user to give access to the app
      window.location.href = await redirectToAuth(this.auth_obj);
    }
  }

  /**
   * Exchange `code` for an access token
   */
  private async requestToken() {
    try {
      const response = await getAccessToken(this.auth_obj, this.state.code);
      if (response) {
        this.saveTokens(response);
        // Info parent?
        // dispatch('success');
      } else {
        throw new Error('Invalid response from token request!');
      }
    } catch (error) {
      console.error('[Auth] Issues while requesting token!', error.message);
      this.state = { ...this.state, isError: true, error: 'Issues while refreshing token!' };
    }
  }

  /**
   * Refresh access token. Needs an refresh_token for exchange.
   * A refresh token that has been obtained throught PKCE is valid
   * for access token exchange once. After which it becomes invalid.
   */
  private async refreshToken() {
    try {
      const response = await refreshAccessToken(this.auth_obj, this.state.refresh);
      if (response) {
        this.saveTokens(response);
      } else {
        throw new Error('Invalid response from token refresh!');
      }
    } catch (error) {
      console.error('[Auth] Issues while refreshing token!', error.message);
      this.state = { ...this.state, isError: true, error: 'Issues while refreshing token!' };
    }
  }

  /**
   * Save gained tokens to cookies for later usage.
   */
  private saveTokens(response: AccessTokenResponse) {
    // Save the token for instant auth inside time period. Remove token 1min before expire time. (Just to be sure, invalid token won't get used)
    document.cookie = `${cookieKeys.access_token}=${response.access_token};samesite=strict;max-age=${response.expires_in-60}`;
    // How long we want to save refresh_token? Also this is user-specific?
    document.cookie = `${cookieKeys.refresh_token}=${response.refresh_token};samesite=strict;max-age=${60*60*24*refreshExpirationDays}`;
    // Update internal state.
    this.state = {
      ...this.state,
      isAuthorized: true,
      token: response.access_token,
      refresh: response.refresh_token,
      expires_in: response.expires_in,
    };
  }

}

export { PKCE };