export const STATUS = {
  ERROR: 'ERROR',
  IDLE: 'IDLE',
  INIT: 'INIT',
  READY: 'READY',
  RUNNING: 'RUNNING',
  UNSUPPORTED: 'UNSUPPORTED'
};

export const TYPE = {
  DEVICE: 'device_update',
  FAVORITE: 'favorite_update',
  PLAYER: 'player_update',
  PROGRESS: 'progress_update',
  STATUS: 'status_update',
  TRACK: 'track_update',
};

/**
 * Load spotify web playback sdk - no need for the user to add it to the html file.
 */
export function loadSpotifyPlayer(): Promise<any> {
  return new Promise<void>((resolve, reject) => {
    const scriptTag = document.getElementById('spotify-player');

    if (!scriptTag) {
      const script = document.createElement('script');

      script.id = 'spotify-player';
      script.type = 'text/javascript';
      script.async = false;
      script.defer = true;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.onload = () => resolve();
      script.onerror = (error: any) => reject(new Error(`loadScript: ${error.message}`));

      document.head.appendChild(script);
    } else {
      resolve();
    }
  })
}
/**
 * Check if given uri is an valid spotify uri
 */
export function validateURI(uri: string): boolean {
  const validTypes = ['album', 'artist', 'playlist', 'show', 'track'];

  if (uri && uri.indexOf(':') > -1) {
    const [key, type, id] = uri.split(':');
    if (key === 'spotify' && validTypes.indexOf(type) >= 0 && id.length === 22) return true;
  }
  return false;
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function parseVolume(value?: unknown): number {
  if (!isNumber(value)) return 1;
  if (value > 1) return value / 100;
  return value;
}

/**
 * Round decimal numbers
 */
export function round(number: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(number * factor) / factor;
}

/**
 * Get spotify uri type
 */
export function getURIType(uri: string): string {
  const [, type = ''] = uri.split(':');
  return type;
}