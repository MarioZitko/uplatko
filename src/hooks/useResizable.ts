import { useEffect, useRef, useState } from "react";

// ============================= | Types | =============================

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

// ============================= | Hook | =============================

export function useResizable({
	initialSize,
	minSize = { width: 100, height: 40 },
	maxSize = { width: 560, height: 200 },
	aspectRatio,
}: UseResizableOptions): UseResizableResult {
	// ============================= | State | =============================

	const [size, setSize] = useState<Size>(initialSize);
	const [isResizing, setIsResizing] = useState(false);

	const isResizingRef = useRef(false);
	const startPos = useRef({ x: 0, y: 0 });
	const startSize = useRef<Size>(initialSize);

	// Holds abort controllers for active window listeners so they can be
	// cleaned up if the component unmounts mid-resize.
	const abortControllerRef = useRef<AbortController | null>(null);

	// ============================= | Effects | =============================

	// Cleanup any dangling window listeners if the component unmounts mid-resize.
	useEffect(() => {
		return () => {
			abortControllerRef.current?.abort();
		};
	}, []);

	// ============================= | Helpers | =============================

	function startResize(clientX: number, clientY: number) {
		isResizingRef.current = true;
		setIsResizing(true);
		startPos.current = { x: clientX, y: clientY };
		startSize.current = size;
	}

	function applyResize(clientX: number, clientY: number) {
		if (!isResizingRef.current) return;

		const dx = clientX - startPos.current.x;

		const newWidth = Math.max(
			minSize.width,
			Math.min(maxSize.width, startSize.current.width + dx),
		);
		const newHeight =
			aspectRatio !== undefined
				? newWidth / aspectRatio
				: Math.max(
						minSize.height,
						Math.min(
							maxSize.height,
							startSize.current.height + (clientY - startPos.current.y),
						),
					);

		setSize({ width: newWidth, height: newHeight });
	}

	function endResize() {
		isResizingRef.current = false;
		setIsResizing(false);
		abortControllerRef.current?.abort();
		abortControllerRef.current = null;
	}

	// ============================= | Handlers | =============================

	function onResizeMouseDown(e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		startResize(e.clientX, e.clientY);

		const controller = new AbortController();
		abortControllerRef.current = controller;
		const { signal } = controller;

		window.addEventListener(
			"mousemove",
			(ev) => applyResize(ev.clientX, ev.clientY),
			{ signal },
		);
		window.addEventListener("mouseup", endResize, { signal });
	}

	function onResizeTouchStart(e: React.TouchEvent) {
		e.stopPropagation();
		e.preventDefault();
		const touch = e.touches[0];
		startResize(touch.clientX, touch.clientY);

		const controller = new AbortController();
		abortControllerRef.current = controller;
		const { signal } = controller;

		window.addEventListener(
			"touchmove",
			(ev) => {
				ev.preventDefault();
				applyResize(ev.touches[0].clientX, ev.touches[0].clientY);
			},
			{ signal, passive: false },
		);
		window.addEventListener("touchend", endResize, { signal });
	}

	// ============================= | Return | =============================

	return { size, isResizing, onResizeMouseDown, onResizeTouchStart };
}
