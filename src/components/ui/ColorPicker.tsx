import React from 'react';
import { cn } from '../../lib/utils';

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
  className?: string;
}

const DEFAULT_PALETTE = [
  '#D4AF37', // Dourado
  '#2563EB', // Azul
  '#EF4444', // Vermelho
  '#F59E0B', // Âmbar
  '#10B981', // Verde
  '#EC4899', // Rosa
  '#8B5CF6', // Roxo
  '#14B8A6', // Teal
  '#64748B', // Slate
  '#111827', // Grafite
  '#3b82f6', // Blue 500
  '#ef4444', // Red 500
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#ec4899', // Pink 500
  '#8b5cf6', // Violet 500
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect, className }) => {
  return (
    <div className={cn("grid grid-cols-8 gap-2", className)}>
      {DEFAULT_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelect(color)}
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all",
            selectedColor === color ? "border-zinc-900 scale-110" : "border-transparent hover:scale-105"
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
      <div className="col-span-8 mt-2">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => onSelect(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
          />
          <input
            type="text"
            value={selectedColor.toUpperCase()}
            onChange={(e) => onSelect(e.target.value)}
            className="flex-1 px-3 py-1 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/20"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};
