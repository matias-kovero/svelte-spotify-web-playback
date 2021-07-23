declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player?: WebPlaybackPlayer
    },
  }
}

export {};