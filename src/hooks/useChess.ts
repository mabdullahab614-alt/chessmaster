import { useState, useCallback, useMemo, useRef } from 'react';
import { Chess } from 'chess.js';

export interface CapturedPieces {
  white: string[];
  black: string[];
}

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9,
};

export const useChess = (initialFen?: string) => {
  // Track move history as SAN strings so we can replay and preserve history
  const historyRef = useRef<string[]>([]);
  const [gameVersion, setGameVersion] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: string; to: string } | null>(null);

  // Always reconstruct game from history — this guarantees history() works correctly
  const game = useMemo(() => {
    const g = new Chess(initialFen);
    for (const san of historyRef.current) {
      try { g.move(san); } catch {}
    }
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameVersion, initialFen]);

  const fen = game.fen();
  const turn = game.turn();
  const isGameOver = game.isGameOver();
  const isCheck = game.isCheck();
  const isCheckmate = game.isCheckmate();
  const isDraw = game.isDraw();
  const isStalemate = game.isStalemate();
  const isThreefoldRepetition = game.isThreefoldRepetition();
  const isInsufficientMaterial = game.isInsufficientMaterial();

  // history is always valid because game is replayed from historyRef
  const history = useMemo(() => game.history({ verbose: true }), [gameVersion]);
  const lastMove = history.length > 0 ? history[history.length - 1] : null;
  const canUndo = historyRef.current.length > 0;

  const capturedPieces = useMemo((): CapturedPieces => {
    const captured: CapturedPieces = { white: [], black: [] };
    for (const move of history) {
      if (move.captured) {
        if (move.color === 'w') {
          captured.white.push(move.captured);
        } else {
          captured.black.push(move.captured);
        }
      }
    }
    const sortByValue = (a: string, b: string) => (PIECE_VALUES[b] ?? 0) - (PIECE_VALUES[a] ?? 0);
    captured.white.sort(sortByValue);
    captured.black.sort(sortByValue);
    return captured;
  }, [gameVersion]);

  const materialAdvantage = useMemo(() => {
    let w = 0, b = 0;
    for (const p of capturedPieces.white) w += PIECE_VALUES[p] ?? 0;
    for (const p of capturedPieces.black) b += PIECE_VALUES[p] ?? 0;
    return w - b;
  }, [capturedPieces]);

  const gameResult = useMemo(() => {
    if (!isGameOver) return null;
    if (isCheckmate) return turn === 'w' ? 'Black wins by checkmate!' : 'White wins by checkmate!';
    if (isStalemate) return 'Draw by stalemate';
    if (isThreefoldRepetition) return 'Draw by threefold repetition';
    if (isInsufficientMaterial) return 'Draw by insufficient material';
    if (isDraw) return 'Draw';
    return 'Game Over';
  }, [isGameOver, isCheckmate, isDraw, isStalemate, isThreefoldRepetition, isInsufficientMaterial, turn]);

  const isPromotionMove = useCallback((from: string, to: string) => {
    const moves = game.moves({ square: from as any, verbose: true });
    return moves.some((m: any) => m.to === to && m.promotion);
  }, [game]);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(move);
      if (result) {
        historyRef.current = [...historyRef.current, result.san];
        setGameVersion((v: number) => v + 1);
        return result;
      }
    } catch {}
    return null;
  }, [game]);

  const getValidMoves = useCallback((square?: string) => {
    return game.moves({ ...(square ? { square: square as any } : {}), verbose: true });
  }, [game]);

  const resetGame = useCallback(() => {
    historyRef.current = [];
    setGameVersion((v: number) => v + 1);
    setSelectedSquare(null);
    setPendingPromotion(null);
  }, []);

  // Undo n moves at once (avoids double re-render)
  const undoMoves = useCallback((n = 1) => {
    const len = historyRef.current.length;
    if (len === 0) return;
    historyRef.current = historyRef.current.slice(0, Math.max(0, len - n));
    setGameVersion((v: number) => v + 1);
    setSelectedSquare(null);
    setPendingPromotion(null);
  }, []);

  const undoMove = useCallback(() => undoMoves(1), [undoMoves]);

  const kingInCheckSquare = useMemo(() => {
    if (!isCheck) return null;
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          return String.fromCharCode(97 + c) + (8 - r);
        }
      }
    }
    return null;
  }, [isCheck, gameVersion, turn]);

  return {
    game,
    fen,
    turn,
    isGameOver,
    isCheck,
    isCheckmate,
    isDraw,
    isStalemate,
    history,
    makeMove,
    getValidMoves,
    resetGame,
    undoMove,
    undoMoves,
    canUndo,
    selectedSquare,
    setSelectedSquare,
    lastMove,
    capturedPieces,
    materialAdvantage,
    gameResult,
    isPromotionMove,
    pendingPromotion,
    setPendingPromotion,
    kingInCheckSquare,
  };
};
