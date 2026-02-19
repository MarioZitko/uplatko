import { useEffect, useRef, useState } from "react";
import pdfjsLib from "@/lib/pdfWorker";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BarcodePreview from "@/components/BarcodePreview";
import { generateBarcode } from "@/modules/barcodeGenerator";
import { exportPdfWithBarcode } from "@/modules/pdfExporter";
import { useDraggable } from "@/hooks/useDraggable";
import { useResizable } from "@/hooks/useResizable";
import { downloadBlob, dataUrlToBlob } from "@/lib/download";
import type { Hub3Data } from "@/types/hub3";

interface Props {
	hub3Data: Hub3Data;
	pdfFile: File;
	onBack: () => void;
}

const INITIAL_BARCODE_SIZE = { width: 280, height: 100 };
const BARCODE_ASPECT_RATIO =
	INITIAL_BARCODE_SIZE.width / INITIAL_BARCODE_SIZE.height;

export default function PdfCanvas({ hub3Data, pdfFile, onBack }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [barcodeDataUrl, setBarcodeDataUrl] = useState<string | null>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);

	const {
		size: barcodeSize,
		isResizing,
		onResizeMouseDown,
		onResizeTouchStart,
	} = useResizable({
		initialSize: INITIAL_BARCODE_SIZE,
		minSize: { width: 140, height: 50 },
		maxSize: { width: 560, height: 200 },
		aspectRatio: BARCODE_ASPECT_RATIO,
	});

	const {
		position,
		isDragging,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
	} = useDraggable({
		initialPosition: { x: 40, y: 40 },
		containerSize: canvasSize,
		itemSize: barcodeSize,
	});

	const renderingRef = useRef(false);

	useEffect(() => {
		renderPdfPage();
		loadBarcode();
	}, []);

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
				barcodeSize,
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
						Povucite barkod na željenu poziciju. Povucite ugao za promjenu
						veličine.
					</p>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<div
						className="relative overflow-auto border rounded cursor-default"
						style={{ maxHeight: "70vh" }}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={onMouseUp}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onTouchEnd={onTouchEnd}
					>
						<canvas ref={canvasRef} />
						{barcodeDataUrl && (
							<div
								className="absolute select-none"
								style={{
									left: position.x,
									top: position.y,
									width: barcodeSize.width,
									height: barcodeSize.height,
									cursor: isDragging ? "grabbing" : "grab",
									border: "2px dashed #888",
									touchAction: "none", // prevent browser scroll interfering with drag
								}}
							>
								<img
									src={barcodeDataUrl}
									alt="HUB3 barkod"
									draggable={false}
									style={{ width: "100%", height: "100%", display: "block" }}
								/>
								{/* SE resize handle — large enough to tap on mobile */}
								<div
									onMouseDown={onResizeMouseDown}
									onTouchStart={onResizeTouchStart}
									style={{
										position: "absolute",
										right: -8,
										bottom: -8,
										width: 20,
										height: 20,
										background: isResizing ? "#2563eb" : "#888",
										border: "2px solid white",
										borderRadius: 4,
										cursor: "se-resize",
										touchAction: "none",
									}}
								/>
							</div>
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
