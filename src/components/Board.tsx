import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PIECE_SETS } from '../lib/pieces-data';
import { useTheme } from '../context/ThemeContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BoardProps {
  fen: string;
  onMove: (from: string, to: string) => void;
  selectedSquare: string | null;
  onSquareClick: (square: string) => void;
  validMoves: any[];
  lastMove: any;
  flipped?: boolean;
  kingInCheck?: string | null;
  disabled?: boolean;
  hintMove?: { from: string; to: string } | null;
}

const Board: React.FC<BoardProps> = ({
  fen,
  onMove,
  selectedSquare,
  onSquareClick,
  validMoves,
  lastMove,
  flipped = false,
  kingInCheck = null,
  disabled = false,
  hintMove = null,
}) => {
  const { theme } = useTheme();
  const [dragFrom, setDragFrom] = useState<string | null>(null);

  const board = useMemo(() => {
    const rows = fen.split(' ')[0].split('/');
    return rows.map(row => {
      const squares: (string | null)[] = [];
      for (const char of row) {
        if (isNaN(parseInt(char))) {
          squares.push(char);
        } else {
          for (let i = 0; i < parseInt(char); i++) squares.push(null);
        }
      }
      return squares;
    });
  }, [fen]);

  const getSquareName = useCallback((row: number, col: number) => {
    const r = flipped ? row : 7 - row;
    const c = flipped ? 7 - col : col;
    return String.fromCharCode(97 + c) + (r + 1);
  }, [flipped]);

  const getDisplayRow = useCallback((row: number) => flipped ? row : 7 - row, [flipped]);
  const getDisplayCol = useCallback((col: number) => flipped ? 7 - col : col, [flipped]);

  const getPieceAt = useCallback((row: number, col: number) => {
    const r = flipped ? 7 - row : row;
    const c = flipped ? 7 - col : col;
    return board[r]?.[c] || null;
  }, [board, flipped]);

  const handleDragStart = useCallback((square: string) => {
    if (disabled) return;
    setDragFrom(square);
    onSquareClick(square);
  }, [disabled, onSquareClick]);

  const handleDragEnd = useCallback(() => { setDragFrom(null); }, []);

  const handleDrop = useCallback((targetSquare: string) => {
    if (dragFrom && dragFrom !== targetSquare) {
      onSquareClick(targetSquare);
    }
    setDragFrom(null);
  }, [dragFrom, onSquareClick]);

  return (
    <div
      className={`relative aspect-square w-full max-w-[600px] board-container rounded-xl shadow-2xl overflow-hidden chess-board ${
        theme === 'neon' ? 'animate-pulse-glow' : ''
      }`}
      style={{ border: '6px solid var(--board-dark)' }}
    >
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {Array.from({ length: 8 }).map((_, row) =>
          Array.from({ length: 8 }).map((_, col) => {
            const squareName = getSquareName(row, col);
            const piece = getPieceAt(row, col);
            const displayRow = getDisplayRow(row);
            const displayCol = getDisplayCol(col);
            const isLight = (displayRow + displayCol) % 2 === 1;
            const isSelected = selectedSquare === squareName;
            const validMove = validMoves.find((m: any) => m.to === squareName);
            const isLastMove = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
            const isKingInCheck = kingInCheck === squareName;
            const isHintFrom = hintMove?.from === squareName;
            const isHintTo = hintMove?.to === squareName;

            let bgColor: string;
            if (isSelected) {
              bgColor = 'color-mix(in srgb, var(--primary-color) 45%, transparent)';
            } else if (isKingInCheck) {
              bgColor = 'rgba(239, 68, 68, 0.45)';
            } else if (isHintFrom || isHintTo) {
              bgColor = 'color-mix(in srgb, #f59e0b 35%, transparent)';
            } else if (isLastMove) {
              bgColor = 'color-mix(in srgb, var(--accent-color) 22%, transparent)';
            } else {
              bgColor = isLight ? 'var(--board-light)' : 'var(--board-dark)';
            }

            return (
              <div
                key={`${row}-${col}`}
                onClick={() => !disabled && onSquareClick(squareName)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(squareName)}
                className={cn(
                  'relative flex items-center justify-center transition-colors duration-150',
                  disabled && 'cursor-default',
                  !disabled && 'cursor-pointer',
                )}
                style={{ backgroundColor: bgColor }}
              >
                {/* Rank labels */}
                {col === 0 && (
                  <span
                    className="absolute left-1 top-0.5 text-[10px] font-bold select-none"
                    style={{ color: isLight ? 'var(--board-dark)' : 'var(--board-light)', opacity: 0.45 }}
                  >
                    {flipped ? displayRow + 1 : 8 - row}
                  </span>
                )}
                {/* File labels */}
                {row === 7 && (
                  <span
                    className="absolute right-1 bottom-0 text-[10px] font-bold select-none"
                    style={{ color: isLight ? 'var(--board-dark)' : 'var(--board-light)', opacity: 0.45 }}
                  >
                    {String.fromCharCode(97 + (flipped ? 7 - col : col))}
                  </span>
                )}

                {/* King in check pulse */}
                {isKingInCheck && (
                  <div className="absolute inset-0 animate-check-pulse rounded-sm" />
                )}

                {/* Hint ring on to-square */}
                {isHintTo && !piece && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[40%] h-[40%] rounded-full border-4 border-amber-400 opacity-70 animate-pulse" />
                  </div>
                )}

                {/* Move hints */}
                {validMove && (
                  <div
                    className={cn(
                      'absolute z-20 rounded-full transition-transform',
                      validMove.captured
                        ? 'w-4/5 h-4/5 border-[3px] opacity-40 hover:opacity-70'
                        : 'w-[28%] h-[28%] opacity-30 hover:opacity-60 hover:scale-125',
                    )}
                    style={{
                      borderColor: validMove.captured ? 'var(--primary-color)' : undefined,
                      backgroundColor: validMove.captured ? undefined : 'var(--primary-color)',
                    }}
                  />
                )}

                {/* Piece */}
                <AnimatePresence mode="popLayout">
                  {piece && (
                    <motion.div
                      key={`${squareName}-${piece}`}
                      draggable={!disabled}
                      onDragStart={() => handleDragStart(squareName)}
                      onDragEnd={handleDragEnd}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
                      className={cn(
                        'w-[80%] h-[80%] z-10 drop-shadow-lg select-none',
                        !disabled && 'cursor-grab active:cursor-grabbing',
                        isKingInCheck && 'animate-shake',
                        theme === 'neon' && 'drop-shadow-[0_0_8px_var(--primary-color)]',
                        (isHintFrom) && 'drop-shadow-[0_0_10px_#f59e0b]',
                      )}
                      dangerouslySetInnerHTML={{
                        __html: PIECE_SETS[theme]?.[
                          (piece === piece.toUpperCase() ? 'w' : 'b') + piece.toUpperCase()
                        ] || '',
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;
