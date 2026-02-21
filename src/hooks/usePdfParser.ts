import { useState } from "react";
import { toast } from "sonner";
import { extractTextFromPdf, parsePdfText } from "@/modules/pdfParser";
import { parseWithGemini } from "@/modules/geminiParser";
import { parseWithGroq } from "@/modules/groqParser";
import {
	getGeminiApiKey,
	getGroqApiKey,
	getLlmProvider,
} from "@/lib/llmStorage";
import type { ParsedPdfFields } from "@/types/hub3";

// ============================= | Types | =============================

export type LoadingStatus = "extracting" | "parsing" | null;

export const STATUS_LABELS: Record<NonNullable<LoadingStatus>, string> = {
	extracting: "Čitanje PDF-a...",
	parsing: "Analiza podataka...",
};

interface UsePdfParserResult {
	status: LoadingStatus;
	isLoading: boolean;
	parseFile: (file: File) => Promise<ParsedPdfFields | null>;
}

// ============================= | Hook | =============================

export function usePdfParser(): UsePdfParserResult {
	// ============================= | State | =============================

	const [status, setStatus] = useState<LoadingStatus>(null);

	// ============================= | Helpers | =============================

	async function resolveFields(text: string): Promise<ParsedPdfFields> {
		const provider = getLlmProvider();

		if (provider === "gemini") {
			const apiKey = getGeminiApiKey();
			if (!apiKey) {
				toast.warning(
					"Gemini je odabran ali API ključ nije postavljen. Dodaj ga u postavkama.",
				);
				return parsePdfText(text);
			}
			try {
				return await parseWithGemini(text, apiKey);
			} catch (err) {
				console.warn("Gemini parsing failed, falling back to regex:", err);
				toast.warning("Gemini nije uspio, korišten regex. Provjerite polja.");
				return parsePdfText(text);
			}
		}

		if (provider === "groq") {
			const apiKey = getGroqApiKey();
			if (!apiKey) {
				toast.warning(
					"Groq je odabran ali API ključ nije postavljen. Dodaj ga u postavkama.",
				);
				return parsePdfText(text);
			}
			try {
				return await parseWithGroq(text, apiKey);
			} catch (err) {
				console.warn("Groq parsing failed, falling back to regex:", err);
				toast.warning("Groq nije uspio, korišten regex. Provjerite polja.");
				return parsePdfText(text);
			}
		}

		return parsePdfText(text);
	}

	// ============================= | Main | =============================

	async function parseFile(file: File): Promise<ParsedPdfFields | null> {
		if (file.type !== "application/pdf") {
			toast.error("Molimo odaberite PDF datoteku.");
			return null;
		}

		try {
			setStatus("extracting");
			const text = await extractTextFromPdf(file);

			setStatus("parsing");
			return await resolveFields(text);
		} catch {
			toast.error("Greška pri čitanju PDF-a. Pokušajte ponovo.");
			return null;
		} finally {
			setStatus(null);
		}
	}

	return { status, isLoading: status !== null, parseFile };
}
