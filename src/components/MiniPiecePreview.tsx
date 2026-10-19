import React from 'react';
import { TetrominoType, ThemeConfig } from '../types/tetris';
import { TETROMINOES } from '../utils/tetris';

interface MiniPiecePreviewProps {
  type: TetrominoType | null;
  theme: ThemeConfig;
  size?: number; // cellSize
  disabled?: boolean;
}

export const MiniPiecePreview: React.FC<MiniPiecePreviewProps> = ({
  type,
  theme,
  size = 20,
  disabled = false,
}) => {
  if (!type) {
    return (
      <div
        className="flex items-center justify-center text-slate-300 text-xs font-medium"
        style={{ width: size * 4, height: size * 3 }}
      >
        비어있음
      </div>
    );
  }

  const matrix = TETROMINOES[type];
  const colors = theme.colors[type];
  const rows = matrix.length;
  const cols = matrix[0].length;

  return (
    <div
      className={`flex flex-col items-center justify-center transition-opacity ${
        disabled ? 'opacity-40 grayscale-[30%]' : 'opacity-100'
      }`}
      style={{ width: size * 4, height: size * (rows <= 2 ? 2.5 : 3.2) }}
    >
      {matrix.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => {
            if (cell === 0) {
              return (
                <div
                  key={c}
                  style={{ width: size, height: size }}
                  className="invisible"
                />
              );
            }

            return (
              <div
                key={c}
                style={{
                  width: size - 2,
                  height: size - 2,
                  margin: 1,
                  backgroundColor: colors.primary,
                  boxShadow: `0 2px 0 ${colors.shadow}`,
                  borderRadius: Math.floor(size * 0.28),
                }}
                className="relative overflow-hidden flex items-center justify-center"
              >
                {/* Shiny highlight */}
                <div
                  className="absolute top-0.5 left-1 w-2.5 h-1 rounded-full bg-white/60 pointer-events-none"
                />
                {/* Cute eyes for center block */}
                {((type === 'O' && r === 0 && c === 0) ||
                  (type === 'I' && r === 1 && c === 1) ||
                  (type === 'T' && r === 1 && c === 1) ||
                  (type === 'S' && r === 1 && c === 1) ||
                  (type === 'Z' && r === 1 && c === 1) ||
                  (type === 'J' && r === 1 && c === 1) ||
                  (type === 'L' && r === 1 && c === 1)) && (
                  <div className="flex items-center gap-1 z-10">
                    <span className="w-1 h-1 rounded-full bg-slate-900/80 inline-block" />
                    <span className="w-1 h-1 rounded-full bg-slate-900/80 inline-block" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
