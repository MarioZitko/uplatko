import type { ParsedPdfFields } from "@/types/hub3";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a data extraction assistant for Croatian invoices.
Extract payment fields and return ONLY a valid JSON object with no markdown, no explanation, no code blocks.

Extract these fields if present:
- iban: Croatian IBAN (HR + 19 digits)
- amount: number (decimal, e.g. 123.45)
- recipientName: company/person name (max 30 chars)
- recipientAddress: street and number (max 27 chars)
- recipientCity: city with postal code (max 27 chars)
- referenceNumber: payment reference (e.g. 123-456-789)
- model: payment model code (e.g. HR68, HR00)
- description: payment description (max 35 chars)

Rules:
- Omit any field you cannot find with confidence
- Do not invent or guess values
- amount must be a number, not a string
- Return only the JSON object, nothing else`;

/**
 * Extracts and parses a JSON object from a raw API response string.
 * Handles extra whitespace, BOM characters, and markdown code fences.
 * Throws a descriptive error if no valid JSON object is found or parsing fails.
 */
function extractJson(raw: string): ParsedPdfFields {
	const cleaned = raw.trim().replace(/^\uFEFF/, "");
	const match = cleaned.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("No JSON object found in Groq response");

	try {
		return JSON.parse(match[0]) as ParsedPdfFields;
	} catch (e) {
		throw new Error(
			`Groq returned invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
		);
	}
}

export async function parseWithGroq(
	pdfText: string,
	apiKey: string,
): Promise<ParsedPdfFields> {
	const response = await fetch(GROQ_API_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			model: GROQ_MODEL,
			temperature: 0.1,
			max_tokens: 512,
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: `Invoice text:\n${pdfText}` },
			],
		}),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Groq API error ${response.status}: ${errorBody}`);
	}

	const data = (await response.json()) as {
		choices?: Array<{
			message?: { content?: string };
		}>;
	};

	const text = data.choices?.[0]?.message?.content;
	if (!text) throw new Error("Empty response from Groq");

	return extractJson(text);
}
