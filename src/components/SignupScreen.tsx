import { useState, type FormEvent } from "react";

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

// Encode a plain object as application/x-www-form-urlencoded for Netlify Forms.
function encode(data: Record<string, string>): string {
  return Object.keys(data)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`)
    .join("&");
}

/**
 * Access-request form. Submits to Netlify Forms (a hidden static form in
 * index.html declares the schema for build-time detection). On success,
 * Netlify emails ohmacademy432@gmail.com with subject
 * "The Psychedelic Tool Approval".
 *
 * Despite the file name, this no longer creates a Supabase auth account
 * directly. The Psychedelic Nurse manually creates accounts in Supabase
 * after reviewing each request and emails credentials to the requester.
 */
export function SignupScreen({ onSwitchToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [credentials, setCredentials] = useState("");
  const [organization, setOrganization] = useState("");
  const [requestNote, setRequestNote] = useState("");
  const [botField, setBotField] = useState(""); // honeypot â should stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !role.trim() || !email.trim()) {
      setError("Email, name, and professional role are required.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "contact",
          "bot-field": botField,
          subject: "The Psychedelic Tool Approval",
          email: email.trim(),
          full_name: fullName.trim(),
          professional_role: role.trim(),
          credentials: credentials.trim(),
          organization: organization.trim(),
          access_request_note: requestNote.trim(),
        }),
      });

      if (!response.ok) {
        setError(
          `Submission failed (HTTP ${response.status}). Please try again, or contact The Psychedelic Nurse directly.`,
        );
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Network error: ${err.message}. Please try again.`
          : "Network error. Please try again.",
      );
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="rounded-md border border-sage/50 bg-parchment-soft p-6">
          <h2 className="font-serif text-xl font-semibold text-forest">
            Request received
          </h2>
          <p className="mt-3 text-charcoal-soft">
            Thank you for your interest in The Psychedelic Nurse —
            Clinical Research Companion. Your access request has been sent
            and will be reviewed individually.
          </p>
          <p className="mt-3 text-charcoal-soft">
            The Psychedelic Nurse will email you directly once your account
            is set up. Access is intended for licensed facilitators and
            clinicians; please allow time for credentials verification.
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
        working with plant medicines. Each request is reviewed individually,
        and account credentials are issued by The Psychedelic Nurse via email
        after review.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Honeypot — real users won't see/fill this; bots will. */}
        <p hidden>
          <label>
            Don't fill this out:{" "}
            <input
              name="bot-field"
              value={botField}
              onChange={(e) => setBotField(e.target.value)}
            />
          </label>
        </p>

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
