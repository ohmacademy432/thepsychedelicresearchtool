# The Psychedelic Nurse — Clinical Research Companion

Clinical research companion for licensed facilitators and clinicians working
with plant medicines. Ask clinical questions, get researched answers with
citations.

Substances covered: Iboga / Ibogaine, Psilocybin, LSD, MDMA, 5-MeO-DMT,
N,N-DMT, Ayahuasca, Kambo.

**For approved licensed facilitators, clinicians, nurses, therapists, and
physicians only.** Access is gated; casual public use is not intended.

## Disclaimer

Clinical research companion — **not medical advice**. AI-generated research
is provided as decision support; verify with independent clinical review
before making treatment decisions. Every flagged interaction requires
licensed clinician sign-off before ceremony work. The tool is a
harm-reduction reference, not a substitute for medical screening,
prescriber review, or clinical judgment.

## Privacy

Submitted questions are sent to a Netlify serverless function that calls
the Claude API (with web search) to research the question. The response
streams back to the browser. The browser history is React-state only and
clears on tab close. No screening content is persisted on any server —
Netlify does not log request bodies, and the API key lives only in
server-side environment variables.

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
- Static deploy to Netlify (auto-deploy from GitHub `main` when configured)

## Data

The seed file [`src/data/seed-data.json`](src/data/seed-data.json) contains
a hand-curated reference (GITA, MAPS, Conclave Best Practices, and
historical OHM protocols authored by The Psychedelic Nurse prior to
rebrand). It is retained for reference and for any future offline or
fallback lookup, but the live chat UI does not query it directly — it
routes screening questions to the Claude API with web search.

## About

Published by [The Psychedelic Nurse](https://www.thepsychedelicnurse.org) as
a harm-reduction resource for the clinical facilitator community.
