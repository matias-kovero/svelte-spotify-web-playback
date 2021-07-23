// types/spotify.d.ts

type SpotifyPlayerMethod<T = void> = () => Promise<T>;
type SpotifyPlayerCallback = (cb: string) => void;

interface SpotifyArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}
type WebPlaybackStatuses = 'ready' | 'not_ready';
type WebPlaybackStates = 'player_state_changed';
type WebPlaybackErrors =
  | 'initialization_error'
  | 'authentication_error'
  | 'account_error'
  | 'playback_error';

interface WebPlaybackError {
  message: WebPlaybackErrors;
}

interface WebPlaybackPlayer {
  _options: {
    getOAuthToken: (cb: SpotifyPlayerCallback) => void;
    name: string;
    //id: string;
    volume: number;
  };
  addListener: {
    (event: WebPlaybackErrors, callback: (d: WebPlaybackError) => void): boolean;
    (event: WebPlaybackStates, callback: (d: WebPlaybackState | null) => void): boolean;
    (event: WebPlaybackStatuses, callback: (d: WebPlaybackReady) => void): boolean;
  };
  connect: SpotifyPlayerMethod;
  disconnect: () => void;
  getCurrentState: () => Promise<WebPlaybackState | null>;
  getVolume: SpotifyPlayerMethod<number>;
  nextTrack: SpotifyPlayerMethod;
  pause: SpotifyPlayerMethod;
  previousTrack: SpotifyPlayerMethod;
  removeListener: (
    event: WebPlaybackErrors | WebPlaybackStates | WebPlaybackStatuses,
    callback?: () => void,
  ) => boolean;
  resume: SpotifyPlayerMethod;
  seek: (positionMS: number) => Promise<void>;
  setName: (n: string) => Promise<void>;
  setVolume: (n: number) => Promise<void>;
  togglePlay: SpotifyPlayerMethod;
  new (options: WebPlaybackPlayer["_options"]): WebPlaybackPlayer;
}

interface WebPlaybackReady {
  device_id: string;
}

interface WebPlaybackState {
  bitrate: number;
  context: {
    metadata: Record<string, unknown>;
    uri: null;
  };
  disallows: {
    resuming: boolean;
    skipping_prev: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  restrictions: {
    disallow_resuming_reasons: [];
    disallow_skipping_prev_reasons: [];
  };
  shuffle: boolean;
  timestamp: number;
  track_window: {
    current_track: WebPlaybackTrack;
    next_tracks: WebPlaybackTrack[];
    previous_tracks: WebPlaybackTrack[];
  };
}

interface WebPlaybackAlbum {
  images: WebPlaybackImage[];
  name: string;
  uri: string;
}

interface WebPlaybackArtist {
  name: string;
  uri: string;
}

interface WebPlaybackImage {
  height: number;
  url: string;
  width: number;
}

interface WebPlaybackTrack {
  album: WebPlaybackAlbum;
  artists: WebPlaybackArtist[];
  duration_ms: number;
  id: string;
  is_playable: boolean;
  linked_from: {
    uri: null | string;
    id: null | string;
  };
  linked_from_uri: null | string;
  media_type: string;
  name: string;
  type: string;
  uri: string;
}