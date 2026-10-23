/* Slugger NEO v0.5.4 Cloudflare Worker.
 * Routes:
 *   GET  /ice-servers    - retrieve temporary TURN ICE credentials from Metered
 *   POST /username-token - issue a Firebase custom token for username-only access
 *
 * The Firebase service-account JSON must be stored as the Worker Secret
 * FIREBASE_SERVICE_ACCOUNT_JSON. Never place that key in the public game files.
 */
let cachedGoogleAccessToken = null;
let cachedGoogleAccessTokenExpiresAt = 0;

const encoder = new TextEncoder();
const TOKEN_AUDIENCE = "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit";
const OAUTH_AUDIENCE = "https://oauth2.googleapis.com/token";

function json(data, status, headers) {
  return new Response(JSON.stringify(data), { status, headers });
}

function base64Url(input) {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemBytes(pem) {
  const clean = String(pem || "")
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function signJwt(payload, serviceAccount) {
  if (!serviceAccount?.client_email || !serviceAccount?.private_key) {
    throw new Error("Firebase service account JSON is missing client_email or private_key");
  }
  const header = { alg: "RS256", typ: "JWT" };
  if (serviceAccount.private_key_id) header.kid = serviceAccount.private_key_id;
  const unsigned = base64Url(JSON.stringify(header)) + "." + base64Url(JSON.stringify(payload));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemBytes(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, encoder.encode(unsigned));
  return unsigned + "." + base64Url(signature);
}

async function googleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedGoogleAccessToken && cachedGoogleAccessTokenExpiresAt > now + 90) {
    return cachedGoogleAccessToken;
  }
  const assertion = await signJwt({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: OAUTH_AUDIENCE,
    iat: now,
    exp: now + 3600
  }, serviceAccount);
  const tokenResponse = await fetch(OAUTH_AUDIENCE, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });
  if (!tokenResponse.ok) throw new Error("Google OAuth token exchange failed with HTTP " + tokenResponse.status);
  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) throw new Error("Google OAuth did not return an access token");
  cachedGoogleAccessToken = tokenData.access_token;
  cachedGoogleAccessTokenExpiresAt = now + (Number(tokenData.expires_in) || 3600);
  return cachedGoogleAccessToken;
}

function normalizeUsername(raw) {
  const display = String(raw || "").normalize("NFKC").trim().replace(/\s+/gu, " ");
  const length = Array.from(display).length;
  if (length < 3 || length > 20 || /[\u0000-\u001f\u007f/\\]/u.test(display)) {
    throw new Error("Username must be 3–20 characters and cannot contain slashes or control characters.");
  }
  return { display, canonical: display.toLocaleLowerCase("en-US") };
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}

function firestoreRoot(projectId) {
  return "https://firestore.googleapis.com/v1/projects/" + encodeURIComponent(projectId) + "/databases/(default)/documents";
}
function firestoreFieldString(doc, field) {
  return doc?.fields?.[field]?.stringValue || "";
}

