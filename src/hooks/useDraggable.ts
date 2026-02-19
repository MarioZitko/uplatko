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
}

export function useDraggable({
	initialPosition = { x: 40, y: 40 },
	containerSize,
	itemSize,
}: UseDraggableOptions): UseDraggableResult {
	const [position, setPosition] = useState<Position>(initialPosition);
	const [isDragging, setIsDragging] = useState(false);

	// Refs for values that must not trigger re-renders
	const isDraggingRef = useRef(false);
	const dragOffset = useRef<Position>({ x: 0, y: 0 });

	function getCursorPosition(e: React.MouseEvent): Position {
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const el = e.currentTarget as HTMLElement;
		return {
			x: e.clientX - rect.left + el.scrollLeft,
			y: e.clientY - rect.top + el.scrollTop,
		};
	}

	function isOverItem(cursor: Position): boolean {
		return (
			cursor.x >= position.x &&
			cursor.x <= position.x + itemSize.width &&
			cursor.y >= position.y &&
			cursor.y <= position.y + itemSize.height
		);
	}

	function clamp(value: number, max: number): number {
		return Math.max(0, Math.min(value, max));
	}

	function onMouseDown(e: React.MouseEvent) {
		const cursor = getCursorPosition(e);
		if (!isOverItem(cursor)) return;

		isDraggingRef.current = true;
		setIsDragging(true);
		dragOffset.current = {
			x: cursor.x - position.x,
			y: cursor.y - position.y,
		};
	}

	function onMouseMove(e: React.MouseEvent) {
		if (!isDraggingRef.current) return;

		const cursor = getCursorPosition(e);
		setPosition({
			x: clamp(
				cursor.x - dragOffset.current.x,
				containerSize.width - itemSize.width,
			),
			y: clamp(
				cursor.y - dragOffset.current.y,
				containerSize.height - itemSize.height,
			),
		});
	}

	function onMouseUp() {
		isDraggingRef.current = false;
		setIsDragging(false);
	}

	return { position, isDragging, onMouseDown, onMouseMove, onMouseUp };
}
