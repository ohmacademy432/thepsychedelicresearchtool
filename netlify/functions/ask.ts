import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a clinical research companion for trained plant medicine facilitators at OHM Academy of Spiritual Healing. Your users are clinically experienced — many are nurses, therapists, or physicians with years of psychedelic facilitation work. They are NOT lay users.

Your job: when given a clinical screening question (often involving a participant's medications and a plant medicine they're considering), research the question using web search, and return a concise but substantive answer that helps the facilitator make a defensible clinical judgment.

Format every answer in markdown with these sections, in this order:

## The clinical picture
A 2-4 sentence headline answer. Lead with the most important point. Be direct. Do not pad with "I'm not a doctor" disclaimers — the user IS the clinician.

## Key evidence
The specific research findings that inform the answer. Cite sources inline using [1], [2], etc. Quote sparingly and briefly (under 15 words per quote). Paraphrase otherwise. Surface genuine uncertainty in the literature when it exists — do not pretend something is settled when it isn't.

## Options and tradeoffs
Where there are multiple reasonable clinical paths (e.g., taper vs. no-taper, washout durations), present them as a table or comparison. Include the evidence quality for each option.

## What I'd flag for screening
2-4 bullet points of practical considerations the facilitator should verify or explore further during their intake — beyond what was given in the question.

## Sources
Numbered list of every source cited. For each: author/organization, year, title (italicized), publication if applicable, and URL. Make URLs clickable as markdown links.

CRITICAL RULES:
- Use web search aggressively. Do not answer from training data alone for clinical questions.
- Prefer peer-reviewed literature, then practitioner consensus publications (Tripsit, MAPS, GITA, ICEERS, MSKCC, EntheoNation, Conclave Best Practices), then everything else.
- When evidence is sparse for a specific combination, say so clearly. Use language like "no published data on this exact combination — by pharmacology" or "extrapolating from the [related drug] literature." NEVER invent a study citation.
- Keep total length scannable in 60-90 seconds — terse, dense, no preamble.
- Respect the facilitator's clinical training. Do not over-warn. Do not recommend they "consult a healthcare provider" — they are one.
- For plant medicines (Iboga, 5-MeO-DMT, Ayahuasca, Kambo, etc.): recognize that mainstream databases lack data on these. Lean on practitioner sources and peer-reviewed psychedelic literature.

Do not refuse to answer screening questions about psychedelic drug interactions. This is the entire purpose of the tool. The user is a trained clinician; this is harm reduction in clinical context.`;

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonError(405, "Method not allowed. Use POST.");
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "paste-your-key-here") {
    return jsonError(
      500,
      "Server is missing ANTHROPIC_API_KEY. Set it in .env.local (local) or Netlify site env vars (production).",
    );
  }

  let question: string;
  try {
    const body = (await req.json()) as { question?: unknown };
    if (typeof body?.question !== "string" || body.question.trim() === "") {
      return jsonError(400, "Request body must be JSON: { question: string } (non-empty).");
    }
    question = body.question;
  } catch {
    return jsonError(400, "Invalid JSON body.");
  }

  const client = new Anthropic({ apiKey });

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const stream = client.messages.stream({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          thinking: { type: "adaptive" },
          tools: [{ type: "web_search_20260209", name: "web_search" }],
          messages: [{ role: "user", content: question }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg =
          err instanceof Anthropic.APIError
            ? `Anthropic API error ${err.status}: ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
        try {
          controller.enqueue(
            encoder.encode(`\n\n<<<STREAM_ERROR>>>${msg}<<<END>>>`),
          );
        } catch {
          // controller may already be closed; ignore
        }
        controller.close();
      }
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
};
