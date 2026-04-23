import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth-context";

interface Props {
  onSwitchToSignup: () => void;
}

export function LoginScreen({ onSwitchToSignup }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email.trim(), password);

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
    }
    // On success, AuthProvider's state change listener updates the
    // user/profile, and App will automatically re-render to the right
    // screen (tool or pending-approval). Nothing else to do here.
  }

  return (
    <div className="mx-auto max-w-md">
      <h2 className="font-serif text-xl font-semibold text-forest">Sign in</h2>
      <p className="mt-2 text-sm text-charcoal-soft">
        Sign in to access the Clinical Research Companion.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-forest">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium text-forest">
            Password
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
          />
        </label>

        {error && (
          <div className="rounded-md border border-risk-red-text/30 bg-risk-red-bg p-3 text-sm text-risk-red-text">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-forest px-5 py-2.5 text-sm font-medium text-parchment disabled:cursor-not-allowed disabled:opacity-60 hover:bg-forest/90"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-sm text-forest hover:underline"
          >
            Don't have an account? Request access
          </button>
        </div>
      </form>
    </div>
  );
}
