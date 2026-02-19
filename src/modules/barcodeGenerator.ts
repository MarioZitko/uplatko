import bwipjs from "bwip-js";
import type { RenderOptions } from "bwip-js";
import type { Hub3Data } from "@/types/hub3";
import { buildHub3String } from "./hub3Formatter";

type BwipOptions = RenderOptions & Record<string, unknown>;

export interface BarcodeResult {
	canvas: HTMLCanvasElement;
	dataUrl: string;
}

export async function generateBarcode(data: Hub3Data): Promise<BarcodeResult> {
	const canvas = document.createElement("canvas");

	const options: BwipOptions = {
		bcid: "pdf417",
		text: buildHub3String(data),
		columns: 9,
		eclevel: 4,
		scaleX: 2,
		scaleY: 6,
		paddingtop: 2,
		paddingbottom: 2,
		paddingleft: 2,
		paddingright: 2,
	};

	await bwipjs.toCanvas(canvas, options as RenderOptions);

	return {
		canvas,
		dataUrl: canvas.toDataURL("image/png"),
	};
}
