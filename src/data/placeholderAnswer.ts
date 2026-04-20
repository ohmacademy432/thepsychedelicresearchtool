import type { Source } from "../types/question";

/**
 * Hardcoded placeholder used during Phase 2 step 1 to verify the markdown
 * rendering pipeline. ALL clinical claims here are paraphrased from rows
 * already present in src/data/seed-data.json — nothing is invented. The
 * banner at the top makes the placeholder status unmistakable.
 *
 * Replace this whole module's exports with live API output in the next step.
 */
export const PLACEHOLDER_ANSWER_MARKDOWN = `> **⚠ Placeholder for UI testing.** This is hardcoded sample content used to verify markdown rendering. API wiring comes in the next step. Do **not** use for clinical decisions.

# Lexapro (escitalopram) + Psilocybin

## Risk classification

OHM's reference classifies this combination as **Review case-by-case** [\\[1\\]](#source-1). The acute pharmacological risk is low; the dominant concern is *blunting* of the psilocybin experience.

## Recommended washout

The default washout window from OHM's protocol is **2 weeks**, with fluoxetine extended to 4–6 weeks because of its longer half-life [\\[1\\]](#source-1).

| Combination | OHM classification | Default washout |
| --- | --- | --- |
| Psilocybin + SSRI | Review case-by-case | 2 weeks (fluoxetine: 4–6) |
| Psilocybin + Lithium | Absolute no | 2 weeks min |
| Psilocybin + MAOI | Absolute no | 2 weeks min |

## What the data says

Chronic SSRI use *significantly* blunts psilocybin's subjective and therapeutic effects. Acute combination risk for serotonin syndrome is **low but not zero**. Most clinical protocols (e.g. COMPASS, Usona) require a taper [\\[1\\]](#source-1).

### Coordination notes

1. Discuss the taper with the prescribing clinician before any ceremony date is set.
2. Confirm the participant is psychiatrically stable enough to taper.
3. Plan restart at **24–48 hours** post-ceremony if the taper was for ceremony purposes only [\\[1\\]](#source-1).

### Things to ask the participant

- How long have they been on Lexapro, and what was the indication?
- Have they tapered off SSRIs before, and how did discontinuation go?
- Are they working with a prescriber who supports a temporary hold?
- Do they have a backup plan if the taper destabilizes them before ceremony?

### Mock structured payload

The structured fields the facilitator entered would be passed to the model as JSON like this:

\`\`\`json
{
  "participantAge": 42,
  "medication": "Lexapro 10mg daily, 3 years",
  "medicine": "psilocybin",
  "timelineToCeremony": "6 weeks"
}
\`\`\`

For a wider harm-reduction perspective on serotonergic psychedelic interactions, see the [Tripsit harm-reduction matrix](https://drugs.tripsit.me/) [\\[2\\]](#source-2).
`;

export const PLACEHOLDER_SOURCES: Source[] = [
  {
    number: 1,
    label:
      "OHM Psilocybin Pre-Ceremony Preparation Protocol (internal reference, paraphrased from seed-data.json SSRI × psilocybin row)",
    anchorId: "source-1",
  },
  {
    number: 2,
    label: "Tripsit harm-reduction interaction matrix",
    anchorId: "source-2",
    url: "https://drugs.tripsit.me/",
  },
  {
    number: 3,
    label: "MAPS Psychedelic Integration Workbook (general reference)",
    anchorId: "source-3",
    url: "https://maps.org/",
  },
];
