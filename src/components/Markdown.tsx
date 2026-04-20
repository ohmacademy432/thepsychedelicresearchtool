import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  children: string;
}

/**
 * react-markdown wrapper with the formatting we need for facilitator
 * answers: GFM tables, sane heading sizes, readable line length, external
 * links opened in a new tab. In-page anchor links (e.g. inline [1] markers
 * pointing at #source-1) stay in the same tab.
 */
export function Markdown({ children }: Props) {
  return (
    <div className="markdown-body max-w-prose text-base leading-relaxed text-charcoal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              {...props}
              className="mt-6 mb-3 font-serif text-2xl font-semibold text-forest first:mt-0"
            />
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className="mt-6 mb-2 font-serif text-xl font-semibold text-forest"
            />
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className="mt-5 mb-2 font-serif text-lg font-semibold text-forest"
            />
          ),
          h4: ({ ...props }) => (
            <h4
              {...props}
              className="mt-4 mb-1 font-serif text-base font-semibold text-charcoal"
            />
          ),
          p: ({ ...props }) => <p {...props} className="my-3" />,
          ul: ({ ...props }) => (
            <ul {...props} className="my-3 list-disc space-y-1 pl-6" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="my-3 list-decimal space-y-1 pl-6" />
          ),
          li: ({ ...props }) => <li {...props} className="leading-relaxed" />,
          strong: ({ ...props }) => (
            <strong {...props} className="font-semibold text-charcoal" />
          ),
          em: ({ ...props }) => <em {...props} className="italic" />,
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className="my-4 border-l-4 border-risk-amber-text/60 bg-risk-amber-bg/40 px-4 py-2 italic text-charcoal"
            />
          ),
          a: ({ href, ...props }) => {
            const isAnchor = href?.startsWith("#");
            if (isAnchor) {
              return (
                <a
                  {...props}
                  href={href}
                  className="text-forest underline decoration-sage-deep/40 underline-offset-2 hover:decoration-forest"
                />
              );
            }
            return (
              <a
                {...props}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline decoration-sage-deep/40 underline-offset-2 hover:decoration-forest"
              />
            );
          },
          table: ({ ...props }) => (
            <div className="my-4 overflow-x-auto">
              <table
                {...props}
                className="w-full border-collapse text-left text-sm"
              />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead {...props} className="bg-sage/10 text-forest" />
          ),
          th: ({ ...props }) => (
            <th
              {...props}
              className="border border-sage/40 px-3 py-2 font-semibold"
            />
          ),
          td: ({ ...props }) => (
            <td
              {...props}
              className="border border-sage/30 px-3 py-2 align-top"
            />
          ),
          code: ({ className, children, ...props }) => {
            const isFenced = /language-/.test(className ?? "");
            if (isFenced) {
              return (
                <code
                  {...props}
                  className={`${className ?? ""} font-mono text-sm`}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                {...props}
                className="rounded bg-sage/15 px-1.5 py-0.5 font-mono text-[0.85em] text-forest"
              >
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => (
            <pre
              {...props}
              className="my-4 overflow-x-auto rounded-md border border-sage/40 bg-parchment-soft p-4 text-sm"
            />
          ),
          hr: ({ ...props }) => (
            <hr {...props} className="my-6 border-sage/40" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
