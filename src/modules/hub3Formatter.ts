import type { Hub3Data } from "@/types/hub3";

const HUB3_HEADER = "HRVHUB30";
const CURRENCY = "EUR";

function formatAmount(amount: number): string {
	const cents = Math.round(amount * 100);
	return cents.toString().padStart(15, "0");
}

function truncate(value: string, maxLength: number): string {
	return value.slice(0, maxLength);
}

export function buildHub3String(data: Hub3Data): string {
	const fields = [
		HUB3_HEADER,
		CURRENCY,
		formatAmount(data.amount),
		truncate(data.payerName, 30),
		truncate(data.payerAddress, 27),
		truncate(data.payerCity, 27),
		truncate(data.recipientName, 30),
		truncate(data.recipientAddress, 27),
		truncate(data.recipientCity, 27),
		data.iban,
		data.model,
		data.referenceNumber,
		data.purposeCode,
		truncate(data.description, 35),
	];

	return fields.join("\n");
}
