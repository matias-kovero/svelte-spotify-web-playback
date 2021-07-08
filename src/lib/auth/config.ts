export let cookieKeys = {
  code_verifier: 'cv',
  auth_token: 'at',
  refresh_token: 'rt'
};

export let fallbackValues = {
  scopes: ['user-modify-playback-state', 'user-read-playback-state', 'streaming'],
  state: Math.random().toString(36).replace(/[^a-z]+/g, ''),
}