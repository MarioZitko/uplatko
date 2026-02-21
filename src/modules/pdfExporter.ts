import { PDFDocument } from "pdf-lib";
import { downloadBlob } from "@/lib/download";
import type { BarcodeResult } from "@/modules/barcodeGenerator";

interface ExportOptions {
	pdfFile: File;
	barcodeResult: BarcodeResult;
	position: { x: number; y: number };
	canvasSize: { width: number; height: number };
	barcodeSize: { width: number; height: number };
}

export async function exportPdfWithBarcode(
	options: ExportOptions,
): Promise<void> {
	const { pdfFile, barcodeResult, position, canvasSize, barcodeSize } = options;

	const pdfBytes = await pdfFile.arrayBuffer();

	const pdfDoc = await PDFDocument.load(pdfBytes);
	const page = pdfDoc.getPages()[0];
	const { height } = page.getSize();
	const scale = height / canvasSize.height;

	const barcodeArrayBuffer = await new Promise<ArrayBuffer>(
		(resolve, reject) => {
			barcodeResult.canvas.toBlob((blob) => {
				if (!blob) return reject(new Error("Canvas toBlob failed"));
				blob.arrayBuffer().then(resolve).catch(reject);
			}, "image/png");
		},
	);

	const pngImage = await pdfDoc.embedPng(barcodeArrayBuffer);

	page.drawImage(pngImage, {
		x: position.x * scale,
		y: height - (position.y + barcodeSize.height) * scale,
		width: barcodeSize.width * scale,
		height: barcodeSize.height * scale,
	});

	const bytes = await pdfDoc.save();
	downloadBlob(
		new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }),
		"uplatnica.pdf",
	);
}
