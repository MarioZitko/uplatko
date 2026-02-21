import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BarcodePreview from "@/components/BarcodePreview";
import { usePdfCanvas } from "@/hooks/usePdfCanvas";
import { useDraggable } from "@/hooks/useDraggable";
import { useResizable } from "@/hooks/useResizable";
import type { Hub3Data } from "@/types/hub3";

// ============================= | Types | =============================

interface PdfCanvasProps {
	hub3Data: Hub3Data;
	pdfFile: File;
	onBack: () => void;
	onReset: () => void;
}

// ============================= | Constants | =============================

const INITIAL_BARCODE_SIZE = { width: 280, height: 100 };
const BARCODE_ASPECT_RATIO =
	INITIAL_BARCODE_SIZE.width / INITIAL_BARCODE_SIZE.height;
const INITIAL_CANVAS_SIZE = { width: 0, height: 0 };

// ============================= | Component | =============================

export default function PdfCanvas({
	hub3Data,
	pdfFile,
	onBack,
	onReset,
}: PdfCanvasProps) {
	// ============================= | State | =============================

	const [canvasSize, setCanvasSize] = useState(INITIAL_CANVAS_SIZE);

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

	const {
		canvasRef,
		barcodeResult,
		error,
		exporting,
		handleDownloadPdf,
		handleDownloadBarcode,
	} = usePdfCanvas({
		hub3Data,
		pdfFile,
		position,
		canvasSize,
		barcodeSize,
		onCanvasSizeChange: setCanvasSize,
	});

	// ============================= | Render | =============================

	return (
		<div className="space-y-6">
			{barcodeResult && (
				<BarcodePreview
					barcodeDataUrl={barcodeResult.dataUrl}
					onDownloadBarcode={handleDownloadBarcode}
				/>
			)}

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
						{barcodeResult && (
							<div
								className="absolute select-none"
								style={{
									left: position.x,
									top: position.y,
									width: barcodeSize.width,
									height: barcodeSize.height,
									cursor: isDragging ? "grabbing" : "grab",
									border: "2px dashed #888",
									touchAction: "none",
								}}
							>
								<img
									src={barcodeResult.dataUrl}
									alt="HUB3 barkod"
									draggable={false}
									style={{ width: "100%", height: "100%", display: "block" }}
								/>
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
				<Button variant="outline" onClick={onReset}>
					Novi PDF
				</Button>
				<Button
					onClick={handleDownloadPdf}
					disabled={exporting || !barcodeResult}
				>
					{exporting ? "Izvoz..." : "Preuzmi PDF s barkodom"}
				</Button>
			</div>
		</div>
	);
}
