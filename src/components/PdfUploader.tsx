import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePdfParser, STATUS_LABELS } from "@/hooks/usePdfParser";
import { parseXmlInvoice } from "@/lib/parseXmlInvoice";
import type { ParsedPdfFields } from "@/types/hub3";

// ============================= | Types | =============================

interface PdfUploaderProps {
	onPdfParsed: (fields: ParsedPdfFields, file: File) => void;
	onXmlParsed: (fields: ParsedPdfFields) => void;
	onManual: () => void;
}

// ============================= | Component | =============================

export default function PdfUploader({
	onPdfParsed,
	onXmlParsed,
	onManual,
}: PdfUploaderProps) {
	// ============================= | State | =============================

	const inputRef = useRef<HTMLInputElement>(null);
	const { status, isLoading, parseFile } = usePdfParser();

	// ============================= | Handlers | =============================

	async function handleFile(file: File) {
		if (file.name.endsWith(".xml") || file.type === "text/xml" || file.type === "application/xml") {
			handleXmlFile(file);
			return;
		}
		// Default: treat as PDF
		const fields = await parseFile(file);
		if (fields) onPdfParsed(fields, file);
	}

	function handleXmlFile(file: File) {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target?.result as string;
				const fields = parseXmlInvoice(text);
				onXmlParsed(fields);
			} catch (err) {
				toast.error(
					err instanceof Error ? err.message : "Greška pri čitanju XML-a.",
				);
			}
		};
		reader.onerror = () => toast.error("Greška pri čitanju datoteke.");
		reader.readAsText(file, "UTF-8");
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

	// ============================= | Render | =============================

	return (
		<div className="space-y-4">
			<Card
				className="border-dashed border-2 transition-colors"
				style={{ cursor: isLoading ? "default" : "pointer" }}
				onDrop={isLoading ? undefined : handleDrop}
				onDragOver={isLoading ? undefined : (e) => e.preventDefault()}
				onClick={isLoading ? undefined : () => inputRef.current?.click()}
			>
				<CardContent className="flex flex-col items-center justify-center py-16 text-center">
					{isLoading ? (
						<>
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
							<p className="text-sm text-muted-foreground">
								{STATUS_LABELS[status!]}
							</p>
						</>
					) : (
						<>
							<p className="text-lg font-medium mb-1">
								Povucite PDF ili XML e-račun ovdje
							</p>
							<p className="text-muted-foreground text-sm mb-4">
								ili kliknite za odabir datoteke
							</p>
							<Button variant="outline" type="button">
								Odaberi datoteku
							</Button>
						</>
					)}
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf,.pdf,.xml,text/xml,application/xml"
						className="hidden"
						onChange={handleInputChange}
					/>
				</CardContent>
			</Card>

			<div className="flex items-center justify-between">
				<p className="text-xs text-muted-foreground">
					Podaci ostaju lokalno u pregledniku i nigdje se ne šalju.
				</p>
				<button
					type="button"
					onClick={onManual}
					className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer"
				>
					Unesi ručno
				</button>
			</div>
		</div>
	);
}
