export let cookieKeys = {
  code_verifier: 'cv',
  access_token: 'at',
  refresh_token: 'rt',
  expires_in: 'ei',
};
export let fallbackValues = {
  scopes: ['user-read-playback-state','streaming','user-read-private','user-modify-playback-state','user-read-email'],
  state: Math.random().toString(36).replace(/[^a-z]+/g, ''),
}