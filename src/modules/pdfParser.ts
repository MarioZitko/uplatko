import pdfjsLib from "@/lib/pdfWorker";
import type { ParsedPdfFields } from "@/types/hub3";

// ─── PDF Text Extraction ──────────────────────────────────────────────────────

export async function extractTextFromPdf(file: File): Promise<string> {
	const arrayBuffer = await file.arrayBuffer();
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

	const pages = await Promise.all(
		Array.from({ length: pdf.numPages }, (_, i) =>
			pdf.getPage(i + 1).then((page) => page.getTextContent()),
		),
	);

	return pages
		.flatMap((content) =>
			content.items.map((item) => ("str" in item ? item.str : "")),
		)
		.join("\n");
}

// ─── Field Parsers ────────────────────────────────────────────────────────────

// Matches HR IBAN regardless of spacing style (banks format it inconsistently)
function parseIban(text: string): string | undefined {
	const matches = [...text.matchAll(/HR\d{2}[\s\d]{15,25}/g)];
	if (matches.length === 0) return undefined;
	// Take the last match — recipient IBAN is usually at the bottom
	return matches[matches.length - 1][0].replace(/\s/g, "");
}

// Priority: "za naplatu" (total with VAT) > "sveukupno" > "ukupno" > "iznos"
function parseAmount(text: string): number | undefined {
	const patterns = [
		/za naplatu[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
		/sveukupno[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
		/ukupno[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
		/iznos[^\d]*(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/i,
	];

	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match) {
			// Croatian format uses . for thousands and , for decimals
			const normalized = match[1].replace(/\./g, "").replace(",", ".");
			const value = parseFloat(normalized);
			if (!isNaN(value)) return value;
		}
	}
	return undefined;
}

// Reference number can contain digits, dashes and slashes (e.g. 1676-10-25)
function parseReferenceNumber(text: string): string | undefined {
	const match = text.match(
		/(?:poziv na broj|poziv|reference)[^\n]*?([0-9][\d\s\-/]{3,})/i,
	);
	return match?.[1].trim();
}

// Model is always HR + 2 digits (e.g. HR68)
function parseModel(text: string): string | undefined {
	const match = text.match(/(?:model)[^\w]*(HR\d{2})/i);
	return match?.[1];
}

// Payment description — look for explicit label first
function parseDescription(text: string): string | undefined {
	const match = text.match(
		/(?:opis pla[cć]anja|opis|svrha)[^\n]*\n?([^\n]{3,35})/i,
	);
	return match?.[1].trim();
}

// ─── Recipient Header Parser ──────────────────────────────────────────────────

// Croatian invoices typically have the recipient company info in the header:
// Line 1: Company name (d.o.o., j.d.o.o., obrt, etc.)
// Line 2: Street address
// Line 3: City (may include ZIP code)
// We extract the first block that looks like a company header
function parseRecipientFromHeader(
	text: string,
	iban: string | undefined,
): { name?: string; address?: string; city?: string } {
	const lines = text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);

	// If we have an IBAN, find the block of lines closest to it
	// Company info is almost always right above the IBAN line
	if (iban) {
		const ibanLineIndex = lines.findIndex((l) =>
			l.replace(/\s/g, "").includes(iban.slice(0, 10)),
		);

		if (ibanLineIndex > 2) {
			// Look at the 4 lines before the IBAN line
			const candidates = lines.slice(
				Math.max(0, ibanLineIndex - 4),
				ibanLineIndex,
			);

			// First non-empty candidate that isn't OIB/tel/address is the name
			const name = candidates.find(
				(l) =>
					l.length > 2 &&
					!/^OIB|^Tel|^Mob|^Fax|^\d/.test(l) &&
					!/^\d{1,3}[.,]\d{2}/.test(l),
			);

			const address = candidates.find(
				(l) => /\d/.test(l) && !/^OIB|^IBAN/.test(l) && l !== name,
			);

			const city = candidates.find(
				(l) => l !== name && l !== address && /^[A-ZŠĐČĆŽ][a-zšđčćž]/.test(l),
			);

			if (name) {
				return {
					name: name.slice(0, 30),
					address: address?.slice(0, 27),
					city: city?.replace(/^\d{5}\s*/, "").slice(0, 27),
				};
			}
		}
	}

	return {};
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parsePdfText(text: string): ParsedPdfFields {
	const iban = parseIban(text);
	const recipient = parseRecipientFromHeader(text, iban);

	return {
		// Recipient — parsed from header block
		recipientName: recipient.name,
		recipientAddress: recipient.address,
		recipientCity: recipient.city,

		// Payment fields
		iban: parseIban(text),
		amount: parseAmount(text),
		referenceNumber: parseReferenceNumber(text),
		model: parseModel(text) ?? "HR68",
		description: parseDescription(text),

		// Platitelj is left empty — bank auto-fills from user's account on scan
		payerName: undefined,
		payerAddress: undefined,
		payerCity: undefined,

		// Defaults
		purposeCode: "OTHR",
		currency: "EUR",
	};
}
