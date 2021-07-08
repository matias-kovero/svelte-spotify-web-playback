import type { SvelteComponentTyped } from 'svelte';
import type { SpotifyPlayerTrack, SpotifyDevice, WebPlaybackTrack, AuthorizationObject } from './spotify';

export interface State {
  currentDeviceId: string;
  deviceId: string;
  devices: SpotifyDevice[];
  error: string;
  errorType: string;
  isActive: boolean;
  isInitializing: boolean;
  isMagnified: boolean;
  isPlaying: boolean;
  isSaved: boolean;
  isUnsupported: boolean;
  needsUpdate: boolean;
  nextTracks: WebPlaybackTrack[];
  playerPosition: 'bottom' | 'top';
  position: number;
  previousTracks: WebPlaybackTrack[];
  progressMs: number;
  status: string;
  track: SpotifyPlayerTrack;
  volume: number;
}

export interface PlayOptions {
  context_uri?: string;
  uris?: string[];
}

export interface AuthorizationState {
  isError: boolean,
  error: string,
  isAuthorized: boolean,
  token: null | string,
  refresh: null | string,
  expires_in: number,
}

export interface AuthorizationContext extends SvelteComponentTyped {
  state: AuthorizationState,
  auth: AuthorizationObject,
  getToken: () => Promise<string>,
  play: () => void,
  login: () => Promise<void>,
}