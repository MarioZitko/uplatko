import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportNudge } from "@/components/SupportSection";
import { generateBarcode, type BarcodeResult } from "@/modules/barcodeGenerator";
import { downloadBlob, dataUrlToBlob } from "@/lib/download";
import type { Hub3Data } from "@/types/hub3";

// ============================= | Types | =============================

interface BarcodeOnlyStepProps {
	hub3Data: Hub3Data;
	sourceType: "xml" | "manual";
	onBack: () => void;
	onReset: () => void;
}

// ============================= | Component | =============================

export default function BarcodeOnlyStep({
	hub3Data,
	sourceType,
	onBack,
	onReset,
}: BarcodeOnlyStepProps) {
	// ============================= | State | =============================

	const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	// ============================= | Effects | =============================

	useEffect(() => {
		generateBarcode(hub3Data)
			.then(setBarcodeResult)
			.catch(() => setError("Greška pri generiranju barkoda."));
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ============================= | Handlers | =============================

	async function handleDownload() {
		if (!barcodeResult) return;
		const blob = await dataUrlToBlob(barcodeResult.dataUrl);
		downloadBlob(blob, "barkod.png");
	}

	// ============================= | Render | =============================

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="flex flex-col items-center gap-5 py-8">
					{!barcodeResult && !error && (
						<>
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								Generiranje barkoda...
							</p>
						</>
					)}

					{error && (
						<p className="text-sm text-destructive">{error}</p>
					)}

					{barcodeResult && (
						<>
							<p className="text-sm text-muted-foreground text-center">
								Skenirajte barkod u mobilnoj bankarskoj aplikaciji
								<br />
								(m-zaba, PBZ365, Erste Netbanking i sl.)
							</p>
							<img
								src={barcodeResult.dataUrl}
								alt="HUB-3 barkod"
								className="max-w-full border rounded"
							/>
							<Button onClick={handleDownload} size="lg">
								Preuzmi barkod (PNG)
							</Button>
						</>
					)}
				</CardContent>
			</Card>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					Natrag
				</Button>
				<Button variant="outline" onClick={onReset}>
					{sourceType === "xml" ? "Novi XML" : "Novi unos"}
				</Button>
			</div>

			<SupportNudge />
		</div>
	);
}
