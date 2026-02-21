import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BarcodePreviewProps {
	barcodeDataUrl: string;
	onDownloadBarcode: () => void;
}

export default function BarcodePreview({
	barcodeDataUrl,
	onDownloadBarcode,
}: BarcodePreviewProps) {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 py-6">
				<img
					src={barcodeDataUrl}
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
