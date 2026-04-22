import { useState } from "react";
import type { Question } from "../types/question";
import { Markdown } from "./Markdown";

interface Props {
  question: Question;
  onNewQuestion: () => void;
  onFollowUp: (formattedQuestion: string) => void;
}

const COLLAPSE_THRESHOLD = 240;

export function AnswerView({ question, onNewQuestion, onFollowUp }: Props) {
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const long = question.formattedQuestion.length > COLLAPSE_THRESHOLD;
  const isStreaming = question.status === "streaming";
  const isError = question.status === "error";
  const hasMarkdown = question.answerMarkdown.trim() !== "";

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(question.answerMarkdown);
      setCopyState("ok");
    } catch {
      setCopyState("err");
    } finally {
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  const sendFollowUp = () => {
    const trimmed = followUpText.trim();
    if (trimmed === "" || isStreaming) return;
    onFollowUp(trimmed);
    setFollowUpText("");
    setFollowUpOpen(false);
  };

  return (
    <section>
      <QuotedQuestion text={question.formattedQuestion} long={long} />

      {!hasMarkdown && isStreaming && (
        <div className="mt-6 flex items-center gap-2 text-sm text-charcoal-soft">
          <PulsingDot />
          <span>Researching — this usually takes 1–5 minutes.</span>
        </div>
      )}

      {hasMarkdown && (
        <div className="mt-6">
          <Markdown>{question.answerMarkdown}</Markdown>
          {isStreaming && (
            <div className="mt-2 flex items-center gap-2 text-sm text-charcoal-soft">
              <PulsingDot />
              <span>Streaming response…</span>
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-md border border-risk-red-text/30 bg-risk-red-bg p-4">
          <h3 className="font-serif text-base font-semibold text-risk-red-text">
            Research failed
          </h3>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-sm text-risk-red-text">
            {question.error ?? "Unknown error"}
          </pre>
          <p className="mt-3 text-sm text-charcoal-soft">
            Try again, or simplify the question.
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFollowUpOpen((v) => !v)}
          aria-expanded={followUpOpen}
          disabled={isStreaming}
          className="rounded-md border border-sage/50 bg-parchment-soft px-4 py-2 text-sm font-medium text-forest hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Ask follow-up
        </button>
        <button
          type="button"
          onClick={onNewQuestion}
          className="rounded-md border border-sage/50 bg-parchment-soft px-4 py-2 text-sm font-medium text-forest hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          New question
        </button>
        <button
          type="button"
          onClick={copyAnswer}
          disabled={!hasMarkdown}
          className="rounded-md border border-sage/50 bg-parchment-soft px-4 py-2 text-sm font-medium text-forest hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copyState === "ok"
            ? "Copied!"
            : copyState === "err"
              ? "Copy failed"
              : "Copy answer"}
        </button>
      </div>

      {followUpOpen && (
        <div className="mt-3 rounded-md border border-sage/40 bg-parchment-soft p-4">
          <label
            htmlFor="follow-up-input"
            className="block text-sm font-semibold text-charcoal"
          >
            Follow-up question
          </label>
          <p className="mt-1 text-xs text-charcoal-soft/80">
            Sent as a fresh research question. Include any context from the
            original — this step does not carry over prior conversation.
          </p>
          <textarea
            id="follow-up-input"
            rows={3}
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            className="mt-2 w-full rounded-md border border-sage/50 bg-parchment px-3 py-2 text-base text-charcoal placeholder:text-charcoal-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
            placeholder="What additional context do you need?"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={sendFollowUp}
              disabled={followUpText.trim() === "" || isStreaming}
              className="rounded-md bg-forest px-3 py-1.5 text-sm font-medium text-parchment-soft shadow-sm transition hover:bg-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:bg-sage-deep/40 disabled:text-parchment-soft/80"
            >
              Send follow-up
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-md border border-risk-amber-text/30 bg-risk-amber-bg p-4 text-sm text-risk-amber-text">
        <strong className="font-semibold">AI-generated research.</strong>{" "}
        Verify with licensed medical review before clinical decisions.
      </div>
    </section>
  );
}

function PulsingDot() {
  return (
    <span
      className="inline-block h-2 w-2 animate-pulse rounded-full bg-forest"
      aria-hidden="true"
    />
  );
}

function QuotedQuestion({ text, long }: { text: string; long: boolean }) {
  if (long) {
    return (
      <details className="rounded-md border border-sage/30 bg-parchment-soft">
        <summary className="cursor-pointer select-none border-l-4 border-sage px-4 py-3 text-sm italic text-charcoal-soft">
          {text.slice(0, 160).trim()}…  <span className="not-italic">[show full question]</span>
        </summary>
        <div className="border-l-4 border-sage px-4 py-3 text-sm italic text-charcoal-soft">
          <pre className="whitespace-pre-wrap font-sans text-sm italic">
            {text}
          </pre>
        </div>
      </details>
    );
  }
  return (
    <blockquote className="border-l-4 border-sage bg-parchment-soft px-4 py-3 text-sm italic text-charcoal-soft">
      <pre className="whitespace-pre-wrap font-sans text-sm italic">{text}</pre>
    </blockquote>
  );
}
