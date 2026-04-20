import type { MedicineId } from "./seed-data";

export type Sex = "female" | "male" | "other_or_prefer_not_to_say";

/**
 * "other" allows the facilitator to type a medicine name not in our enum
 * (e.g. a less-common plant medicine or a hybrid protocol).
 */
export type MedicineChoice = MedicineId | "other";

/**
 * Free-text fields use "" rather than undefined so they bind cleanly to
 * controlled <input>/<textarea> elements without React warnings.
 */
export interface StructuredQuestionInput {
  age: number | "";
  sex: Sex | "";
  medications: string;
  history: string;
  medicine: MedicineChoice | "";
  medicineOther: string;
  timeline: string;
  question: string;
  /** Always-present optional plain-language addendum from the disclosure panel. */
  plainLanguage: string;
}

export interface Source {
  number: number;
  label: string;
  /** Anchor target id, used by inline [n] markers in the markdown body. */
  anchorId: string;
  /** Optional — internal references may have no public URL. */
  url?: string;
}

export interface Question {
  id: string;
  /** Human-readable assembled question shown back to the facilitator in MODE B. */
  formattedQuestion: string;
  answerMarkdown: string;
  sources: Source[];
  createdAt: number;
}
