# The Psychedelic Nurse — Clinical Research Companion — Project Metadata

**Read this first when opening this project in any Cowork / Claude Code session.**

---

## Working rules (April's preferences)

### 1. No deploy without explicit approval

Edits are saved to local files only. Do **not** run `git add`, `git commit`, or `git push` unless April explicitly says "commit and push," "deploy," or equivalent. She prefers to test locally first and batch deploys to conserve Netlify build minutes.

When you finish a set of edits, summarize what changed in plain language and wait. Let April decide when to ship.

### 2. Confirm accounts before touching connected services

Before any operation that writes to GitHub, Netlify, Supabase, or similar external service: (a) read the current configuration (`git remote -v`, `.netlify/state.json`, Supabase project IDs, etc.), (b) summarize which account owns what, (c) ask April to confirm before proceeding. She maintains multiple accounts across these platforms; the wrong one getting wired up is a real risk worth the extra 10 seconds of friction.

---

## Account map (confirmed April 21, 2026)

| Service | Account / identifier | How it was verified |
|---|---|---|
| GitHub | `ohmacademy432` (repo renamed to: `thepsychedelicresearchtool`) | Confirm with `git remote -v` — update remote URL to new repo name via `git remote set-url origin <new-url>` |
| Netlify | **Confirm in Netlify dashboard** — no local state file linking the CLI | Netlify auto-deploys from GitHub `main`; the site is configured in the Netlify dashboard, not via `netlify link`. April should fill in the account name here when confirmed. |
| Anthropic API | Key in `.env.local` (local dev) and Netlify site env vars (production) as `ANTHROPIC_API_KEY` | Referenced in `netlify/functions/ask.ts` |

If any of those change, update this file.

---

## Project summary

React + Vite + TypeScript web app, deploy target Netlify. Published under **The Psychedelic Nurse** brand (thepsychedelicnurse.org). Facilitator/clinician-only clinical research companion for plant-medicine screening questions. The browser sends a formatted question to a Netlify serverless function (`netlify/functions/ask.ts`), which calls the Anthropic API with web search enabled and streams a markdown answer back.

Audience is **approved licensed facilitators, clinicians, nurses, therapists, and physicians** working with plant medicines. Access is gated via Supabase Auth + admin approval (per-user approval by April before access is granted). Not for public use.

This project was previously branded as "OHM Academy Screening Tool." As of April 2026 it has been rebranded to **The Psychedelic Nurse — Clinical Research Companion**. Historical OHM source citations in seed-data.json are preserved as-is for provenance (they refer to real OHM-era protocol documents).

Substances covered: Iboga / Ibogaine, Psilocybin, LSD, MDMA, 5-MeO-DMT, N,N-DMT, Ayahuasca, Kambo.

---

## Local test workflow

```bash
# Vite + serverless function together on one port (usually :8888)
npx netlify dev
```

The bare Vite dev server (`npm run dev`) will serve the UI but API calls to the screening function will fail — always use `netlify dev` for full-stack local testing.

---

## Rollback

Last known-good commit before the April 21, 2026 Cowork prompt edits: **`e676f7d`**
(*"Phase 2 step 2: wire front-end to API, streaming responses, remove placeholder"*)

To restore:
```bash
git reset --hard e676f7d
```

---

## Notes on recent changes

**April 21, 2026 — Cowork session:** Fixed the AI refusing to answer clinical screening questions despite facilitators being the intended audience. Final state uses two changes:

1. Added an explicit **ANTI-REFUSAL** paragraph to the system prompt, plus a concrete WRONG vs. RIGHT example (fluoxetine + MDMA washout) showing the desired response format and tone.
2. Added a **user-message prefix** (`FACILITATOR SCREENING INQUIRY — OHM Academy...`) that wraps every question before it reaches Claude, reinforcing at the user-turn level that this is a trained facilitator asking in harm-reduction context.

A third approach — an **assistant prefill** of `## The clinical picture` — was tried and removed. The Sonnet 4.6 model does not support assistant prefill (API returns 400 `"This model does not support assistant message prefill"`), so we shifted the anti-refusal weight into the system prompt with a few-shot example instead.

These are saved locally but **not yet committed or deployed**. To ship: test with `npx netlify dev`, then `git add netlify/functions/ask.ts CLAUDE.md && git commit && git push`.

---

**April 22, 2026 — Cowork session:** Rebranded from OHM Academy Screening Tool to **The Psychedelic Nurse — Clinical Research Companion**. Changes:

