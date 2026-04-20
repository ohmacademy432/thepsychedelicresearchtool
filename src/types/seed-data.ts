// Type definitions mirroring the structure of src/data/seed-data.json.
// Keep these in sync with the JSON file. seed-data.json is the source of truth
// for content; this file is the source of truth for shape.

export type MedicineId =
  | "iboga"
  | "psilocybin"
  | "lsd"
  | "mdma"
  | "5meodmt"
  | "nndmt"
  | "ayahuasca"
  | "kambo";

export type RiskLevel =
  | "absolute_no"
  | "high_caution"
  | "review"
  | "generally_ok";

export type PrimaryRiskProfile =
  | "cardiac"
  | "psychiatric"
  | "cardiac_serotonergic"
  | "MAOI_serotonergic"
  | "cardiac_renal";

export type CategoryId = string;

export interface Meta {
  title: string;
  version: string;
  purpose: string;
  disclaimer: string;
  sources: string[];
}

export interface Medicine {
  id: MedicineId;
  name: string;
  displayName: string;
  primaryRiskProfile: PrimaryRiskProfile;
  halfLife: string;
  metabolism: string;
  highlightWarnings: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  examples: string[];
}

export type SourceTier = 1 | 2 | 3;

export interface Interaction {
  categoryId: CategoryId;
  medicineId: MedicineId;
  risk: RiskLevel;
  washout: string;
  restart: string;
  notes: string;
  source: string;
  /**
   * Defensibility marker for the cited source.
   *   1 = peer-reviewed clinical literature, published trial protocols,
   *       official guidelines (PubMed, MAPS, GITA, Usona, COMPASS)
   *   2 = practitioner consensus publications (Tripsit, Conclave Best
   *       Practices, EntheoNation, Fireside Project, MAPS integration
   *       workbooks, MSKCC About Herbs)
   *   3 = OHM internal protocols / curator judgment
   * Optional. Existing entries default to undefined and remain valid.
   */
  sourceTier?: SourceTier;
}

export type GlobalAbsoluteContraindications = {
  all_medicines: string[];
} & Partial<Record<`${MedicineId}_additional`, string[]>>;

export interface SeedData {
  _meta: Meta;
  medicines: Medicine[];
  categories: Category[];
  interactions: Interaction[];
  global_absolute_contraindications: GlobalAbsoluteContraindications;
  high_risk_requires_clearance: string[];
}
