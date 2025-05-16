'use client';

import { useState, useRef, useEffect } from 'react';
import type { ScanViewerProps } from './types';

export default function ScanViewer({ 
  imageUrl, 
  alt = 'Eye scan', 
  controls = false 
}: ScanViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative">
      <div 
        ref={containerRef}
        className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden"
      >
        {imageUrl ? (
          <div
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 0.2s',
            }}
            className="w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}
      </div>

      {controls && (
        <div className="absolute bottom-4 right-4 flex gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-gray-100 rounded-md"
            aria-label="Reset view"
          >
            ↺
          </button>
        </div>
      )}
    </div>
  );
}
