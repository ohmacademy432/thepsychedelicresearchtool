import { useMemo } from "react";
import rawSeedData from "./data/seed-data.json";
import { validateSeedData } from "./data/validate";
import type { SeedData } from "./types/seed-data";

type LoadResult =
  | { ok: true; data: SeedData }
  | { ok: false; error: Error };

function loadSeedData(): LoadResult {
  try {
    return { ok: true, data: validateSeedData(rawSeedData) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e : new Error(String(e)),
    };
  }
}

function Header() {
  return (
    <header className="border-b border-sage/40 bg-parchment-soft">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
        <h1 className="font-serif text-xl font-semibold text-forest sm:text-2xl">
          OHM Academy{" "}
          <span className="text-sage-deep">— Facilitator Screening Tool</span>
        </h1>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-sage/40 bg-parchment-soft">
      <div className="mx-auto max-w-5xl px-4 py-4 text-sm text-charcoal-soft sm:px-6">
        Research tool for OHM facilitators. Answers are AI-generated and may
        be incomplete or incorrect. Verify all clinical decisions with
        licensed medical review.
      </div>
    </footer>
  );
}

function ErrorScreen({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="rounded-md border border-risk-red-text/30 bg-risk-red-bg p-6">
          <h2 className="font-serif text-lg font-semibold text-risk-red-text">
            Reference data could not be loaded
          </h2>
          <p className="mt-2 text-charcoal-soft">
            The screening tool refuses to display partial or inconsistent
            interaction data. Until this is fixed, no lookups will work.
          </p>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded bg-parchment-soft p-3 font-mono text-sm text-risk-red-text">
            {error.message}
          </pre>
          <p className="mt-4 text-sm text-charcoal-soft">
            Notify the maintainer with the message above.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const result = useMemo(loadSeedData, []);

  if (!result.ok) return <ErrorScreen error={result.error} />;

  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-charcoal-soft">
          Lookup UI removed. Chat UI rebuild in progress — placeholder shell.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default App;
