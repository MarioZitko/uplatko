import { useEffect, useRef, useState } from "react";
import pdfjsLib from "@/lib/pdfWorker";
import {
	generateBarcode,
	type BarcodeResult,
} from "@/modules/barcodeGenerator";
import { exportPdfWithBarcode } from "@/modules/pdfExporter";
import { downloadBlob, dataUrlToBlob } from "@/lib/download";
import type { Hub3Data } from "@/types/hub3";

// ============================= | Types | =============================

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface UsePdfCanvasOptions {
	hub3Data: Hub3Data;
	pdfFile: File;
	position: Position;
	canvasSize: Size;
	barcodeSize: Size;
	onCanvasSizeChange: (size: Size) => void;
}

interface UsePdfCanvasResult {
	canvasRef: React.RefObject<HTMLCanvasElement | null>;
	barcodeResult: BarcodeResult | null;
	error: string | null;
	exporting: boolean;
	handleDownloadPdf: () => Promise<void>;
	handleDownloadBarcode: () => Promise<void>;
}

// ============================= | Hook | =============================

export function usePdfCanvas({
	hub3Data,
	pdfFile,
	position,
	canvasSize,
	barcodeSize,
	onCanvasSizeChange,
}: UsePdfCanvasOptions): UsePdfCanvasResult {
	// ============================= | State | =============================

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const renderingRef = useRef(false);

	const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [exporting, setExporting] = useState(false);

	// ============================= | Effects | =============================

	// Runs once on mount. pdfFile and hub3Data are stable references passed from
	// the parent and do not change after this component mounts, so omitting them
	// from the dependency array is intentional.
	useEffect(() => {
		renderPdfPage();
		loadBarcode();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ============================= | Helpers | =============================

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
			onCanvasSizeChange({ width: viewport.width, height: viewport.height });
			await page.render({ canvasContext: context, viewport, canvas }).promise;
		} catch (e) {
			console.error(e);
			setError("Greška pri renderiranju PDF-a.");
		}
	}

	async function loadBarcode() {
		try {
			const result = await generateBarcode(hub3Data);
			setBarcodeResult(result);
		} catch {
			setError("Greška pri generiranju barkoda.");
		}
	}

	// ============================= | Handlers | =============================

	async function handleDownloadPdf() {
		if (!barcodeResult) return;
		setExporting(true);
		try {
			await exportPdfWithBarcode({
				pdfFile,
				barcodeResult,
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
		if (!barcodeResult) return;
		const blob = await dataUrlToBlob(barcodeResult.dataUrl);
		downloadBlob(blob, "barkod.png");
	}

	return {
		canvasRef,
		barcodeResult,
		error,
		exporting,
		handleDownloadPdf,
		handleDownloadBarcode,
	};
}
