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

export type QuestionStatus = "streaming" | "done" | "error";

export interface Question {
  id: string;
  /** Human-readable assembled question shown back to the facilitator. */
  formattedQuestion: string;
  /** Accumulates progressively as tokens arrive from the API. */
  answerMarkdown: string;
  createdAt: number;
  status: QuestionStatus;
  /** Populated only when status === "error". */
  error?: string;
}
