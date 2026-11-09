# CareAccess Bengaluru — Measured impact

All numbers below come from runs executed on **9 November 2026 (UTC 15:57–15:59)** against the live system. Nothing here is a forecast or estimate.

## Method

- **Tool arm:** the 12 synthetic personas in `data/personas.json` were each sent once through the CareAccess proxy to the deployed watsonx Orchestrate agent (`impact/measure.js`). A run passes if the reply recommends the persona's expected facility type. Raw output: `impact/results.json`.
- **Manual arm:** the same 12 personas were worked by an operator using ordinary web search (one query per persona, top-3 results inspected, queries and raw results in `impact/baseline_raw.txt`). A persona passes if the correct facility type (or a correct named facility) is identifiable in those top-3 results. This is a generous bar for the manual arm: the operator still has to open pages, extract address/timings/documents, and judge eligibility — steps the tool completes inside the same answer.

## Results

| Measure | Manual web search | CareAccess |
|---|---|---|
| Personas routed to correct facility type | **9 / 12** | **12 / 12** |
| Requests/steps per persona | 1 search + page reading (not counted against it) | 1 request |
| Median response time | ~0.48s search latency (operator is scripted; a phone user is far slower) | 3.5s mean end-to-end answer |

Manual-arm failures:

- **persona-b** (fever, Rajajinagar): top results were a COVID-era BBMP page and an unrelated listing.
- **persona-d** (child vaccination, Malleswaram, no ID): top results were U-WIN program pages, not a facility.
- **persona-i** (dental, HSR Layout): top results were private clinics; no government facility identified.

## Interpretation

On this 12-persona synthetic benchmark, CareAccess routed every persona to the correct facility type in a single ~3.5 second request, while a scripted web-search operator missed 3 of 12 (25%) even before the reading and cross-checking a real person would need. The failure modes (outdated pages, program portals instead of facilities, private-only results) are exactly the friction the tool is built to remove.

## Reproduce

```bash
cd proxy && ORCHESTRATE_API_KEY=... ORCHESTRATE_BASE_URL=... AGENT_ID=... node server.js &
PROXY_URL=http://localhost:3000 node impact/measure.js
```

Baseline queries and raw top-3 results: `impact/baseline_raw.txt`.
