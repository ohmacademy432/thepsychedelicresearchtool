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

## Account map (confirmed April 27, 2026)

| Service | Account / identifier | How it was verified |
|---|---|---|
| GitHub | `ohmacademy432` (repo: `thepsychedelicresearchtool`) | `git remote -v` shows `https://github.com/ohmacademy432/thepsychedelicresearchtool.git` |
| Netlify | Site `psychedelicresearchtool.netlify.app` — Netlify account authenticated via **GitHub OAuth (ohmacademy432)**, NOT via Google. Git-connected: pushes to `main` auto-deploy. | Confirmed April 27, 2026: April set up the site by signing in to Netlify with GitHub and importing `thepsychedelicresearchtool`. Production env vars (`ANTHROPIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) set in Site configuration → Environment variables. |
| Anthropic API | Key in `.env.local` (local dev) and Netlify site env vars (production) as `ANTHROPIC_API_KEY`. **Direct connection** — `ask.ts` uses `@anthropic-ai/sdk` and reads the key from env. NO Netlify AI Gateway, NO proxy. Token usage bills the Anthropic account that owns the key. | Referenced in `netlify/functions/ask.ts`; verified April 27, 2026 by inspecting imports and confirming `@netlify/ai` is only a transitive devDep of `netlify-cli`, not bundled into production. |
| Supabase | Project URL + anon key in env vars; `profiles` table with admin approval gate (RLS allows users SELECT/INSERT their own row; UPDATE only via service_role from dashboard). | See April 22, 2026 session note below. |

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

---

**April 27, 2026 â Cowork session: full go-live preparation.**

Anthropic backend verified â direct API tests against `claude-sonnet-4-6` with `web_search_20260209` and adaptive thinking all returned cleanly. Local end-to-end test with `npx netlify dev` produced a high-quality lithium+ibogaine answer with peer-reviewed sources, working â  over-10-years recency flags, and no refusal. All the prompt-engineering work from April 21-22 holds up.

**Netlify deploy setup:**
- Netlify identity: GitHub OAuth as `ohmacademy432` (NOT Google)
- Site: `psychedelicresearchtool.netlify.app`
- Production env vars set in Netlify dashboard: `ANTHROPIC_API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (values copied from local `.env.local`)
- Auto-deploy on push to `main` is wired
- Confirmed `@netlify/ai` is only a transitive devDep of `netlify-cli` and not bundled into production. Production AI calls go directly from the function to Anthropic with April's key â the previous "Netlify burned tokens" pattern from an earlier setup is not present in this codebase.

**Pre-launch hardening in this commit:**
- `README.md` â removed "Conclave Best Practices" from the data-section sources line (consistency with system prompt's forbidden-source list per the April 22 cleanup)
- `src/types/seed-data.ts` â stale type doc-comment cleaned up to remove Conclave/EntheoNation/Fireside Project from the sourceTier=2 list
- `src/App.tsx` â `ConfigErrorScreen` rewritten with production-friendly copy linking to thepsychedelicnurse.org (was "set values in .env.local and restart the dev server")
- `src/lib/auth-context.tsx` â `signUp()` now passes profile fields via `options.data` (consumed by the database trigger below) and reports back whether email confirmation is required. Manual profile insert removed. **Currently unused by the UI** per the contact-form pivot below; kept correct in case self-signup is ever re-enabled.

**Architectural pivot: signup â contact form.** After hitting Supabase email-delivery flakiness during local testing (verification emails not arriving even on first signup, even with the email-confirmation toggle on), April pivoted the access flow to a contact form. The new model:
- **Old flow:** user submits signup form â creates Supabase auth.users + profiles row â email confirmation â admin approval â access
- **New flow:** user submits contact form â submission emailed to `ohmacademy432@gmail.com` via **Netlify Forms** with subject `The Psychedelic Tool Approval` â April manually creates the auth account in Supabase and emails the user their credentials â user logs in via the existing LoginScreen, lands on PendingApprovalScreen, April flips `approved=true` to grant access
- `src/components/SignupScreen.tsx` replaced entirely. No longer calls `signUp()`. POSTs form-encoded body to `/` with `form-name=contact`. Honeypot field included. Subject baked in.
- `index.html` gets a hidden `<form name="contact" data-netlify="true">` so Netlify's build-time form detector picks it up. Field names match the React form. Hidden `subject` field forces every notification email to arrive with `The Psychedelic Tool Approval` as its subject â April will set up a Gmail priority filter on this exact subject so requests don't sit unread for days.

**Supabase database state (already in place, persists across this deploy):**
- `profiles` table with admin approval gate (RLS allows users SELECT/INSERT their own row; UPDATE only via service_role from dashboard)
- `handle_new_user()` Postgres function + `on_auth_user_created` trigger on `auth.users`. Trigger creates a profiles row from `raw_user_meta_data` whenever a new auth user is inserted. Currently unused by the UI (since signUp is no longer called from the contact form), but harmless. Will still fire when April creates a user via Supabase dashboard "Add new user" â produces a minimal profiles row with empty metadata fields; she then edits the row to populate full_name etc. before flipping `approved=true`.
- Email confirmation toggle in Authentication â Providers â Email: **not load-bearing for the new flow.** Can be left in either state; recommend OFF since users won't hit the self-signup path that triggers verification emails.

**Manual onboarding workflow (going forward):**
1. Prospective facilitator visits the site â "Request access" â submits the contact form
2. April receives email at `ohmacademy432@gmail.com` with subject `The Psychedelic Tool Approval` containing all submitted fields
3. April reviews credentials. If approved:
   a. Supabase dashboard â Authentication â Users â "Add new user" â enter their email + a temporary password
   b. The `on_auth_user_created` trigger creates a minimal profiles row
   c. April edits that profiles row in Table Editor to populate `full_name`, `professional_role`, `credentials`, `organization`, `access_request_note` from the email she received, then sets `approved=true`
   d. April emails the user with their email + temporary password and the login URL (`psychedelicresearchtool.netlify.app`)
4. User logs in via LoginScreen â lands directly on the ResearchTool (skipping PendingApprovalScreen since `approved=true` is already set)

**One Netlify dashboard step required after first deploy:** Site dashboard â Forms â Form notifications â confirm `ohmacademy432@gmail.com` is listed as a recipient for the `contact` form. Netlify usually auto-uses the account email; verify it points where intended. Free tier covers 100 form submissions/month, far above expected volume.

**Other housekeeping in this commit:**
- `.gitignore` adds `deno.lock` (a dev-tool cache that `netlify dev` writes locally; should not be tracked)
- Updated **Account map** table (top of this file) to reflect confirmed Netlify identity and Git-connected deploy
- Locally fixed `.env.local` line endings from CRLF â LF to prevent any future tooling that reads it raw from picking up trailing `
` on values. (Not committed â `.env.local` is gitignored.)

`MAX_TOKENS` in `ask.ts` left at 8192 â April confirmed the lithium answer rendered fully without truncation. Bump to 16384 is a future option if longer answers ever cut off.

Next: deploy this commit, confirm Netlify Forms notification recipient, smoke-test the live URL end-to-end with a real contact-form submission, then process April's first real access request via the manual onboarding workflow above.

---

**April 27, 2026 — Cowork session, evening: migrated `ask.ts` from Netlify Functions to Netlify Edge Functions.**

After going live earlier in the day, April hit `HTTP 504 Gateway Timeout` on her first complex screening question (Lexapro + Psilocybin candidacy). Root cause: regular Netlify Functions have a 26-second streaming-response window, but adaptive thinking + web search routinely takes 30-50s before the first byte reaches the browser. Edge Functions have a 50s+ streaming window and are designed for AI streaming workloads — the right architecture for this app.

Changes in this commit:

- **New file:** `netlify/edge-functions/ask.ts` — same logic as the deleted `netlify/functions/ask.ts`, with these runtime adjustments:
  - Imports the Anthropic SDK via Deno-style npm specifier: `import Anthropic from "npm:@anthropic-ai/sdk@^0.90.0"`
  - Reads the API key via `Netlify.env.get("ANTHROPIC_API_KEY")` (Edge Functions runtime) instead of `process.env.ANTHROPIC_API_KEY`
  - Declares the `Netlify` global at the top so TypeScript knows about it: `declare const Netlify: { env: { get(key: string): string | undefined } };`
  - Production-friendly error message if the key is missing (no "set in .env.local" guidance)
  - Inline `export const config = { path: "/api/ask" };` at the bottom — Netlify reads this at deploy time and routes incoming `/api/ask` requests to this Edge Function
- **Deleted:** `netlify/functions/ask.ts` (replaced by the Edge Function above)
- **Updated:** `src/App.tsx` — `ASK_ENDPOINT` constant changed from `/.netlify/functions/ask` to `/api/ask` to match the new Edge Function path

Same prompt, same tools (web_search_20260209, adaptive thinking), same 8192 max tokens. Only the runtime + URL changed.

Local testing: `npx netlify dev` runs Edge Functions in the local Deno runtime; `/api/ask` should be reachable on `:8888` for full-stack local testing. If the SDK has a Deno compatibility issue, the fallback is direct fetch to `https://api.anthropic.com/v1/messages` with manual SSE parsing — but worth trying the SDK first since it handles streaming + tool-use parsing for us.

After this deploy lands, retry the same Lexapro + Psilocybin question on `psychedelicresearchtool.netlify.app`. Expected: streaming begins within ~10-15s, full answer within ~30-40s (depending on web-search depth). 504s should not recur for normal clinical queries.

