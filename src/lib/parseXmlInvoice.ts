import type { ParsedPdfFields } from "@/types/hub3";

// ============================= | Helpers | =============================

/** Returns the first non-empty textContent for any of the given tag names. */
function first(doc: Document | Element, ...tags: string[]): string {
	for (const tag of tags) {
		const el = doc.getElementsByTagName(tag)[0];
		if (el?.textContent?.trim()) return el.textContent.trim();
	}
	return "";
}

/** Scoped version of `first` — searches inside a specific parent element. */
function child(parent: Element, ...tags: string[]): string {
	return first(parent, ...tags);
}

// ============================= | Parser | =============================

/**
 * Parses a UBL 2.1 XML e-invoice (Croatian Fiskalizacija 2.0 / EN 16931)
 * and extracts fields that map directly to the HUB-3 payment form.
 *
 * Supports both prefixed tags (cbc:, cac:) and un-prefixed variants
 * since some tools strip namespace prefixes.
 */
export function parseXmlInvoice(xmlText: string): ParsedPdfFields {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xmlText, "application/xml");

	// Detect parse errors (malformed XML)
	if (doc.querySelector("parsererror")) {
		throw new Error("Neispravan XML format.");
	}

	// ── Supplier (= the party we are paying) ──────────────────────────
	const supplierParty =
		doc.getElementsByTagName("cac:AccountingSupplierParty")[0] ??
		doc.getElementsByTagName("AccountingSupplierParty")[0];

	const recipientName = supplierParty
		? child(supplierParty, "cbc:Name", "Name")
		: "";

	const postalAddress = supplierParty
		? (supplierParty.getElementsByTagName("cac:PostalAddress")[0] ??
			supplierParty.getElementsByTagName("PostalAddress")[0])
		: null;

	const recipientAddress = postalAddress
		? child(postalAddress, "cbc:StreetName", "StreetName")
		: "";

	const recipientCity = postalAddress
		? child(postalAddress, "cbc:CityName", "CityName")
		: "";

	// ── Payment means (IBAN + reference number) ───────────────────────
	const paymentMeans =
		doc.getElementsByTagName("cac:PaymentMeans")[0] ??
		doc.getElementsByTagName("PaymentMeans")[0];

	const payeeAccount = paymentMeans
		? (paymentMeans.getElementsByTagName("cac:PayeeFinancialAccount")[0] ??
			paymentMeans.getElementsByTagName("PayeeFinancialAccount")[0])
		: null;

	const iban = payeeAccount ? child(payeeAccount, "cbc:ID", "ID") : "";

	// ── Invoice ID (first cbc:ID in document = invoice number) ───────
	const invoiceId =
		doc.documentElement.getElementsByTagName("cbc:ID")[0]?.textContent?.trim() ??
		doc.documentElement.getElementsByTagName("ID")[0]?.textContent?.trim() ??
		"";

	// ── Payment reference (cbc:PaymentID — present in Solo, Relago etc.) ─
	// The official fiskai.hr standard doesn't mandate this field, so we
	// fall back to the invoice ID as the reference number when absent.
	const rawPaymentId = paymentMeans
		? child(paymentMeans, "cbc:PaymentID", "PaymentID", "cbc:InstructionID", "InstructionID")
		: "";

	// Payment ID format: "HR68-12345-67890" or "HR68 12345 67890"
	let model = "HR99";
	let referenceNumber = rawPaymentId || invoiceId;
	const modelMatch = rawPaymentId.match(/^(HR\d{2})[-\s]?(.*)$/);
	if (modelMatch) {
		model = modelMatch[1];
		referenceNumber = modelMatch[2].trim();
	}

	// ── Amount ────────────────────────────────────────────────────────
	const amountStr = first(doc, "cbc:PayableAmount", "PayableAmount");
	const amount = amountStr ? parseFloat(amountStr) : undefined;

	// ── Description ───────────────────────────────────────────────────
	// PaymentTerms/Note has payment-terms text, skip it for description.
	// Use invoice-level Note (first <cbc:Note> direct child of root), or
	// fall back to "Račun {invoiceId}".
	const allNotes = doc.documentElement.getElementsByTagName("cbc:Note");
	const invoiceNote = allNotes[0]?.textContent?.trim() ?? "";
	const description =
		invoiceNote.slice(0, 35) ||
		(invoiceId ? `Račun ${invoiceId}`.slice(0, 35) : "");

	// ── Return only fields that have a value ──────────────────────────
	return {
		...(recipientName && { recipientName }),
		...(recipientAddress && { recipientAddress }),
		...(recipientCity && { recipientCity }),
		...(iban && { iban }),
		...(amount && !isNaN(amount) && { amount }),
		...(model && { model }),
		...(referenceNumber && { referenceNumber }),
		...(description && { description }),
	};
}
