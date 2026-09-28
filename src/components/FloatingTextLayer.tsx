import React from 'react';
import { FloatingTextItem } from '../types/game';

interface FloatingTextLayerProps {
  items: FloatingTextItem[];
}

export const FloatingTextLayer: React.FC<FloatingTextLayerProps> = ({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {items.map(item => (
        <div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 font-game font-extrabold tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-all animate-out duration-700 ease-out"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            color: item.color || '#fef08a',
            fontSize: item.fontSize || '1.5rem',
            animation: 'floatUp 0.8s ease-out forwards',
          }}
        >
          {item.text}
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, -20%) scale(0.6);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.15);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -100%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -140%) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};
