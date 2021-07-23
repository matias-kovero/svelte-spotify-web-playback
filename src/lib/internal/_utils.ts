import { onDestroy } from 'svelte';

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

export async function setDevice(token: string, deviceId: string, shouldPlay?: boolean | undefined) {
  return fetch(`https://api.spotify.com/v1/me/player`, {
    body: JSON.stringify({ device_ids: [deviceId], play: shouldPlay }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });
}

/**
 * Automatically destroyed interval.
 */
export function onInterval(callback: () => void, milliseconds: number) {
	const interval = setInterval(callback, milliseconds);

	onDestroy(() => {
		clearInterval(interval);
	});
}

/**
 * Converts milliseconds to min:sec string.
 */
export function msToMinSec(ms: number): string {
  let min = Math.floor(ms / 60000);
  let sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export const SpotifyLogo = "data:image/png;base64,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aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6aXB0Y0V4dD0iaHR0cDovL2lwdGMub3JnL3N0ZC9JcHRjNHhtcEV4dC8yMDA4LTAyLTI5LyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgIHhtbG5zOnBsdXM9Imh0dHA6Ly9ucy51c2VwbHVzLm9yZy9sZGYveG1wLzEuMC8iCiAgICB4bWxuczpHSU1QPSJodHRwOi8vd3d3LmdpbXAub3JnL3htcC8iCiAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOmMxNmFhZDYwLTI3OTQtNGEzMi04NTE4LThkNGI3MzcyMjBjZiIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5YTllM2Y0OC0wMTRlLTRlM2ItODRjOC1kNWU0ZDFjMjk3NjIiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4ODVmMWE5Zi1jNmZmLTQxNjctYjUwZC1iODdmYTA1ZjYwZjkiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjI3MDQxNzk2NTEzOTE2IgogICBHSU1QOlZlcnNpb249IjIuMTAuMjIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDxpcHRjRXh0OkxvY2F0aW9uQ3JlYXRlZD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkxvY2F0aW9uQ3JlYXRlZD4KICAgPGlwdGNFeHQ6TG9jYXRpb25TaG93bj4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgIDxpcHRjRXh0OkFydHdvcmtPck9iamVjdD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OkFydHdvcmtPck9iamVjdD4KICAgPGlwdGNFeHQ6UmVnaXN0cnlJZD4KICAgIDxyZGY6QmFnLz4KICAgPC9pcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZkYTIxYjI2LTlmMjUtNDQwOC05MmYyLWQ5MWY3YzFiMzM4YyIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChXaW5kb3dzKSIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMS0wNy0yM1QxNTowMzoxNiIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgIDxwbHVzOkltYWdlU3VwcGxpZXI+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpJbWFnZVN1cHBsaWVyPgogICA8cGx1czpJbWFnZUNyZWF0b3I+CiAgICA8cmRmOlNlcS8+CiAgIDwvcGx1czpJbWFnZUNyZWF0b3I+CiAgIDxwbHVzOkNvcHlyaWdodE93bmVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6Q29weXJpZ2h0T3duZXI+CiAgIDxwbHVzOkxpY2Vuc29yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6TGljZW5zb3I+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz6gpjv1AAAABmJLR0QAIwAjACPnTmdgAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5QcXDAMQyjMpZAAAApZJREFUSMe9l0uIjlEYx3/PsGFCGdfcZrAYt1IslNwaWbAwaYgsKJnCypK9JRsLYmVDskDkfkkWUsPICMklJLeUXKbIfD+bM/X6vPN5+ebzr3fznvec//95zvN/znmDglBHA0uBeUATMCYNvQaeATeAyxHxjv6A2qKetzjOqkuqIZyiXvbfcUFt+lvSNvWr1eOL2lqUtN3+R3uRSGuFlVmuyO4pcBcYTG3wFZgVEc8A6jIDB2pIClAP7PslYrUFuFT24fXkzYfAPaAbeAx8T/OGJT/XA9OAWcCc5POoIGBxRFzrTXPWp5/VyVXYcKi6Sj2hlnL2+hRApI70JjP3QURMz1mwEWjIvgKeRsTHCiImAjuB9kwWBEairs9RtVvdoh5RH/yhWnvUTvWQulEdlyNgQ9mcNah7a2CdK+raDPGysvE9oZ4GVuRkqhu4BtwEHqWnBPQAA5IjJgNTgbnAQmBE2RpdwEVgNTAh8/4YakeO4vfqiH8orIXq/tQqK6Ej1I5kgyxeAs0R0a02p4jGpgjrUuRPgXdAJ9AVEWYEDAd2ANuAQTkab6Ge6kPVS/VtwT39pB5PLXdghaLqxdG6dIjnYTwwqmCWhwCtwDHghbpVjdRg8vAq1HXA4ZzB18Ah4E4qrPsR8a1sT5uBZmA+0AY0FhS6BnVUH+nYXkYyTp2TeWbkFNdi9WoB3zf0Tjjbxx4fVG+rP/pYpJRcsUudmRGwqQLxyazSJf3YOGarqyt8s6A8TResPc7kXQSaUqepr9F5/AWYGRHP8zpPa40iLanL//dlr6RuLtpzVxbot0Xw+Y+R5pA3qeeqKSR1UjV/FItSPy8VIOtRT/5mmRzEXwhoAFrSZW58OqkAngCv0sXwSkR8KLLeTxsMr359NpsNAAAAAElFTkSuQmCC"