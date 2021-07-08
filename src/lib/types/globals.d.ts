import type { WebPlaybackPlayer } from "./spotify";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player?: WebPlaybackPlayer
    },
  }
}

export {};