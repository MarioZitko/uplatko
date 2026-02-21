import type { Hub3Data } from "@/types/hub3";

const HUB3_HEADER = "HRVHUB30";
const CURRENCY = "EUR";

/** Strips newline characters that would corrupt the HUB3 \n field delimiter structure. */
function sanitize(value: string): string {
	return value.replace(/[\n\r]/g, " ");
}

function formatAmount(amount: number): string {
	const cents = Math.round(amount * 100);
	return cents.toString().padStart(15, "0");
}

function truncate(value: string, maxLength: number): string {
	return value.slice(0, maxLength);
}

function sanitizeAndTruncate(value: string, maxLength: number): string {
	return truncate(sanitize(value), maxLength);
}

export function buildHub3String(data: Hub3Data): string {
	const fields = [
		HUB3_HEADER,
		CURRENCY,
		formatAmount(data.amount),
		sanitizeAndTruncate(data.payerName, 30),
		sanitizeAndTruncate(data.payerAddress, 27),
		sanitizeAndTruncate(data.payerCity, 27),
		sanitizeAndTruncate(data.recipientName, 30),
		sanitizeAndTruncate(data.recipientAddress, 27),
		sanitizeAndTruncate(data.recipientCity, 27),
		data.iban, // validated by zod: /^HR\d{19}$/ — no newlines possible
		sanitize(data.model), // free-text, uppercased, no length limit concern
		sanitize(data.referenceNumber), // free-text
		data.purposeCode, // enum — always a 4-char code
		sanitizeAndTruncate(data.description, 35),
	];

	return fields.join("\n");
}
