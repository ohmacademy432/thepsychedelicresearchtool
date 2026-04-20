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

The tool is fully client-side. Nothing is saved, transmitted, or logged. No
participant information ever leaves the browser. The current screening
session lives only in React state and is cleared on page reload.

## Setup

Requires Node.js 20+ and npm.

```bash
npm install
npm run dev      # local dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # serve the built bundle locally
```

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Static deploy to Netlify (auto-deploy from GitHub `main`)

## Data

All interaction data lives in [`src/data/seed-data.json`](src/data/seed-data.json).
That file is the **single source of truth**. Do not add, modify, or remove
interaction entries without a citation to one of the listed clinical sources.
