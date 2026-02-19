import { useEffect, useRef, useState } from "react";

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
	initialPosition = { x: 40, y: 40 },
	containerSize,
	itemSize,
}: UseDraggableOptions): UseDraggableResult {
	const [position, setPosition] = useState<Position>(initialPosition);
	const [isDragging, setIsDragging] = useState(false);

	const isDraggingRef = useRef(false);
	const dragOffset = useRef<Position>({ x: 0, y: 0 });
	const itemSizeRef = useRef(itemSize);
	useEffect(() => {
		itemSizeRef.current = itemSize;
	}, [itemSize.width, itemSize.height]);

	function getClientPos(e: React.MouseEvent | React.TouchEvent): Position {
		if ("touches" in e) {
			return { x: e.touches[0].clientX, y: e.touches[0].clientY };
		}
		return { x: e.clientX, y: e.clientY };
	}

	function getCursorPosition(e: React.MouseEvent | React.TouchEvent): Position {
		const el = e.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		const client = getClientPos(e);
		return {
			x: client.x - rect.left + el.scrollLeft,
			y: client.y - rect.top + el.scrollTop,
		};
	}

	function isOverItem(cursor: Position): boolean {
		return (
			cursor.x >= position.x &&
			cursor.x <= position.x + itemSizeRef.current.width &&
			cursor.y >= position.y &&
			cursor.y <= position.y + itemSizeRef.current.height
		);
	}

	function clamp(value: number, max: number): number {
		return Math.max(0, Math.min(value, max));
	}

	function startDrag(cursor: Position) {
		isDraggingRef.current = true;
		setIsDragging(true);
		dragOffset.current = {
			x: cursor.x - position.x,
			y: cursor.y - position.y,
		};
	}

	function moveDrag(cursor: Position) {
		if (!isDraggingRef.current) return;
		setPosition({
			x: clamp(
				cursor.x - dragOffset.current.x,
				containerSize.width - itemSizeRef.current.width,
			),
			y: clamp(
				cursor.y - dragOffset.current.y,
				containerSize.height - itemSizeRef.current.height,
			),
		});
	}

	function endDrag() {
		isDraggingRef.current = false;
		setIsDragging(false);
	}

	function onMouseDown(e: React.MouseEvent) {
		const cursor = getCursorPosition(e);
		if (!isOverItem(cursor)) return;
		startDrag(cursor);
	}

	function onMouseMove(e: React.MouseEvent) {
		moveDrag(getCursorPosition(e));
	}

	function onMouseUp() {
		endDrag();
	}

	function onTouchStart(e: React.TouchEvent) {
		const cursor = getCursorPosition(e);
		if (!isOverItem(cursor)) return;
		e.preventDefault(); // prevent scroll while dragging barcode
		startDrag(cursor);
	}

	function onTouchMove(e: React.TouchEvent) {
		if (!isDraggingRef.current) return;
		e.preventDefault();
		moveDrag(getCursorPosition(e));
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
