export const PURPOSE_CODES = {
	// Najčešće
	OTHR: "Ostalo",
	ADVA: "Avans", // Jako bitno za predračune
	SALA: "Plaća",
	COST: "Troškovi",
	SUPP: "Dobavljač",
	RENT: "Najam",

	// Poslovanje i država
	COMM: "Provizija",
	TAXS: "Porez",
	GOVT: "Vlada / Država", // Na slici je GOVT - Vlada
	UTIL: "Režije", // Objedinili smo sve režije u jedan kod sa slike

	// Specifično
	CASH: "Gotovina",
	DIVI: "Dividenda",
	LOAN: "Zajam",
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
