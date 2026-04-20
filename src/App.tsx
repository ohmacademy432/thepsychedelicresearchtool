import { useMemo, useState } from "react";
import rawSeedData from "./data/seed-data.json";
import { validateSeedData } from "./data/validate";
import type { SeedData } from "./types/seed-data";
import type { Question } from "./types/question";
import {
  PLACEHOLDER_ANSWER_MARKDOWN,
  PLACEHOLDER_SOURCES,
} from "./data/placeholderAnswer";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HistorySidebar } from "./components/HistorySidebar";
import { QuestionBuilder } from "./components/QuestionBuilder";
import { AnswerView } from "./components/AnswerView";

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

function ErrorScreen({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <Header onToggleDrawer={() => {}} drawerOpen={false} />
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!result.ok) return <ErrorScreen error={result.error} />;

  const active = questions.find((q) => q.id === activeId) ?? null;

  const handleSubmit = (formattedQuestion: string) => {
    const q: Question = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `q_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      formattedQuestion,
      answerMarkdown: PLACEHOLDER_ANSWER_MARKDOWN,
      sources: PLACEHOLDER_SOURCES,
      createdAt: Date.now(),
    };
    setQuestions((prev) => [q, ...prev]);
    setActiveId(q.id);
    setDrawerOpen(false);
  };

  const handleNewQuestion = () => {
    setActiveId(null);
    setDrawerOpen(false);
  };

  const handleSelectFromHistory = (id: string) => {
    setActiveId(id);
    setDrawerOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <Header
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
        drawerOpen={drawerOpen}
      />

      <div className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 md:gap-6">
        <HistorySidebar
          questions={questions}
          activeId={activeId}
          drawerOpen={drawerOpen}
          onNewQuestion={handleNewQuestion}
          onSelect={handleSelectFromHistory}
          onCloseDrawer={() => setDrawerOpen(false)}
        />

        <main className="min-w-0 flex-1">
          {active ? (
            <AnswerView
              key={active.id}
              question={active}
              onNewQuestion={handleNewQuestion}
            />
          ) : (
            <QuestionBuilder onSubmit={handleSubmit} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
