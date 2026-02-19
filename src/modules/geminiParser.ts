import type { ParsedPdfFields } from "@/types/hub3";

const GEMINI_API_URL =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const EXTRACTION_PROMPT = `You are a data extraction assistant for Croatian invoices.
Extract payment fields from the following invoice text and return ONLY a valid JSON object with no markdown, no explanation, no code blocks.

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
- Return only the JSON object, nothing else

Invoice text:
`;

// Gemini may return malformed JSON with extra whitespace or BOM — strip before parsing
function extractJson(raw: string): ParsedPdfFields {
	const cleaned = raw.trim().replace(/^\uFEFF/, "");
	const match = cleaned.match(/\{[\s\S]*\}/);
	if (!match) throw new Error("No JSON object found in Gemini response");
	return JSON.parse(match[0]) as ParsedPdfFields;
}

export async function parseWithGemini(
	pdfText: string,
	apiKey: string,
): Promise<ParsedPdfFields> {
	const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contents: [{ parts: [{ text: EXTRACTION_PROMPT + pdfText }] }],
			generationConfig: {
				temperature: 0.1,
				maxOutputTokens: 512,
			},
		}),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
	}

	const data = (await response.json()) as {
		candidates?: Array<{
			content?: { parts?: Array<{ text?: string }> };
		}>;
	};

	const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!text) throw new Error("Empty response from Gemini");

	return extractJson(text);
}
