import { useAuth } from "../lib/auth-context";

export function PendingApprovalScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-md border border-sage/50 bg-parchment-soft p-6">
        <h2 className="font-serif text-xl font-semibold text-forest">
          Your account is pending review
        </h2>
        <p className="mt-3 text-charcoal-soft">
          Thank you for signing up,{" "}
          <span className="font-medium text-forest">
            {profile?.full_name ?? user?.email}
          </span>
          . Your request for access to The Psychedelic Nurse Clinical Research
          Companion has been received but has not yet been approved.
        </p>
        <p className="mt-3 text-charcoal-soft">
          Each request is reviewed individually. You'll be notified when access
          is granted. If you'd like to check on your request, contact The
          Psychedelic Nurse at{" "}
          <a
            href="https://www.thepsychedelicnurse.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest underline"
          >
            thepsychedelicnurse.org
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void refreshProfile()}
            className="rounded-md border border-forest/50 px-4 py-2 text-sm text-forest hover:bg-forest/5"
          >
            Check status
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-md px-3 py-2 text-sm text-charcoal-soft hover:text-forest"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
