export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowed = String(env.ALLOWED_ORIGINS || "")
      .split(",").map(x => x.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const corsOrigin = allowed.includes(origin) ? origin : "";
    const headers = {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Origin"
    };
    if (corsOrigin) {
      headers["Access-Control-Allow-Origin"] = corsOrigin;
      headers["Access-Control-Allow-Methods"] = "GET, OPTIONS";
      headers["Access-Control-Allow-Headers"] = "Accept, Content-Type";
      headers["Access-Control-Max-Age"] = "86400";
    }
    if (url.pathname !== "/ice-servers") {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers });
    }
    if (!origin || !corsOrigin) {
      return new Response(JSON.stringify({ error: "Origin is not allowed" }), { status: 403, headers });
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }
    const domain = String(env.METERED_DOMAIN || "").trim();
    const apiKey = String(env.METERED_CREDENTIAL_API_KEY || "").trim();
    if (!/^[a-z0-9.-]+\.metered\.live$/i.test(domain) || !apiKey) {
      return new Response(JSON.stringify({ error: "TURN provider is not configured" }), { status: 503, headers });
    }
    try {
      const apiUrl = "https://" + domain + "/api/v1/turn/credentials?apiKey=" + encodeURIComponent(apiKey);
      const upstream = await fetch(apiUrl, { headers: { "Accept": "application/json" }, cf: { cacheTtl: 0, cacheEverything: false } });
      if (!upstream.ok) {
        // Never forward upstream response text, as provider errors may contain sensitive details.
        return new Response(JSON.stringify({ error: "TURN provider returned HTTP " + upstream.status }), { status: 502, headers });
      }
      const iceServers = await upstream.json();
      const entries = Array.isArray(iceServers) ? iceServers : [];
      const hasTurn = entries.some(entry => {
        const urls = Array.isArray(entry && entry.urls) ? entry.urls : [entry && entry.urls];
        return urls.some(value => typeof value === "string" && /^turns?:/i.test(value));
      });
      if (!hasTurn) {
        return new Response(JSON.stringify({ error: "TURN provider returned no relay servers" }), { status: 502, headers });
      }
      return new Response(JSON.stringify(entries), { status: 200, headers });
    } catch (_) {
      return new Response(JSON.stringify({ error: "Unable to retrieve TURN configuration" }), { status: 502, headers });
    }
  }
};
