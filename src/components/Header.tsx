import { useAuth } from "../lib/auth-context";

interface Props {
  onToggleDrawer: () => void;
  drawerOpen: boolean;
}

export function Header({ onToggleDrawer, drawerOpen }: Props) {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-sage/40 bg-parchment-soft">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6">
        <button
          type="button"
          onClick={onToggleDrawer}
          aria-label={drawerOpen ? "Close question history" : "Open question history"}
          aria-expanded={drawerOpen}
          aria-controls="question-history"
          className="-ml-1 rounded-md border border-transparent p-2 text-forest hover:border-sage/40 hover:bg-sage/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 md:hidden"
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
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="flex-1 font-serif text-lg font-semibold text-forest sm:text-xl md:text-2xl">
          The Psychedelic Nurse{" "}
          <span className="text-sage-deep">— Clinical Research Companion</span>
        </h1>
        {user && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-md border border-sage/40 px-3 py-1.5 text-xs text-forest hover:bg-forest/5 sm:text-sm"
            aria-label="Sign out"
          >
            Sign out
          </button>
        )}
      </div>
    </header>
  );
}
