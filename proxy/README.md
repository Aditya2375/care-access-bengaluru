# CareAccess Bengaluru — Proxy

A minimal Node 18+ HTTP server with zero npm dependencies. It:

- Holds the watsonx Orchestrate API key server-side (the browser never sees it).
- Exchanges the key for a short-lived IAM bearer token, cached for 50 minutes.
- Forwards `POST /api/navigate` to the Orchestrate agent, accumulates the SSE stream, and returns `{ reply_markdown }`.
- Serves the sibling `../web` directory as static files so one Render service hosts both frontend and proxy.
- Exposes `GET /health` → `{ "status": "ok" }`.

---

## Local development

```bash
# 1. Copy the example env file and fill in your values
cp .env.example .env

# 2. Source it (or use a tool like dotenv-cli)
export $(grep -v '^#' .env | xargs)

# 3. Start
node server.js
# → CareAccess proxy listening on port 3000

# 4. Open http://localhost:3000 in your browser
```

> If `ORCHESTRATE_API_KEY` is not set the proxy starts anyway and returns a 503 on `/api/navigate`. The frontend will fall back to its offline local-match mode automatically.

---

## Deploy to Render (free Web Service)

1. **Push** this repository to GitHub (or GitLab).
2. In the [Render dashboard](https://dashboard.render.com) click **New → Web Service**.
3. Connect your repository.
4. Set the following fields:

   | Field | Value |
   |---|---|
   | **Root directory** | `proxy` |
   | **Runtime** | `Node` |
   | **Build command** | *(leave blank)* |
   | **Start command** | `node server.js` |

5. Under **Environment**, add these three secret vars:

   | Key | Value |
   |---|---|
   | `ORCHESTRATE_API_KEY` | Your Orchestrate API key |
   | `ORCHESTRATE_BASE_URL` | Your Orchestrate instance base URL |
   | `AGENT_ID` | Your agent ID |

   Render injects `PORT` automatically — do not add it manually.

6. Click **Create Web Service**.

> **Note:** Render free instances spin down after ~15 minutes of inactivity. The first request after a sleep period will take a few seconds while the instance wakes up. The frontend's offline fallback ensures users still see local results during that cold-start window.
