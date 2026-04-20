import type {
  MedicineChoice,
  Sex,
  StructuredQuestionInput,
} from "../types/question";

const SEX_LABELS: Record<Sex, string> = {
  female: "Female",
  male: "Male",
  other_or_prefer_not_to_say: "Other / prefer not to say",
};

const MEDICINE_LABELS: Record<Exclude<MedicineChoice, "other">, string> = {
  iboga: "Iboga / Ibogaine",
  psilocybin: "Psilocybin",
  lsd: "LSD",
  mdma: "MDMA",
  "5meodmt": "5-MeO-DMT",
  nndmt: "N,N-DMT",
  ayahuasca: "Ayahuasca",
  kambo: "Kambo",
};

export function medicineLabel(choice: MedicineChoice, other: string): string {
  if (choice === "other") {
    const trimmed = other.trim();
    return trimmed === "" ? "Other (unspecified)" : trimmed;
  }
  return MEDICINE_LABELS[choice];
}

export function sexLabel(s: Sex): string {
  return SEX_LABELS[s];
}

/**
 * Compose the structured fields plus the optional plain-language addendum
 * into a single human-readable question string. Empty fields are skipped so
 * the output reflects what the facilitator actually filled in.
 */
export function assembleQuestion(input: StructuredQuestionInput): string {
  const parts: string[] = [];

  if (input.age !== "" && input.age !== undefined) {
    parts.push(`Participant age: ${input.age}`);
  }
  if (input.sex !== "") {
    parts.push(`Biological sex: ${sexLabel(input.sex)}`);
  }
  if (input.medications.trim() !== "") {
    parts.push(
      `Current medications and supplements:\n${input.medications.trim()}`,
    );
  }
  if (input.history.trim() !== "") {
    parts.push(`Medical history:\n${input.history.trim()}`);
  }
  if (input.medicine !== "") {
    parts.push(
      `Medicine being considered: ${medicineLabel(input.medicine, input.medicineOther)}`,
    );
  }
  if (input.timeline.trim() !== "") {
    parts.push(`Timeline to ceremony: ${input.timeline.trim()}`);
  }
  if (input.question.trim() !== "") {
    parts.push(`Specific question or concern:\n${input.question.trim()}`);
  }
  if (input.plainLanguage.trim() !== "") {
    parts.push(
      `Additional context (plain language):\n${input.plainLanguage.trim()}`,
    );
  }

  return parts.join("\n\n");
}

/**
 * Submit is enabled when the facilitator has provided either the structured
 * "specific question" field OR the plain-language alternative. All other
 * fields are optional.
 */
export function canSubmit(input: StructuredQuestionInput): boolean {
  return (
    input.question.trim() !== "" || input.plainLanguage.trim() !== ""
  );
}
