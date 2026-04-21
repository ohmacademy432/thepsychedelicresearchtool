# OHM Academy — Facilitator Screening Tool

An internal lookup tool for OHM Academy of Spiritual Healing facilitators to
check medication, supplement, and street-drug compatibility with the plant
medicines used in ceremony work (Iboga / Ibogaine, Psilocybin, LSD, MDMA,
5-MeO-DMT, N,N-DMT, Ayahuasca, Kambo).

**For OHM Academy facilitators only.** This tool is not for general public use.

## Disclaimer

Harm-reduction reference only. **Not medical advice.** Every flagged
interaction requires licensed clinician sign-off before ceremony. The data in
this tool was hand-curated from clinical-grade sources (GITA Clinical
Guidelines, MAPS, Conclave Best Practices, OHM's own protocols), but it is a
reference aid — not a substitute for medical screening, prescriber review, or
clinical judgment.

If a substance combination is not present in the reference, the tool will
display **"Not in reference — escalate to medical review"**. Do not infer
safety from absence.

## Privacy

Participant questions are sent to a Netlify serverless function that calls
the Claude API (with web search) to research the question. The response
streams back to the browser. The browser history is React-state only and
clears on tab close. No screening content is persisted on any server —
Netlify does not log request bodies, and the API key lives only in server
env vars.

## Setup

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev      # static Vite dev server only — API calls WILL FAIL
npm run build    # type-check + production build to /dist
npm run preview  # serve the built bundle locally
```

To run the app with the serverless function wired up locally, use the
Netlify CLI (installed as a devDependency):

```bash
npx netlify dev  # Vite + serverless function on a single port (usually :8888)
```

### API key setup

Local dev requires a file `.env.local` in the project root with your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com). The
key is **never committed to git** — `.env.local` is covered by
`.gitignore`. The serverless function reads the key server-side only; the
browser never sees it.

Production deployment requires the same `ANTHROPIC_API_KEY` environment
variable to be set in Netlify's dashboard under **Site settings →
Environment variables**. Never commit the key to git.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Netlify serverless function (`netlify/functions/ask.ts`) wraps the
  Anthropic SDK with web search enabled, streams text back to the browser
- Static deploy to Netlify (auto-deploy from GitHub `main`)

## Data

The seed file [`src/data/seed-data.json`](src/data/seed-data.json) contains
OHM's hand-curated reference (GITA, MAPS, Conclave Best Practices, OHM's
own protocols). It is retained for reference and for any future offline or
fallback lookup, but the live chat UI does not query it directly — it
routes screening questions to the Claude API with web search.
