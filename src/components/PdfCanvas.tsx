import { useEffect, useRef, useState } from "react";
import pdfjsLib from "@/lib/pdfWorker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BarcodePreview from "@/components/BarcodePreview";
import { generateBarcode } from "@/modules/barcodeGenerator";
import { exportPdfWithBarcode } from "@/modules/pdfExporter";
import { useDraggable } from "@/hooks/useDraggable";
import { downloadBlob, dataUrlToBlob } from "@/lib/download";
import type { Hub3Data } from "@/types/hub3";

interface Props {
	hub3Data: Hub3Data;
	pdfFile: File;
	onBack: () => void;
}

const BARCODE_SIZE = { width: 280, height: 100 };

export default function PdfCanvas({ hub3Data, pdfFile, onBack }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);

	const { position, isDragging, onMouseDown, onMouseMove, onMouseUp } =
		useDraggable({
			initialPosition: { x: 40, y: 40 },
			containerSize: canvasSize,
			itemSize: BARCODE_SIZE,
		});

	useEffect(() => {
		renderPdfPage();
		loadBarcode();
	}, []);

	const renderingRef = useRef(false);

	async function renderPdfPage() {
		if (renderingRef.current) return;
		renderingRef.current = true;
		try {
			const arrayBuffer = await pdfFile.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
			const page = await pdf.getPage(1);
			const containerWidth =
				canvasRef.current?.parentElement?.clientWidth ?? 800;
			const unscaledViewport = page.getViewport({ scale: 1 });
			const scale = containerWidth / unscaledViewport.width;
			const viewport = page.getViewport({ scale });
			const canvas = canvasRef.current;
			if (!canvas) return;
			const context = canvas.getContext("2d");
			if (!context) return;
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			setCanvasSize({ width: viewport.width, height: viewport.height });
			await page.render({ canvasContext: context, viewport, canvas }).promise;
		} catch (e) {
			console.error(e);
			setError("Greška pri renderiranju PDF-a.");
		}
	}

	async function loadBarcode() {
		try {
			const result = await generateBarcode(hub3Data);
			setBarcodeDataUrl(result.dataUrl);
		} catch {
			setError("Greška pri generiranju barkoda.");
		}
	}

	async function handleDownloadPdf() {
		if (!barcodeDataUrl) return;
		setExporting(true);
		try {
			await exportPdfWithBarcode({
				pdfFile,
				hub3Data,
				position,
				canvasSize,
				barcodeSize: BARCODE_SIZE,
			});
		} catch {
			setError("Greška pri izvozu PDF-a.");
		} finally {
			setExporting(false);
		}
	}

	async function handleDownloadBarcode() {
		if (!barcodeDataUrl) return;
		const blob = await dataUrlToBlob(barcodeDataUrl);
		downloadBlob(blob, "barkod.png");
	}

	return (
		<div className="space-y-6">
			<BarcodePreview
				hub3Data={hub3Data}
				onDownloadBarcode={handleDownloadBarcode}
			/>

			<Card>
				<CardContent className="py-4 space-y-3">
					<p className="text-sm text-muted-foreground">
						Povucite barkod na željenu poziciju na dokumentu.
					</p>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div
						className="relative overflow-auto border rounded cursor-default"
						style={{ maxHeight: "70vh" }}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={onMouseUp}
					>
						<canvas ref={canvasRef} />
						{barcodeDataUrl && (
							<img
								src={barcodeDataUrl}
								alt="HUB3 barkod"
								draggable={false}
								className="absolute select-none"
								style={{
									left: position.x,
									top: position.y,
									width: BARCODE_SIZE.width,
									height: BARCODE_SIZE.height,
									cursor: isDragging ? "grabbing" : "grab",
									border: "2px dashed #888",
								}}
							/>
						)}
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-between">
				<Button variant="outline" onClick={onBack}>
					Natrag
				</Button>
				<Button
					onClick={handleDownloadPdf}
					disabled={exporting || !barcodeDataUrl}
				>
					{exporting ? "Izvoz..." : "Preuzmi PDF s barkodom"}
				</Button>
			</div>
		</div>
	);
}
