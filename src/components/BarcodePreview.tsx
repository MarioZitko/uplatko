import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	generateBarcode,
	type BarcodeResult,
} from "@/modules/barcodeGenerator";
import type { Hub3Data } from "@/types/hub3";

interface Props {
	hub3Data: Hub3Data;
	onDownloadBarcode: () => void;
}

export default function BarcodePreview({ hub3Data, onDownloadBarcode }: Props) {
	const [barcode, setBarcode] = useState<BarcodeResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		generateBarcode(hub3Data)
			.then(setBarcode)
			.catch(() => setError("Greška pri generiranju barkoda."));
	}, [hub3Data]);

	if (error) return <p className="text-sm text-destructive">{error}</p>;
	if (!barcode)
		return (
			<p className="text-sm text-muted-foreground">Generiranje barkoda...</p>
		);

	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 py-6">
				<img
					src={barcode.dataUrl}
					alt="HUB3 barkod"
					className="max-w-full border rounded"
				/>
				<Button variant="outline" onClick={onDownloadBarcode}>
					Preuzmi barkod (PNG)
				</Button>
			</CardContent>
		</Card>
	);
}
