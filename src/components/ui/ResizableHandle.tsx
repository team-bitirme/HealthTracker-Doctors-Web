'use client';

import React from 'react';

interface ResizableHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}

export function ResizableHandle({ onMouseDown, isDragging }: ResizableHandleProps) {
  return (
    <div
      className={`relative w-1 bg-gray-200 hover:bg-blue-400 transition-all duration-150 cursor-col-resize group flex-shrink-0 ${
        isDragging ? 'bg-blue-500 shadow-lg' : ''
      }`}
      onMouseDown={onMouseDown}
    >
      {/* Main handle bar */}
      <div className="absolute inset-0 bg-current" />

      {/* Expanded hover area for easier targeting */}
      <div className="absolute inset-y-0 -left-2 -right-2 hover:bg-transparent" />

      {/* Grip indicator - shows on hover or drag */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${
        isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="flex flex-col space-y-0.5">
          <div className="w-0.5 h-0.5 bg-white rounded-full shadow-sm"></div>
          <div className="w-0.5 h-0.5 bg-white rounded-full shadow-sm"></div>
          <div className="w-0.5 h-0.5 bg-white rounded-full shadow-sm"></div>
          <div className="w-0.5 h-0.5 bg-white rounded-full shadow-sm"></div>
          <div className="w-0.5 h-0.5 bg-white rounded-full shadow-sm"></div>
        </div>
      </div>

      {/* Dragging state overlay */}
      {isDragging && (
        <div className="absolute inset-y-0 -left-1 -right-1 bg-blue-500 opacity-20 pointer-events-none" />
      )}
    </div>
  );
}