async function fetchFirestoreIndex(projectId, accessToken, indexId) {
  const response = await fetch(firestoreRoot(projectId) + "/usernameIndex/" + encodeURIComponent(indexId), {
    headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" }
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Firestore username index read failed with HTTP " + response.status);
  return response.json();
}

async function findLegacyUser(projectId, accessToken, canonical) {
  // Existing Slugger accounts predate usernameIndex/ and only store username.
  // Scan the small legacy users collection once per previously-unindexed username.
  let pageToken = "";
  const matches = [];
  for (let page = 0; page < 10; page++) {
    const url = new URL(firestoreRoot(projectId) + "/users");
    url.searchParams.set("pageSize", "1000");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const response = await fetch(url.toString(), {
      headers: { Authorization: "Bearer " + accessToken, Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Firestore legacy account lookup failed with HTTP " + response.status);
    const body = await response.json();
    for (const doc of (body.documents || [])) {
      const existingName = firestoreFieldString(doc, "username");
      const existingLower = firestoreFieldString(doc, "usernameLower") || existingName.toLocaleLowerCase("en-US");
      if (existingName && existingLower.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-US") === canonical) {
        const uid = String(doc.name || "").split("/").pop();
        if (uid) matches.push({ uid, username: existingName });
      }
    }
    pageToken = body.nextPageToken || "";
    if (!pageToken) return matches;
  }
  if (pageToken) throw new Error("More than 10,000 legacy accounts exist; username migration needs an indexed lookup.");
  return matches;
}

async function saveUsernameIndex(projectId, accessToken, indexId, uid, display, canonical) {
  const url = firestoreRoot(projectId) + "/usernameIndex/" + encodeURIComponent(indexId) + "?currentDocument.exists=false";
  const response = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + accessToken, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ fields: {
      uid: { stringValue: uid },
      username: { stringValue: display },
      usernameLower: { stringValue: canonical }
    } })
  });
  if (!response.ok && response.status !== 409 && response.status !== 400) {
    throw new Error("Firestore username index write failed with HTTP " + response.status);
  }
  // A concurrent login may have written the index first; verify the winning mapping.
  if (!response.ok) {
    const prior = await fetchFirestoreIndex(projectId, accessToken, indexId);
    const priorUid = firestoreFieldString(prior, "uid");
    if (!priorUid) throw new Error("Could not finalize username index mapping");
    return { uid: priorUid, username: firestoreFieldString(prior, "username") || display };
  }
  return { uid, username: display };
}

async function resolveUsername(projectId, accessToken, display, canonical) {
  const indexId = "u_" + await sha256Hex("slugger-username-index-v054|" + canonical);
  const index = await fetchFirestoreIndex(projectId, accessToken, indexId);
  if (index) {
    const uid = firestoreFieldString(index, "uid");
    if (!uid) throw new Error("Username index record is incomplete");
    return { uid, username: firestoreFieldString(index, "username") || display };
  }

  const legacyMatches = await findLegacyUser(projectId, accessToken, canonical);
  if (legacyMatches.length > 1) {
    const err = new Error("More than one older account uses this username. Ask the owner to resolve duplicate usernames before continuing.");
    err.status = 409;
    throw err;
  }
  const uid = legacyMatches.length === 1
    ? legacyMatches[0].uid
    : "slugger_u_" + await sha256Hex("slugger-username-account-v054|" + canonical);
  const accountName = legacyMatches.length === 1 ? legacyMatches[0].username : display;
  return saveUsernameIndex(projectId, accessToken, indexId, uid, accountName, canonical);
}

async function issueUsernameToken(request, env, headers) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, headers);
  let body;
  try { body = await request.json(); } catch (_) { return json({ error: "Expected a JSON body with a username" }, 400, headers); }
  let identity;
  try { identity = normalizeUsername(body?.username); }
  catch (e) { return json({ error: e.message }, 400, headers); }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(String(env.FIREBASE_SERVICE_ACCOUNT_JSON || ""));
  } catch (_) {
    return json({ error: "Username login is not configured: Firebase service-account JSON is missing or invalid." }, 503, headers);
  }
  const projectId = String(serviceAccount.project_id || env.FIREBASE_PROJECT_ID || "").trim();
  if (!projectId || !serviceAccount.client_email || !serviceAccount.private_key) {
    return json({ error: "Username login is not configured: Firebase service-account JSON must include project_id, client_email, and private_key." }, 503, headers);
  }

  try {
    const accessToken = await googleAccessToken(serviceAccount);
    const account = await resolveUsername(projectId, accessToken, identity.display, identity.canonical);
    const now = Math.floor(Date.now() / 1000);
    const customToken = await signJwt({
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: TOKEN_AUDIENCE,
      iat: now,
      exp: now + 3600,
      uid: account.uid,
      claims: { username: account.username, usernameLower: identity.canonical, loginMethod: "username-only" }
    }, serviceAccount);
    return json({ customToken, username: account.username }, 200, headers);
  } catch (e) {
    console.error("Username-only auth failed:", String(e?.message || e));
    return json({ error: e.status === 409 ? e.message : "Username sign-in is temporarily unavailable. Check the Cloudflare Worker Firebase service-account setup." }, e.status || 503, headers);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Normalize each configured entry to its origin. This tolerates a mistakenly pasted
    // GitHub Pages URL with a repository path, while still requiring an exact origin match.
    const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map(x => {
      const value = x.trim(); if (!value) return "";
      try { return new URL(value.includes("://") ? value : "https://" + value).origin; } catch (_) { return ""; }
    }).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    let normalizedOrigin = ""; try { normalizedOrigin = origin ? new URL(origin).origin : ""; } catch (_) {}
    const corsOrigin = normalizedOrigin && allowed.includes(normalizedOrigin) ? normalizedOrigin : "";
    const headers = {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin"
    };
    if (corsOrigin) {
      headers["Access-Control-Allow-Origin"] = corsOrigin;
      headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
      headers["Access-Control-Allow-Headers"] = "Accept, Content-Type";
      headers["Access-Control-Max-Age"] = "86400";
    }
    if (request.method === "OPTIONS") {
      if (!origin || !corsOrigin) return json({ error: "Origin is not allowed" }, 403, headers);
      return new Response(null, { status: 204, headers });
    }
    if (!origin || !corsOrigin) return json({ error: "Origin is not allowed", hint: "Configure ALLOWED_ORIGINS with your GitHub Pages origin (scheme and hostname)." }, 403, headers);

    if (url.pathname === "/health") return json({
      ok: true,
      usernameLoginConfigured: !!String(env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim(),
      turnConfigured: !!String(env.METERED_DOMAIN || "").trim() && !!String(env.METERED_CREDENTIAL_API_KEY || "").trim(),
      originAccepted: true
    }, 200, headers);
    if (url.pathname === "/username-token") return issueUsernameToken(request, env, headers);
    if (url.pathname !== "/ice-servers") return json({ error: "Not found" }, 404, headers);
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, headers);

    const domain = String(env.METERED_DOMAIN || "").trim();
    const apiKey = String(env.METERED_CREDENTIAL_API_KEY || "").trim();
    if (!/^[a-z0-9.-]+\.metered\.live$/i.test(domain) || !apiKey) {
      return json({ error: "TURN provider is not configured" }, 503, headers);
    }
    try {
      const apiUrl = "https://" + domain + "/api/v1/turn/credentials?apiKey=" + encodeURIComponent(apiKey);
      const upstream = await fetch(apiUrl, { headers: { Accept: "application/json" }, cf: { cacheTtl: 0, cacheEverything: false } });
      if (!upstream.ok) return json({ error: "TURN provider returned HTTP " + upstream.status }, 502, headers);
      const iceServers = await upstream.json();
      const entries = Array.isArray(iceServers) ? iceServers : [];
      const hasTurn = entries.some(entry => {
        const urls = Array.isArray(entry && entry.urls) ? entry.urls : [entry && entry.urls];
        return urls.some(value => typeof value === "string" && /^turns?:/i.test(value));
      });
      if (!hasTurn) return json({ error: "TURN provider returned no relay servers" }, 502, headers);
      return json(entries, 200, headers);
    } catch (_) {
      return json({ error: "Unable to retrieve TURN configuration" }, 502, headers);
    }
  }
};
