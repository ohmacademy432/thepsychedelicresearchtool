import type { Question } from "../types/question";
import { relativeTime } from "../lib/time";

interface Props {
  questions: Question[];
  activeId: string | null;
  drawerOpen: boolean;
  onNewQuestion: () => void;
  onSelect: (id: string) => void;
  onCloseDrawer: () => void;
}

const PREVIEW_LEN = 50;

function previewOf(formattedQuestion: string): string {
  const oneLine = formattedQuestion.replace(/\s+/g, " ").trim();
  if (oneLine.length <= PREVIEW_LEN) return oneLine;
  return `${oneLine.slice(0, PREVIEW_LEN).trimEnd()}…`;
}

export function HistorySidebar({
  questions,
  activeId,
  drawerOpen,
  onNewQuestion,
  onSelect,
  onCloseDrawer,
}: Props) {
  return (
    <>
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close history"
          tabIndex={-1}
          onClick={onCloseDrawer}
          className="fixed inset-0 z-20 bg-charcoal/40 md:hidden"
        />
      )}

      <aside
        id="question-history"
        aria-label="Question history"
        className={[
          "fixed inset-y-0 left-0 z-30 flex w-72 max-w-[85vw] transform flex-col border-r border-sage/40 bg-parchment-soft p-4 transition-transform",
          "md:static md:z-auto md:w-56 md:translate-x-0 md:border-r md:bg-transparent md:p-0 md:pr-4 md:transition-none",
          drawerOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="md:hidden mb-3 flex items-center justify-between">
          <h2 className="font-serif text-base font-semibold text-forest">
            History
          </h2>
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label="Close history"
            className="rounded-md p-1.5 text-charcoal-soft hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 className="hidden md:mb-3 md:block font-serif text-sm font-semibold uppercase tracking-wide text-forest">
          History
        </h2>

        <button
          type="button"
          onClick={onNewQuestion}
          className="flex w-full items-center gap-2 rounded-md border border-sage/50 bg-parchment px-3 py-2 text-sm font-medium text-forest transition hover:border-forest/60 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New question
        </button>

        <ol className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
          {questions.length === 0 && (
            <li className="text-xs italic text-charcoal-soft/80">
              No questions yet this session.
            </li>
          )}
          {questions.map((q) => {
            const isActive = q.id === activeId;
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => onSelect(q.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "block w-full rounded-md px-2 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40",
                    isActive
                      ? "bg-sage/20 text-forest"
                      : "text-charcoal hover:bg-sage/10",
                  ].join(" ")}
                >
                  <div className="line-clamp-2 leading-snug">
                    {previewOf(q.formattedQuestion)}
                  </div>
                  <div className="mt-0.5 text-[0.7rem] text-charcoal-soft/80">
                    {relativeTime(q.createdAt)}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 border-t border-sage/30 pt-3 text-[0.7rem] text-charcoal-soft/80">
          History clears when the tab closes. Nothing is saved to any server.
        </p>
      </aside>
    </>
  );
}