1. Header and footer updated to new brand, footer now links to thepsychedelicnurse.org
2. `index.html` document title updated
3. `package.json` name changed to `psychedelic-nurse-research-companion`
4. `README.md` rewritten under new brand with updated audience language (licensed facilitators and clinicians)
5. System prompt in `netlify/functions/ask.ts` updated — opening line now references The Psychedelic Nurse instead of OHM Academy of Spiritual Healing
6. User-message prefix updated to `FACILITATOR SCREENING INQUIRY — The Psychedelic Nurse Clinical Research Companion`
7. Seed-data.json `_meta.title` updated; historical OHM source citations in the `sources` and `interactions` arrays preserved as-is for provenance
8. GitHub repo renamed to `thepsychedelicresearchtool` (local git remote needs update: `git remote set-url origin https://github.com/ohmacademy432/thepsychedelicresearchtool.git`)

Also in this session: tightened **SOURCE QUALITY REQUIREMENTS** in the system prompt. The AI must now cite only peer-reviewed literature, official clinical/research organization publications (GITA, MAPS, ICEERS, etc.), official drug information (DailyMed, Medscape, UpToDate), academic medical center resources (MSKCC, Johns Hopkins, etc.), or curated harm-reduction resources with editorial review (Tripsit combo chart, Erowid vault pages). Explicitly forbidden: retreat center blogs (MindScape, Beond, Tandava, etc.), Reddit/forum posts, Substack/personal blogs, YouTube, anonymous trip reports, AI-generated content on other sites, Wikipedia as primary. Removed "EntheoNation" and "Conclave Best Practices" from the practitioner-consensus list — neither has the editorial-review rigor required. When no verifiable sources exist, the AI must say so and fall back to mechanism-based pharmacology analysis grounded in primary literature for the component drugs.

Also added **SOURCE RECENCY FLAGGING** to the system prompt. The netlify function computes `CURRENT_YEAR` at server start; any citation with a publication year at or before `CURRENT_YEAR - 10` gets appended with a markdown warning: `⚠ *Published over 10 years ago — clinical framework may still apply, but verify specific recommendations against newer literature.*`. This keeps foundational but aging sources (GITA Clinical Guidelines from 2015-16, Koenig 2014/2015 hERG papers) in the citation list while making their age visible to the facilitator. Threshold auto-rolls forward each year; no maintenance needed.

---

**April 22, 2026 — Cowork session, later:** Added **Supabase Auth with admin approval gate**.

New dependency: `@supabase/supabase-js` in package.json. Requires `npm install` on first use.

New env vars (add to `.env.local`):
- `VITE_SUPABASE_URL` — the project URL from Supabase dashboard
- `VITE_SUPABASE_ANON_KEY` — the anon/public key (safe for browser; protection comes from RLS policies)

New files:
- `src/lib/supabase.ts` — Supabase client, `Profile` type
- `src/lib/auth-context.tsx` — AuthProvider + useAuth hook; manages session, profile, signUp/signIn/signOut, and listens to onAuthStateChange
- `src/components/SignupScreen.tsx` — request-access form (email, password, name, professional role, credentials, org, request note)
- `src/components/LoginScreen.tsx` — email + password
- `src/components/PendingApprovalScreen.tsx` — shown to logged-in users with `approved=false`; has "Check status" and "Sign out"
- `src/components/AuthScreen.tsx` — toggles between login and signup

Modified files:
- `src/main.tsx` — wraps App with AuthProvider
- `src/App.tsx` — extracted ResearchTool component; App() now routes by auth state: not configured → ConfigErrorScreen · loading → LoadingScreen · no user → AuthScreen · user without profile → setup-incomplete warning · user with !approved → PendingApprovalScreen · user with approved → ResearchTool
- `src/components/Header.tsx` — shows "Sign out" button when a user is signed in
- `src/index.css` — added `.input` utility class for auth form fields
- `CLAUDE.md` — this entry

Database schema (Supabase):
- `profiles` table with: `id` (FK to auth.users), `full_name`, `professional_role`, `credentials`, `organization`, `access_request_note`, `approved` (bool, default false), `approved_at`, `approved_by`, `created_at`, `updated_at`
- RLS: users can SELECT and INSERT their own profile; UPDATE is intentionally NOT exposed to users — approval happens via the Supabase dashboard (which uses service_role and bypasses RLS)

Approval workflow:
1. User signs up via `/` (redirected to AuthScreen) — creates auth.users row + profiles row with `approved=false`
2. User sees PendingApprovalScreen, can sign out or click "Check status"
3. April opens Supabase dashboard → Table Editor → profiles, sets `approved=true` (optionally `approved_at=now()` and `approved_by='April'`)
4. User clicks "Check status" → refetches profile → now approved → sees the ResearchTool

**Important Supabase config step:** disable email confirmation in Supabase dashboard (Authentication → Providers → Email → toggle OFF "Confirm email") for the dev/test workflow. If left on, signups require verifying a real email before the account is usable — fine for production, painful for testing with fake emails.

Not yet deployed. Local testing workflow: `npm install` to pick up new deps, then `npx netlify dev`.

Next planned work: link up a working AI backend (Anthropic once the account_tier issue is resolved, or migrate to OpenAI if needed). Local folder still named `ohmacademytool` (cosmetic; rename in a future session).
