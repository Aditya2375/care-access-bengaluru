#!/usr/bin/env node
/**
 * CareAccess Bengaluru - impact measurement.
 * Runs the 12 synthetic personas in data/personas.json through the live
 * watsonx Orchestrate agent (via the CareAccess proxy) and measures:
 *   - whether the reply recommends the expected facility type
 *   - wall-clock latency per request
 * Writes impact/results.json and prints a summary. Always exits 0.
 *
 * Usage: PROXY_URL=http://localhost:3000 node impact/measure.js
 */
const fs = require("fs");
const path = require("path");

const PROXY_URL = (process.env.PROXY_URL || "http://localhost:3000").replace(/\/$/, "");
const personas = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "personas.json"), "utf8")
);

// Facility-type keyword groups used to score a reply.
const TYPE_KEYWORDS = {
  uphc: ["uphc", "urban primary health", "primary health centre", "primary health center"],
  referral_hospital: ["referral hospital", "general hospital", "hospital"],
  government_specialty: ["specialt", "jayadeva", "kidwai", "nimhans", "victoria", "bowring", "hospital"],
  emergency: ["108", "emergency", "ambulance"],
};

function matchesType(replyText, expectedType) {
  const text = replyText.toLowerCase();
  const keywords = TYPE_KEYWORDS[expectedType] || [expectedType.toLowerCase()];
  return keywords.some((k) => text.includes(k));
}

async function runPersona(p) {
  const body = {
    area: p.area,
    need: p.need,
    has_id: p.has_id ? "yes" : "no",
    language: (p.language || "en").toUpperCase(),
  };
  const started = Date.now();
  let reply = "";
  let error = null;
  try {
    const res = await fetch(`${PROXY_URL}/api/navigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    reply = data.reply_markdown || "";
  } catch (e) {
    error = String(e && e.message ? e.message : e);
  }
  const latency_ms = Date.now() - started;
  const pass = error ? false : matchesType(reply, p.expected_facility_type);
  return {
    persona: p.id,
    area: p.area,
    need: p.need,
    language: body.language,
    expected_facility_type: p.expected_facility_type,
    pass,
    latency_ms,
    error,
    snippet: reply.slice(0, 300),
  };
}

(async () => {
  const results = [];
  for (const p of personas) {
    const r = await runPersona(p);
    results.push(r);
    console.log(
      `${r.pass ? "PASS" : "FAIL"}  ${r.persona}  ${r.area}/${r.need}  ${r.latency_ms}ms${r.error ? "  (" + r.error + ")" : ""}`
    );
  }
  const passed = results.filter((r) => r.pass).length;
  const latencies = results.filter((r) => !r.error).map((r) => r.latency_ms);
  const mean = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : null;
  const summary = {
    measured_at: new Date().toISOString(),
    proxy_url: PROXY_URL,
    total: results.length,
    passed,
    pass_rate: results.length ? passed / results.length : 0,
    mean_latency_ms: mean,
    min_latency_ms: latencies.length ? Math.min(...latencies) : null,
    max_latency_ms: latencies.length ? Math.max(...latencies) : null,
  };
  const out = { summary, results };
  fs.writeFileSync(
    path.join(__dirname, "results.json"),
    JSON.stringify(out, null, 2)
  );
  console.log("\nSummary:", JSON.stringify(summary, null, 2));
  process.exit(0);
})();
