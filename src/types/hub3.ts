export const PURPOSE_CODES = {
	OTHR: "Ostalo",
	SALA: "Plaća",
	RENT: "Najam",
	COST: "Troškovi",
	COMT: "Komercijalno plaćanje",
} as const;

export type PurposeCode = keyof typeof PURPOSE_CODES;

export interface Hub3Data {
	payerName: string;
	payerAddress: string;
	payerCity: string;
	recipientName: string;
	recipientAddress: string;
	recipientCity: string;
	iban: string;
	amount: number;
	model: string;
	referenceNumber: string;
	purposeCode: PurposeCode;
	description: string;
	currency: "EUR";
}

export type ParsedPdfFields = Partial<Hub3Data>;
