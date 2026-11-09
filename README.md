# CareAccess Bengaluru

Find the right free or low-cost government health facility in Bengaluru in one question — in English, Kannada, or Hindi.

CareAccess is a small web app for Bengaluru residents who do not know where to go for a health need: which government clinic, hospital, or speciality institute serves their area, what it offers, when it is open, and what documents to bring. It answers in plain language with a short list of matching facilities, and it always shows the 108 ambulance number for emergencies. It never gives medical advice.

## How it works

```
web/ (static app)  →  proxy/ (Node, zero deps)  →  IBM watsonx Orchestrate agent
intake + results      holds the API key,           care_navigator
EN / KN / HI          calls chat completions       + clinic_lookup tool
```

- `agent/care_navigator.yaml` — the Orchestrate agent definition.
- `tools/clinic_lookup.py` — the agent's Python tool: keyword-matches the intake to the facility dataset and returns the top facilities.
- `data/facilities.json` — 16-facility dataset (see data note below).
- `data/personas.json` — 12 synthetic test personas.
- `web/` — single-page app, no build step, trilingual, offline-preview fallback.
- `proxy/` — token exchange + chat completions + static hosting in one service.
- `impact/` — measured benchmark: tool 12/12 vs manual web search 9/12, with raw logs.
- `demo/` — screen recording of the live flow (EN → KN → HI).

## Run locally

```bash
cd proxy
cp .env.example .env   # fill in ORCHESTRATE_API_KEY, ORCHESTRATE_BASE_URL, AGENT_ID
node server.js         # serves the app and /api/navigate on :3000
```

Open http://localhost:3000. Without a proxy the page still works in labelled "offline preview" mode.

## Data note

`data/facilities.json` is an **illustrative synthetic dataset** assembled for this prototype. The government speciality institutes and major hospitals it names are real, well-known Bengaluru institutions; the BBMP UPHC entries are representative placeholders, not verified listings. No real patient or personal data is used anywhere in this project — all personas are synthetic.

## Safety

The agent gives navigation help only. Its instructions forbid medical advice, and every answer carries a disclaimer plus the 108 emergency number. Facility data would need verification against official BBMP/Karnataka sources before any real deployment.
