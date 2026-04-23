import { useState, type FormEvent } from "react";
import { useAuth } from "../lib/auth-context";

interface Props {
  onSwitchToLogin: () => void;
}

const PROFESSIONAL_ROLES = [
  "Registered Nurse (RN)",
  "Nurse Practitioner (NP)",
  "Physician (MD / DO)",
  "Physician Assistant (PA)",
  "Therapist / Counselor",
  "Psychologist (PhD / PsyD)",
  "Licensed Facilitator",
  "Harm Reduction Practitioner",
  "Other — describe in credentials",
] as const;

export function SignupScreen({ onSwitchToLogin }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [credentials, setCredentials] = useState("");
  const [organization, setOrganization] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }
    if (!fullName.trim() || !role.trim()) {
      setError("Name and professional role are required.");
      setSubmitting(false);
      return;
    }

    const result = await signUp({
      email: email.trim(),
      password,
      full_name: fullName,
      professional_role: role,
      credentials,
      organization,
      access_request_note: requestNote,
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-md border border-sage/50 bg-parchment-soft p-6">
          <h2 className="font-serif text-xl font-semibold text-forest">
            Request received
          </h2>
          <p className="mt-3 text-charcoal-soft">
            Thank you for requesting access to The Psychedelic Nurse —
            Clinical Research Companion. Your signup has been recorded and
            is now pending review.
          </p>
          <p className="mt-3 text-charcoal-soft">
            You'll be notified when your account is approved. In the meantime,
            you can close this tab — or sign in once you receive confirmation.
          </p>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="mt-5 rounded-md border border-forest/50 px-4 py-2 text-sm text-forest hover:bg-forest/5"
          >
            Go to sign-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="font-serif text-xl font-semibold text-forest">
        Request access
      </h2>
      <p className="mt-2 text-sm text-charcoal-soft">
        The Psychedelic Nurse — Clinical Research Companion is available to
        licensed facilitators, clinicians, nurses, therapists, and physicians
        working with plant medicines. Each request is reviewed individually.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Email" required>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field
          label="Password"
          required
          hint="At least 8 characters. This is used only for signing in."
        >
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Full name" required>
          <input
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Professional role" required>
          <select
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="input"
          >
            <option value="">Select one…</option>
            {PROFESSIONAL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Credentials / license"
          hint="Free text. Examples: 'RN, IL license #12345' · 'MD, board-certified psychiatry' · 'MAPS-trained MDMA therapist, cohort 6'."
        >
          <input
            type="text"
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Practice / organization" hint="Optional.">
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="input"
          />
        </Field>

        <Field
          label="Why are you requesting access?"
          hint="A few sentences about your plant medicine work and how you intend to use this tool."
        >
          <textarea
            rows={4}
            value={requestNote}
            onChange={(e) => setRequestNote(e.target.value)}
            className="input"
          />
        </Field>

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
            {submitting ? "Submitting…" : "Request access"}
          </button>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-forest hover:underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-forest">
        {label}
        {required && <span className="text-risk-red-text"> *</span>}
      </span>
      {hint && (
        <span className="mt-0.5 block text-xs italic text-charcoal-soft">
          {hint}
        </span>
      )}
      <div className="mt-1">{children}</div>
    </label>
  );
}
