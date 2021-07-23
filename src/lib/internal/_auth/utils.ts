function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function dec2hex(dec) {
  return ("0" + dec.toString(16)).substr(-2);
}

/* Generate code challenge */
export async function generateCodeChallengeFromVerifier(v) {
  var hashed = await sha256(v);
  var base64encoded = base64urlencode(hashed);
  return base64encoded;
}

/**
 * Generate code verifier and save it to cookie `cname`
 */
export function generateCodeVerifier(cname: string) {
  var array = new Uint32Array(56 / 2); // 43 - 128: should we just go to upper limit?
  window.crypto.getRandomValues(array);
  let verifier = Array.from(array, dec2hex).join("");
  document.cookie = `${cname}=${verifier};samesite=strict`;
}

/* Check URL hashes */
export function getHash(): { code?: string } {
  return window.location.search
    .substring(1)
    .split("&")
    .reduce(( initial, item ) => {
      if (item) {
        var parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial
    }, {});
}

export function getCookie(cname: string) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return ""; // === false
}
