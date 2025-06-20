import { useState, useCallback, useRef, useEffect } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange?: (width: number) => void;
}

export function useResizable({ initialWidth, minWidth, maxWidth, onWidthChange }: UseResizableOptions) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);
  const containerWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Store the container width at the start of dragging
    const container = e.currentTarget.closest('.flex');
    if (container) {
      containerWidthRef.current = container.getBoundingClientRect().width;
    }

    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [width]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || containerWidthRef.current === 0) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaPercent = (deltaX / containerWidthRef.current) * 100;
    const newWidth = startWidthRef.current + deltaPercent;

    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

    if (Math.abs(clampedWidth - width) > 0.1) { // Throttle updates
      setWidth(clampedWidth);
      onWidthChange?.(clampedWidth);
    }
  }, [isDragging, minWidth, maxWidth, onWidthChange, width]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    containerWidthRef.current = 0;
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      // Add visual feedback to body
      document.body.classList.add('select-none');

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.body.classList.remove('select-none');
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const updateWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    setWidth(clampedWidth);
    onWidthChange?.(clampedWidth);
  }, [minWidth, maxWidth, onWidthChange]);

  return {
    width,
    isDragging,
    handleMouseDown,
    updateWidth
  };
}