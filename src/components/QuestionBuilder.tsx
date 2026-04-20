import { useId, useState } from "react";
import type {
  MedicineChoice,
  Sex,
  StructuredQuestionInput,
} from "../types/question";
import { assembleQuestion, canSubmit } from "../lib/assembleQuestion";

interface Props {
  onSubmit: (formattedQuestion: string) => void;
}

const EMPTY_INPUT: StructuredQuestionInput = {
  age: "",
  sex: "",
  medications: "",
  history: "",
  medicine: "",
  medicineOther: "",
  timeline: "",
  question: "",
  plainLanguage: "",
};

const SEX_OPTIONS: ReadonlyArray<{ value: Sex; label: string }> = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  {
    value: "other_or_prefer_not_to_say",
    label: "Other / prefer not to say",
  },
];

const MEDICINE_OPTIONS: ReadonlyArray<{ value: MedicineChoice; label: string }> =
  [
    { value: "iboga", label: "Iboga / Ibogaine" },
    { value: "psilocybin", label: "Psilocybin" },
    { value: "lsd", label: "LSD" },
    { value: "mdma", label: "MDMA" },
    { value: "5meodmt", label: "5-MeO-DMT" },
    { value: "nndmt", label: "N,N-DMT" },
    { value: "ayahuasca", label: "Ayahuasca" },
    { value: "kambo", label: "Kambo" },
    { value: "other", label: "Other" },
  ];

const labelClass =
  "block text-sm font-semibold text-charcoal";
const fieldClass =
  "mt-1 w-full rounded-md border border-sage/50 bg-parchment-soft px-3 py-2.5 text-base text-charcoal placeholder:text-charcoal-soft/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/30";

export function QuestionBuilder({ onSubmit }: Props) {
  const [input, setInput] = useState<StructuredQuestionInput>(EMPTY_INPUT);
  const ids = {
    age: useId(),
    sex: useId(),
    meds: useId(),
    history: useId(),
    medicine: useId(),
    medicineOther: useId(),
    timeline: useId(),
    question: useId(),
    plain: useId(),
  };

  const setField = <K extends keyof StructuredQuestionInput>(
    key: K,
    value: StructuredQuestionInput[K],
  ) => setInput((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit(input)) return;
    onSubmit(assembleQuestion(input));
  };

  const showOther = input.medicine === "other";

  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold text-forest">
        Research a combination
      </h2>
      <p className="mt-1 text-sm text-charcoal-soft">
        All fields optional — fill what you have, leave the rest.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.age} className={labelClass}>
              Participant age
            </label>
            <input
              id={ids.age}
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              value={input.age}
              onChange={(e) => {
                const v = e.target.value;
                setField("age", v === "" ? "" : Number(v));
              }}
              className={fieldClass}
              placeholder="e.g. 42"
            />
          </div>

          <div>
            <label htmlFor={ids.sex} className={labelClass}>
              Biological sex
            </label>
            <select
              id={ids.sex}
              value={input.sex}
              onChange={(e) => setField("sex", e.target.value as Sex | "")}
              className={fieldClass}
            >
              <option value="">Select…</option>
              {SEX_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={ids.meds} className={labelClass}>
            Current medications and supplements
          </label>
          <textarea
            id={ids.meds}
            rows={4}
            value={input.medications}
            onChange={(e) => setField("medications", e.target.value)}
            className={fieldClass}
            placeholder={
              "One per line. Include dose and duration if known. Example:\nLexapro 10mg daily, 3 years\nMetoprolol 25mg BID, 6 months\nMagnesium glycinate 400mg nightly"
            }
          />
        </div>

        <div>
          <label htmlFor={ids.history} className={labelClass}>
            Medical history relevant to screening
          </label>
          <textarea
            id={ids.history}
            rows={3}
            value={input.history}
            onChange={(e) => setField("history", e.target.value)}
            className={fieldClass}
            placeholder="Cardiac, psychiatric, neurological, substance use history, etc."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={ids.medicine} className={labelClass}>
              Medicine being considered
            </label>
            <select
              id={ids.medicine}
              value={input.medicine}
              onChange={(e) =>
                setField("medicine", e.target.value as MedicineChoice | "")
              }
              className={fieldClass}
            >
              <option value="">Select…</option>
              {MEDICINE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {showOther && (
              <div className="mt-2">
                <label htmlFor={ids.medicineOther} className="sr-only">
                  Specify other medicine
                </label>
                <input
                  id={ids.medicineOther}
                  type="text"
                  value={input.medicineOther}
                  onChange={(e) => setField("medicineOther", e.target.value)}
                  className={fieldClass}
                  placeholder="Specify the medicine"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor={ids.timeline} className={labelClass}>
              Timeline to ceremony
            </label>
            <input
              id={ids.timeline}
              type="text"
              value={input.timeline}
              onChange={(e) => setField("timeline", e.target.value)}
              className={fieldClass}
              placeholder="e.g. 6 weeks"
            />
          </div>
        </div>

        <div>
          <label htmlFor={ids.question} className={labelClass}>
            Specific question or concern
            <span className="ml-1 font-normal text-risk-red-text">*</span>
          </label>
          <textarea
            id={ids.question}
            rows={4}
            value={input.question}
            onChange={(e) => setField("question", e.target.value)}
            className={fieldClass}
            aria-required="true"
            placeholder={
              "What do you want researched? Examples:\nMinimum washout period.\nAlternatives to full taper.\nSpecific cardiac risks.\nPublished precedent for this combination."
            }
          />
        </div>

        <details className="rounded-md border border-sage/30 bg-parchment-soft px-4 py-3">
          <summary className="cursor-pointer select-none text-sm font-medium text-forest">
            Prefer to ask in plain language?
          </summary>
          <div className="mt-3">
            <label htmlFor={ids.plain} className="sr-only">
              Plain language question
            </label>
            <textarea
              id={ids.plain}
              rows={5}
              value={input.plainLanguage}
              onChange={(e) => setField("plainLanguage", e.target.value)}
              className={fieldClass}
              placeholder="Type your question or context as you'd phrase it to a colleague."
            />
          </div>
        </details>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit(input)}
            className="w-full rounded-md bg-forest px-5 py-3 text-base font-semibold text-parchment-soft shadow-sm transition hover:bg-forest-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 disabled:cursor-not-allowed disabled:bg-sage-deep/40 disabled:text-parchment-soft/80 sm:w-auto"
          >
            Research this combination
          </button>
        </div>
      </form>
    </section>
  );
}
