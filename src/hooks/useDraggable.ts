import { useRef, useState } from "react";

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

interface UseDraggableOptions {
	initialPosition?: Position;
	containerSize: Size;
	itemSize: Size;
}

interface UseDraggableResult {
	position: Position;
	isDragging: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
	onMouseMove: (e: React.MouseEvent) => void;
	onMouseUp: () => void;
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchMove: (e: React.TouchEvent) => void;
	onTouchEnd: () => void;
}

export function useDraggable({
	initialPosition = { x: 0, y: 0 },
	containerSize,
	itemSize,
}: UseDraggableOptions): UseDraggableResult {
	const [position, setPosition] = useState<Position>(initialPosition);
	const [isDragging, setIsDragging] = useState(false);

	const isDraggingRef = useRef(false);
	const dragStart = useRef<Position>({ x: 0, y: 0 });
	const positionStart = useRef<Position>(initialPosition);

	function clamp(pos: Position): Position {
		return {
			x: Math.max(0, Math.min(containerSize.width - itemSize.width, pos.x)),
			y: Math.max(0, Math.min(containerSize.height - itemSize.height, pos.y)),
		};
	}

	function startDrag(clientX: number, clientY: number) {
		isDraggingRef.current = true;
		setIsDragging(true);
		dragStart.current = { x: clientX, y: clientY };
		positionStart.current = position;
	}

	function moveDrag(clientX: number, clientY: number) {
		if (!isDraggingRef.current) return;
		const dx = clientX - dragStart.current.x;
		const dy = clientY - dragStart.current.y;
		setPosition(
			clamp({
				x: positionStart.current.x + dx,
				y: positionStart.current.y + dy,
			}),
		);
	}

	function endDrag() {
		isDraggingRef.current = false;
		setIsDragging(false);
	}

	function onMouseDown(e: React.MouseEvent) {
		startDrag(e.clientX, e.clientY);
	}

	function onMouseMove(e: React.MouseEvent) {
		moveDrag(e.clientX, e.clientY);
	}

	function onMouseUp() {
		endDrag();
	}

	function onTouchStart(e: React.TouchEvent) {
		startDrag(e.touches[0].clientX, e.touches[0].clientY);
	}

	function onTouchMove(e: React.TouchEvent) {
		moveDrag(e.touches[0].clientX, e.touches[0].clientY);
	}

	function onTouchEnd() {
		endDrag();
	}

	return {
		position,
		isDragging,
		onMouseDown,
		onMouseMove,
		onMouseUp,
		onTouchStart,
		onTouchMove,
		onTouchEnd,
	};
}
