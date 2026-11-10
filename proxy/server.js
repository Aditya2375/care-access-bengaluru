/**
 * CareAccess Bengaluru — proxy/server.js
 * Node 18+, zero npm dependencies.
 * Uses built-in `http` module and the global `fetch` (Node 18+).
 */

"use strict";

const http = require("http");
const fs   = require("fs");
const path = require("path");

/* ── Env ─────────────────────────────────────────────────────────────── */
const {
  ORCHESTRATE_API_KEY,
  ORCHESTRATE_BASE_URL,
  AGENT_ID,
  PORT = "3000",
} = process.env;

const IAM_TOKEN_URL = "https://account-iam.platform.saas.ibm.com/api/2.0/apikeys/token";

/* ── Token cache ─────────────────────────────────────────────────────── */
let _cachedToken    = null;   // string
let _tokenFetchedAt = 0;      // ms since epoch
const TOKEN_TTL_MS  = 50 * 60 * 1000; // 50 minutes (5 min before 55-min typical expiry)

async function getToken() {
  const now = Date.now();
  if (_cachedToken && now - _tokenFetchedAt < TOKEN_TTL_MS) {
    return _cachedToken;
  }

  const res = await fetch(IAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey: ORCHESTRATE_API_KEY }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IAM token exchange failed: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  // IBM IAM returns { token: "...", ... } or { access_token: "...", ... }
  const token = data.token || data.access_token;
  if (!token) {
    throw new Error("IAM response did not contain a token field.");
  }

  _cachedToken    = token;
  _tokenFetchedAt = now;
  return _cachedToken;
}

/* ── Build OpenAI-style user message from intake ─────────────────────── */
function buildUserMessage({ area, need, has_id, language }) {
  const idText = has_id ? "yes" : "no";
  return (
    `I am in ${area}, Bengaluru. ` +
    `I need care for: ${need}. ` +
    `I have a government ID: ${idText}. ` +
    `Please respond in ${language === "KN" ? "Kannada" : language === "HI" ? "Hindi" : "English"}.`
  );
}

/* ── Accumulate SSE stream into plain text ───────────────────────────── */
async function accumulateSse(response) {
  // response.body is a ReadableStream (Node 18 fetch)
  const reader  = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let   buffer  = "";
  let   reply   = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Process complete lines
    const lines = buffer.split("\n");
    // Keep last potentially-incomplete chunk in the buffer
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const chunk = JSON.parse(payload);
        // OpenAI-style delta
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) reply += delta;
        // Also handle non-streaming plain content field
        const content = chunk?.choices?.[0]?.message?.content;
        if (content && !delta && !reply) reply += content;
      } catch {
        // Unparseable SSE line — skip
      }
    }
  }

  // Flush remaining buffer
  if (buffer.trim().startsWith("data:")) {
    const payload = buffer.trim().slice(5).trim();
    if (payload && payload !== "[DONE]") {
      try {
        const chunk = JSON.parse(payload);
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) reply += delta;
      } catch { /* ignore */ }
    }
  }

  return reply.trim();
}

/* ── POST /api/navigate ──────────────────────────────────────────────── */
async function handleNavigate(req, res) {
  let body = "";
  req.on("data", (chunk) => { body += chunk; });
  await new Promise((resolve) => req.on("end", resolve));

  let intake;
  try {
    intake = JSON.parse(body);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body." });
  }

  const { area, need, has_id, language } = intake;
  if (!area || !need) {
    return sendJson(res, 400, { error: "Missing required fields: area, need." });
  }

  if (!ORCHESTRATE_API_KEY || !ORCHESTRATE_BASE_URL || !AGENT_ID) {
    return sendJson(res, 503, { error: "Proxy is not configured (missing env vars)." });
  }

  let token;
  try {
    token = await getToken();
  } catch (err) {
    console.error("[navigate] token exchange error:", err.message);
    return sendJson(res, 502, { error: "Could not authenticate with the AI service." });
  }

  const userMessage = buildUserMessage({ area, need, has_id, language });
  const chatUrl     = `${ORCHESTRATE_BASE_URL.replace(/\/$/, "")}/v1/orchestrate/${AGENT_ID}/chat/completions`;

  let upstreamRes;
  try {
    upstreamRes = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        stream: true,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch (err) {
    console.error("[navigate] upstream fetch error:", err.message);
    return sendJson(res, 502, { error: "Could not reach the AI service." });
  }

  if (!upstreamRes.ok) {
    const text = await upstreamRes.text().catch(() => "");
    console.error(`[navigate] upstream error: ${upstreamRes.status} — ${text.slice(0, 300)}`);
    return sendJson(res, 502, { error: `AI service returned ${upstreamRes.status}.` });
  }

  let replyMarkdown;
  try {
    replyMarkdown = await accumulateSse(upstreamRes);
  } catch (err) {
    console.error("[navigate] SSE accumulation error:", err.message);
    return sendJson(res, 502, { error: "Error reading AI service response." });
  }

  return sendJson(res, 200, { reply_markdown: replyMarkdown });
}

/* ── Static file server (../web) ─────────────────────────────────────── */
const WEB_DIR = path.resolve(__dirname, "..", "web");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".ico":  "image/x-icon",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".txt":  "text/plain; charset=utf-8",
};

function serveStatic(req, res) {
  // Sanitise: strip query string, decode, collapse traversal
  let urlPath = req.url.split("?")[0];
  try { urlPath = decodeURIComponent(urlPath); } catch { urlPath = "/"; }

  // Default to index.html
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  // Prevent path traversal: resolve and confirm still inside WEB_DIR
  const resolved = path.resolve(WEB_DIR, "." + urlPath);
  if (!resolved.startsWith(WEB_DIR + path.sep) && resolved !== WEB_DIR) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(resolved, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("Not found");
      } else {
        res.writeHead(500);
        res.end("Server error");
      }
      return;
    }
    const ext  = path.extname(resolved).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type":  "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; });
    req.on("end",  ()      => resolve(data));
    req.on("error", reject);
  });
}

/* ── Request router ──────────────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const urlPath = url.split("?")[0];

  // CORS: the web app is served from GitHub Pages; local dev uses file:// or localhost
  const origin = req.headers.origin || "";
  const allowed = [
    "https://aditya2375.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    if (method === "OPTIONS" && urlPath === "/api/navigate") {
      res.writeHead(204);
      return res.end();
    }

    if (method === "GET" && urlPath === "/health") {
      return sendJson(res, 200, { status: "ok" });
    }

    if (method === "POST" && urlPath === "/api/navigate") {
      return await handleNavigate(req, res);
    }

    if (method === "GET") {
      return serveStatic(req, res);
    }

    // Method not allowed / unknown route
    res.writeHead(404);
    res.end("Not found");
  } catch (err) {
    console.error("[server] unhandled error:", err.message);
    if (!res.headersSent) {
      sendJson(res, 500, { error: "Internal server error." });
    }
  }
});

/* ── Start ───────────────────────────────────────────────────────────── */
const port = parseInt(PORT, 10) || 3000;
server.listen(port, () => {
  console.log(`CareAccess proxy listening on port ${port}`);
  console.log(`Serving static files from: ${WEB_DIR}`);
  if (!ORCHESTRATE_API_KEY) console.warn("[warn] ORCHESTRATE_API_KEY is not set.");
  if (!ORCHESTRATE_BASE_URL) console.warn("[warn] ORCHESTRATE_BASE_URL is not set.");
  if (!AGENT_ID)             console.warn("[warn] AGENT_ID is not set.");
});
