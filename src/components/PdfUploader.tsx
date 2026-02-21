import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePdfParser, STATUS_LABELS } from "@/hooks/usePdfParser";
import type { ParsedPdfFields } from "@/types/hub3";

// ============================= | Types | =============================

interface PdfUploaderProps {
	onParsed: (fields: ParsedPdfFields, file: File) => void;
}

// ============================= | Component | =============================

export default function PdfUploader({ onParsed }: PdfUploaderProps) {
	// ============================= | State | =============================

	const inputRef = useRef<HTMLInputElement>(null);
	const { status, isLoading, parseFile } = usePdfParser();

	// ============================= | Handlers | =============================

	async function handleFile(file: File) {
		const fields = await parseFile(file);
		if (fields) onParsed(fields, file);
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
							<p className="text-lg font-medium mb-1">Povucite PDF ovdje</p>
							<p className="text-muted-foreground text-sm mb-4">
								ili kliknite za odabir datoteke
							</p>
							<Button variant="outline" type="button">
								Odaberi PDF
							</Button>
						</>
					)}
					<input
						ref={inputRef}
						type="file"
						accept="application/pdf"
						className="hidden"
						onChange={handleInputChange}
					/>
				</CardContent>
			</Card>

			<p className="text-xs text-muted-foreground">
				Podaci ostaju lokalno u pregledniku i nigdje se ne šalju.
			</p>
		</div>
	);
}
