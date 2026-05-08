import React from 'react';
import { PIECE_SETS } from '../lib/pieces-data';
import { useTheme } from '../context/ThemeContext';

interface CapturedPiecesProps {
  pieces: string[];
  color: 'w' | 'b'; // which side these pieces belong to (the captured color)
  advantage?: number;
}

const PIECE_ORDER = ['q', 'r', 'b', 'n', 'p'];

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, color, advantage }) => {
  const { theme } = useTheme();

  // Group and sort pieces
  const grouped = PIECE_ORDER.map(type => ({
    type,
    count: pieces.filter(p => p === type).length,
  })).filter(g => g.count > 0);

  return (
    <div className="flex items-center space-x-1 min-h-[28px]">
      {grouped.map(({ type, count }) => (
        <div key={type} className="flex items-center">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="w-5 h-5 -mr-1 opacity-70"
              dangerouslySetInnerHTML={{
                __html: PIECE_SETS[theme]?.[color + type.toUpperCase()] || ''
              }}
            />
          ))}
        </div>
      ))}
      {advantage !== undefined && advantage !== 0 && (
        <span
          className="text-xs font-bold ml-2 px-1.5 py-0.5 rounded"
          style={{
            color: 'var(--primary-color)',
            background: 'var(--bg-card)',
          }}
        >
          +{Math.abs(advantage)}
        </span>
      )}
    </div>
  );
};

export default CapturedPieces;
