import { useState } from "react";
import type { Question } from "../types/question";
import { Markdown } from "./Markdown";

interface Props {
  question: Question;
  onNewQuestion: () => void;
}

const COLLAPSE_THRESHOLD = 240;

export function AnswerView({ question, onNewQuestion }: Props) {
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  const long = question.formattedQuestion.length > COLLAPSE_THRESHOLD;

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

  return (
    <section>
      <QuotedQuestion text={question.formattedQuestion} long={long} />

      <div className="mt-6">
        <Markdown>{question.answerMarkdown}</Markdown>
      </div>

      {question.sources.length > 0 && (
        <section className="mt-8 border-t border-sage/40 pt-5">
          <h3 className="font-serif text-lg font-semibold text-forest">
            Sources
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-charcoal">
            {question.sources.map((s) => (
              <li key={s.anchorId} id={s.anchorId} className="leading-relaxed">
                <span>{s.label}</span>
                {s.url && (
                  <>
                    {" — "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest underline decoration-sage-deep/40 underline-offset-2 hover:decoration-forest"
                    >
                      {s.url}
                    </a>
                  </>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFollowUpOpen((v) => !v)}
          aria-expanded={followUpOpen}
          className="rounded-md border border-sage/50 bg-parchment-soft px-4 py-2 text-sm font-medium text-forest hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
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
          className="rounded-md border border-sage/50 bg-parchment-soft px-4 py-2 text-sm font-medium text-forest hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
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
          <textarea
            id="follow-up-input"
            rows={3}
            value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)}
            className="mt-1 w-full rounded-md border border-sage/50 bg-parchment px-3 py-2 text-base text-charcoal placeholder:text-charcoal-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30"
            placeholder="What additional context do you need?"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md bg-sage-deep/40 px-3 py-1.5 text-sm font-medium text-parchment-soft/80"
              title="Follow-up submission will chain to the same research in the next API step."
            >
              Send follow-up
            </button>
            <span className="text-xs italic text-charcoal-soft/80">
              Submission wires up in the next step (API).
            </span>
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
