import { useCallback, useMemo, useState } from "react";
import rawSeedData from "./data/seed-data.json";
import { validateSeedData } from "./data/validate";
import type { SeedData } from "./types/seed-data";
import type { Question } from "./types/question";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HistorySidebar } from "./components/HistorySidebar";
import { QuestionBuilder } from "./components/QuestionBuilder";
import { AnswerView } from "./components/AnswerView";
import { AuthScreen } from "./components/AuthScreen";
import { PendingApprovalScreen } from "./components/PendingApprovalScreen";
import { useAuth } from "./lib/auth-context";

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

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-parchment text-charcoal">
      <Header onToggleDrawer={() => {}} drawerOpen={false} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function ErrorScreen({ error }: { error: Error }) {
  return (
    <PageShell>
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
    </PageShell>
  );
}

function ConfigErrorScreen() {
  return (
    <PageShell>
      <div className="rounded-md border border-risk-red-text/30 bg-risk-red-bg p-6">
        <h2 className="font-serif text-lg font-semibold text-risk-red-text">
          Site configuration error
        </h2>
        <p className="mt-2 text-charcoal-soft">
          The authentication layer is not configured. Please contact{" "}
          <a
            href="https://www.thepsychedelicnurse.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            thepsychedelicnurse.org
          </a>{" "}
          for assistance.
        </p>
      </div>
    </PageShell>
  );
}

function LoadingScreen() {
  return (
    <PageShell>
      <div className="flex items-center gap-3 text-sm text-charcoal-soft">
        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-forest" />
        <span>Loading session…</span>
      </div>
    </PageShell>
  );
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `q_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

const ASK_ENDPOINT = "/api/ask";
const ERROR_MARKER_START = "<<<STREAM_ERROR>>>";
const ERROR_MARKER_END = "<<<END>>>";

/**
 * Parse a streamed buffer for the in-band error marker the serverless
 * function emits if the Anthropic call throws mid-stream. Returns the
 * visible markdown (before the marker) and the extracted error message
 * when the marker is present, or null when no marker is found yet.
 */
function extractStreamError(
  buffer: string,
): { cleanMarkdown: string; errorMessage: string } | null {
  const startIdx = buffer.indexOf(ERROR_MARKER_START);
  if (startIdx === -1) return null;
  const afterStart = startIdx + ERROR_MARKER_START.length;
  const endIdx = buffer.indexOf(ERROR_MARKER_END, afterStart);
  const errorMessage =
    endIdx === -1
      ? buffer.slice(afterStart)
      : buffer.slice(afterStart, endIdx);
  return {
    cleanMarkdown: buffer.slice(0, startIdx).trimEnd(),
    errorMessage: errorMessage.trim() || "Unknown streaming error",
  };
}

function ResearchTool({ data: _seedData }: { data: SeedData }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateQuestion = useCallback(
    (id: string, updater: (q: Question) => Question) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? updater(q) : q)),
      );
    },
    [],
  );

  const streamAnswer = useCallback(
    async (id: string, formattedQuestion: string) => {
      try {
        const response = await fetch(ASK_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: formattedQuestion }),
        });

        if (!response.ok) {
          let detail = `HTTP ${response.status}`;
          try {
            const data = (await response.json()) as { error?: string };
            if (data?.error) detail = data.error;
          } catch {
            // response body wasn't JSON; keep the status-code fallback
          }
          updateQuestion(id, (q) => ({
            ...q,
            status: "error",
            error: detail,
          }));
          return;
        }

        if (!response.body) {
          updateQuestion(id, (q) => ({
            ...q,
            status: "error",
            error: "Server returned no response body.",
          }));
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let errored = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parsed = extractStreamError(buffer);
          if (parsed) {
            updateQuestion(id, (q) => ({
              ...q,
              answerMarkdown: parsed.cleanMarkdown,
              status: "error",
              error: parsed.errorMessage,
            }));
            errored = true;
            break;
          }

          updateQuestion(id, (q) => ({ ...q, answerMarkdown: buffer }));
        }

        if (!errored) {
          buffer += decoder.decode();
          const parsed = extractStreamError(buffer);
          if (parsed) {
            updateQuestion(id, (q) => ({
              ...q,
              answerMarkdown: parsed.cleanMarkdown,
              status: "error",
              error: parsed.errorMessage,
            }));
          } else {
            updateQuestion(id, (q) => ({
              ...q,
              answerMarkdown: buffer,
              status: "done",
            }));
          }
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Network error";
        updateQuestion(id, (q) => ({
          ...q,
          status: "error",
          error: msg,
        }));
      }
    },
    [updateQuestion],
  );

  const active = questions.find((q) => q.id === activeId) ?? null;

  const startQuestion = (formattedQuestion: string) => {
    const q: Question = {
      id: newId(),
      formattedQuestion,
      answerMarkdown: "",
      createdAt: Date.now(),
      status: "streaming",
    };
    setQuestions((prev) => [q, ...prev]);
    setActiveId(q.id);
    setDrawerOpen(false);
    void streamAnswer(q.id, formattedQuestion);
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
              onFollowUp={startQuestion}
            />
          ) : (
            <QuestionBuilder onSubmit={startQuestion} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  const result = useMemo(loadSeedData, []);
  const { configured, loading, profileLoading, user, profile } = useAuth();

  if (!result.ok) return <ErrorScreen error={result.error} />;
  if (!configured) return <ConfigErrorScreen />;
  if (loading) return <LoadingScreen />;

  // Not signed in → show auth screen (defaults to login, users can toggle to signup)
  if (!user) {
    return (
      <PageShell>
        <AuthScreen />
      </PageShell>
    );
  }

  // Signed in but profile hasn't loaded yet — show a brief loading state
  // rather than flashing the "profile setup incomplete" warning.
  if (profileLoading && !profile) {
    return <LoadingScreen />;
  }

  // Signed in but profile is genuinely absent (edge case: auth row exists,
  // profile row missing — happens if profile insert failed at signup time).
  if (!profile) {
    return (
      <PageShell>
        <div className="rounded-md border border-risk-amber-text/30 bg-risk-amber-bg p-6">
          <h2 className="font-serif text-lg font-semibold text-risk-amber-text">
            Profile setup incomplete
          </h2>
          <p className="mt-2 text-charcoal-soft">
            Your account exists but no profile was found. This can happen if
            signup was interrupted. Please contact{" "}
            <a
              href="https://www.thepsychedelicnurse.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              thepsychedelicnurse.org
            </a>{" "}
            for assistance.
          </p>
        </div>
      </PageShell>
    );
  }

  // Signed in but not yet approved
  if (!profile.approved) {
    return (
      <PageShell>
        <PendingApprovalScreen />
      </PageShell>
    );
  }

  // Signed in + approved → full research tool
  return <ResearchTool data={result.data} />;
}

export default App;
