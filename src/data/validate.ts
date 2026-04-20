import type { SeedData, RiskLevel } from "../types/seed-data";

const VALID_RISK_LEVELS: ReadonlySet<RiskLevel> = new Set([
  "absolute_no",
  "high_caution",
  "review",
  "generally_ok",
]);

export class SeedDataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SeedDataValidationError";
  }
}

const fail = (msg: string): never => {
  throw new SeedDataValidationError(msg);
};

/**
 * Runtime validation for seed-data.json. Catches drift between the JSON file
 * and the TypeScript types, plus structural problems the type system cannot
 * see (referential integrity, duplicates).
 *
 * Returns the same object cast to SeedData on success; throws
 * SeedDataValidationError with a specific human-readable message on failure.
 */
export function validateSeedData(raw: unknown): SeedData {
  if (raw === null || typeof raw !== "object") {
    fail("Seed data root is not an object.");
  }
  const data = raw as SeedData;

  if (!Array.isArray(data.medicines)) {
    fail("Seed data: 'medicines' must be an array.");
  }
  if (!Array.isArray(data.categories)) {
    fail("Seed data: 'categories' must be an array.");
  }
  if (!Array.isArray(data.interactions)) {
    fail("Seed data: 'interactions' must be an array.");
  }

  const medicineIds = new Set<string>();
  for (let i = 0; i < data.medicines.length; i++) {
    const m = data.medicines[i];
    if (!m || typeof m.id !== "string") {
      fail(`medicines[${i}]: missing string 'id'.`);
    }
    if (medicineIds.has(m.id)) {
      fail(`medicines[${i}]: duplicate medicine id "${m.id}".`);
    }
    medicineIds.add(m.id);
  }

  const categoryIds = new Set<string>();
  for (let i = 0; i < data.categories.length; i++) {
    const c = data.categories[i];
    if (!c || typeof c.id !== "string") {
      fail(`categories[${i}]: missing string 'id'.`);
    }
    if (categoryIds.has(c.id)) {
      fail(`categories[${i}]: duplicate category id "${c.id}".`);
    }
    categoryIds.add(c.id);
  }

  const seenPairs = new Set<string>();
  for (let i = 0; i < data.interactions.length; i++) {
    const ix = data.interactions[i];
    const where = `interactions[${i}] (medicineId="${ix?.medicineId}", categoryId="${ix?.categoryId}")`;

    if (!ix || typeof ix !== "object") {
      fail(`interactions[${i}]: not an object.`);
    }

    if (!medicineIds.has(ix.medicineId)) {
      fail(
        `${where}: references unknown medicineId "${ix.medicineId}". ` +
          `Known medicine ids: ${[...medicineIds].join(", ")}.`,
      );
    }

    if (!categoryIds.has(ix.categoryId)) {
      fail(
        `${where}: references unknown categoryId "${ix.categoryId}". ` +
          `Known category ids: ${[...categoryIds].sort().join(", ")}.`,
      );
    }

    if (!VALID_RISK_LEVELS.has(ix.risk)) {
      fail(
        `${where}: risk "${ix.risk}" is not a valid RiskLevel. ` +
          `Must be one of: ${[...VALID_RISK_LEVELS].join(", ")}.`,
      );
    }

    if (
      ix.sourceTier !== undefined &&
      ix.sourceTier !== 1 &&
      ix.sourceTier !== 2 &&
      ix.sourceTier !== 3
    ) {
      fail(
        `${where}: sourceTier "${String(ix.sourceTier)}" must be 1, 2, 3, or omitted.`,
      );
    }

    const pairKey = `${ix.medicineId}::${ix.categoryId}`;
    if (seenPairs.has(pairKey)) {
      fail(
        `${where}: duplicate (medicineId, categoryId) pair. ` +
          `Each combination should appear at most once in interactions[].`,
      );
    }
    seenPairs.add(pairKey);
  }

  return data;
}
