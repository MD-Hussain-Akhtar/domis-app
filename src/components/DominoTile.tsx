import React from 'react';

interface DominoTileProps {
  top: number;
  bottom: number;
  orientation?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Renders the authentic domino pips (dots) on a half-tile
export const DominoHalf: React.FC<{ count: number; size: 'sm' | 'md' | 'lg' }> = ({ count, size }) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  
  // 3x3 grid positions
  const renderDots = () => {
    switch (count) {
      case 0:
        return null;
      case 1:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${dotSize} rounded-full bg-slate-900 shadow-inner`} />
          </div>
        );
      case 2:
        return (
          <div className="absolute inset-0 p-1 flex justify-between items-between">
            <span className={`${dotSize} rounded-full bg-slate-900`} />
            <span className={`${dotSize} rounded-full bg-slate-900 self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="absolute inset-0 p-1 flex flex-col justify-between">
            <div className="flex justify-start">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="absolute inset-0 p-1 flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="absolute inset-0 p-1 flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="absolute inset-0 p-1 flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full bg-slate-900`} />
              <span className={`${dotSize} rounded-full bg-slate-900`} />
            </div>
          </div>
        );
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-slate-800">
            {count}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {renderDots()}
    </div>
  );
};

export const DominoTile: React.FC<DominoTileProps> = ({
  top,
  bottom,
  size = 'md',
  selected = false,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-14 rounded-md',
    md: 'w-10 h-20 rounded-lg',
    lg: 'w-12 h-24 rounded-xl',
  }[size];

  const halfHeight = {
    sm: 'h-6.5',
    md: 'h-9.5',
    lg: 'h-11.5',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative ${sizeClasses} bg-gradient-to-b from-amber-50 to-amber-100/90 border-2 ${
        selected ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-amber-200/80 shadow-md'
      } flex flex-col items-center justify-between p-1 cursor-pointer transition-all active:scale-95 touch-manipulation shrink-0 ${className}`}
      aria-label={`Domino tile ${top} and ${bottom}`}
    >
      {/* Top Half */}
      <div className={`w-full ${halfHeight} relative`}>
        <DominoHalf count={top} size={size} />
      </div>

      {/* Divider Bar with Brass Center Pivot Pin */}
      <div className="w-full h-0.5 bg-slate-400/70 relative flex items-center justify-center">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 border border-amber-700 shadow-sm" />
      </div>

      {/* Bottom Half */}
      <div className={`w-full ${halfHeight} relative`}>
        <DominoHalf count={bottom} size={size} />
      </div>
    </button>
  );
};
