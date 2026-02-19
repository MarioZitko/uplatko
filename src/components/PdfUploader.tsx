import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { extractTextFromPdf, parsePdfText } from "@/modules/pdfParser";
import { parseWithGemini } from "@/modules/geminiParser";
import { parseWithGroq } from "@/modules/groqParser";
import {
	getGeminiApiKey,
	getGroqApiKey,
	getLlmProvider,
} from "@/lib/llmStorage";
import type { ParsedPdfFields } from "@/types/hub3";

interface Props {
	onParsed: (fields: ParsedPdfFields, file: File) => void;
}

export default function PdfUploader({ onParsed }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleFile(file: File) {
		if (file.type !== "application/pdf") {
			setError("Molimo odaberite PDF datoteku.");
			return;
		}
		setError(null);
		setLoading(true);
		try {
			const text = await extractTextFromPdf(file);
			const provider = getLlmProvider();
			let fields: ParsedPdfFields;

			if (provider === "gemini") {
				const apiKey = getGeminiApiKey();
				if (!apiKey) {
					setError(
						"Gemini je odabran ali API ključ nije postavljen. Dodaj ga u postavkama.",
					);
					fields = parsePdfText(text);
				} else {
					try {
						fields = await parseWithGemini(text, apiKey);
					} catch (err) {
						console.warn("Gemini parsing failed, falling back to regex:", err);
						setError("Gemini nije uspio, korišten regex. Provjerite polja.");
						fields = parsePdfText(text);
					}
				}
			} else if (provider === "groq") {
				const apiKey = getGroqApiKey();
				if (!apiKey) {
					setError(
						"Groq je odabran ali API ključ nije postavljen. Dodaj ga u postavkama.",
					);
					fields = parsePdfText(text);
				} else {
					try {
						fields = await parseWithGroq(text, apiKey);
					} catch (err) {
						console.warn("Groq parsing failed, falling back to regex:", err);
						setError("Groq nije uspio, korišten regex. Provjerite polja.");
						fields = parsePdfText(text);
					}
				}
			} else {
				fields = parsePdfText(text);
			}

			onParsed(fields, file);
		} catch {
			setError("Greška pri čitanju PDF-a. Pokušajte ponovo.");
		} finally {
			setLoading(false);
		}
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file) handleFile(file);
	}

	return (
		<div className="space-y-4">
			<Card
				className="border-dashed border-2 cursor-pointer hover:border-primary transition-colors"
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
				onClick={() => inputRef.current?.click()}
			>
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					<p className="text-lg font-medium mb-1">Povucite PDF ovdje</p>
					<p className="text-muted-foreground text-sm mb-4">
						ili kliknite za odabir datoteke
					</p>
					<Button variant="outline" type="button" disabled={loading}>
						{loading ? "Učitavanje..." : "Odaberi PDF"}
					</Button>
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf"
						className="hidden"
						onChange={handleInputChange}
					/>
				</CardContent>
			</Card>

			{error && <p className="text-sm text-destructive">{error}</p>}
			<p className="text-xs text-muted-foreground">
				Podaci ostaju lokalno u pregledniku i nigdje se ne šalju.
			</p>
		</div>
	);
}
