import { useRef, useState } from "react";

interface Size {
	width: number;
	height: number;
}

interface UseResizableOptions {
	initialSize: Size;
	minSize?: Size;
	maxSize?: Size;
	aspectRatio?: number;
}

interface UseResizableResult {
	size: Size;
	isResizing: boolean;
	onResizeMouseDown: (e: React.MouseEvent) => void;
	onResizeTouchStart: (e: React.TouchEvent) => void;
}

export function useResizable({
	initialSize,
	minSize = { width: 100, height: 40 },
	maxSize = { width: 560, height: 200 },
	aspectRatio,
}: UseResizableOptions): UseResizableResult {
	const [size, setSize] = useState<Size>(initialSize);
	const [isResizing, setIsResizing] = useState(false);

	const isResizingRef = useRef(false);
	const startPos = useRef({ x: 0, y: 0 });
	const startSize = useRef<Size>(initialSize);

	function startResize(clientX: number, clientY: number) {
		isResizingRef.current = true;
		setIsResizing(true);
		startPos.current = { x: clientX, y: clientY };
		startSize.current = size;
	}

	function applyResize(clientX: number, clientY: number) {
		if (!isResizingRef.current) return;

		const dx = clientX - startPos.current.x;
		const dy = clientY - startPos.current.y;

		const newWidth = Math.max(
			minSize.width,
			Math.min(maxSize.width, startSize.current.width + dx),
		);
		const newHeight =
			aspectRatio !== undefined
				? newWidth / aspectRatio
				: Math.max(
						minSize.height,
						Math.min(maxSize.height, startSize.current.height + dy),
					);

		setSize({ width: newWidth, height: newHeight });
	}

	function endResize() {
		isResizingRef.current = false;
		setIsResizing(false);
	}

	function onResizeMouseDown(e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		startResize(e.clientX, e.clientY);

		function onMouseMove(ev: MouseEvent) {
			applyResize(ev.clientX, ev.clientY);
		}
		function onMouseUp() {
			endResize();
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		}
		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	}

	function onResizeTouchStart(e: React.TouchEvent) {
		e.stopPropagation();
		e.preventDefault();
		const touch = e.touches[0];
		startResize(touch.clientX, touch.clientY);

		function onTouchMove(ev: TouchEvent) {
			ev.preventDefault();
			applyResize(ev.touches[0].clientX, ev.touches[0].clientY);
		}
		function onTouchEnd() {
			endResize();
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("touchend", onTouchEnd);
		}
		// passive: false required to allow preventDefault on touchmove
		window.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("touchend", onTouchEnd);
	}

	return { size, isResizing, onResizeMouseDown, onResizeTouchStart };
}
