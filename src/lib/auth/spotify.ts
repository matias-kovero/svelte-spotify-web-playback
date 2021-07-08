import type { AccessTokenBody, AccessTokenResponse, AuthorizationObject, AuthURIParams, RequestRefreshBody } from "$lib/types";
import { generateCodeChallengeFromVerifier, getCookie } from "./utils";
import { fallbackValues, cookieKeys } from './config';

const redirect_uri = 'http://localhost:3000';//`http://${window.location.host}/`;

const endpoints = {
  auth: 'https://accounts.spotify.com/authorize',
  token: 'https://accounts.spotify.com/api/token'
};

export const redirectToAuth = async (auth: AuthorizationObject) => {
  const verifier = getCookie(cookieKeys.code_verifier);
  if (!verifier) throw Error('Issues with PKCE code_verifier!');

  const code_challenge = await generateCodeChallengeFromVerifier(verifier);
  const params: AuthURIParams = {
    client_id: auth.client_id,
    response_type: 'code',
    redirect_uri: auth.redirect_uri,
    code_challenge_method: 'S256',
    code_challenge,
    state: auth.state || fallbackValues.state,
    scope: auth.scopes?.join(' ') || fallbackValues.scopes.join(' '),
  };
  const qs = new URLSearchParams(params);

  return `${endpoints.auth}?${qs.toString()}`;
}

export const getAccessToken = async (auth: AuthorizationObject, code: string) => {
  const code_verifier = getCookie(cookieKeys.code_verifier);
  if (!code_verifier) throw Error('Issues with PKCE code_verifier!');

  console.log('[Auth] Requesting Access Token.');

  const body: AccessTokenBody = {
    client_id: auth.client_id,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: auth.redirect_uri,
    code_verifier
  };

  const response = await fetch(endpoints.token, {
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
  });

  if (response.status === 200) {
    const json: AccessTokenResponse = await response.json();
    return json;
  } else {
    console.log('[Auth] Invalid response while fetcing token!');
    console.log('[Auth]', response.status, response.statusText, response);
  }
}

export const refreshAccessToken = async (auth: AuthorizationObject, code: string) => {
  
  console.log('[Auth] Refreshing Access Token.');

  const body: RequestRefreshBody = {
    client_id: auth.client_id,
    grant_type: 'refresh_token',
    refresh_token: code,
  };

  const response = await fetch(endpoints.token, {
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
  });

  if (response.status === 200) {
    const json: AccessTokenResponse = await response.json();
    return json;
  } else {
    console.log('[Auth] Invalid response while refreshing token!');
    console.log(response.status, response.statusText);
  }
}