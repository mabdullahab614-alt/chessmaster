import { Chess } from 'chess.js';

const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Piece-square tables from white's perspective (row 0 = rank 8, row 7 = rank 1)
const PST: Record<string, number[][]> = {
  p: [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [50,  50,  50,  50,  50,  50,  50,  50],
    [10,  10,  20,  30,  30,  20,  10,  10],
    [5,   5,   10,  25,  25,  10,  5,   5],
    [0,   0,   0,   20,  20,  0,   0,   0],
    [5,   -5,  -10, 0,   0,   -10, -5,  5],
    [5,   10,  10,  -20, -20, 10,  10,  5],
    [0,   0,   0,   0,   0,   0,   0,   0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0,   0,   0,   0,   -20, -40],
    [-30, 0,   10,  15,  15,  10,  0,   -30],
    [-30, 5,   15,  20,  20,  15,  5,   -30],
    [-30, 0,   15,  20,  20,  15,  0,   -30],
    [-30, 5,   10,  15,  15,  10,  5,   -30],
    [-40, -20, 0,   5,   5,   0,   -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0,   0,   0,   0,   0,   0,   -10],
    [-10, 0,   5,   10,  10,  5,   0,   -10],
    [-10, 5,   5,   10,  10,  5,   5,   -10],
    [-10, 0,   10,  10,  10,  10,  0,   -10],
    [-10, 10,  10,  10,  10,  10,  10,  -10],
    [-10, 5,   0,   0,   0,   0,   5,   -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0,   0,   0,   0,   0,   0,   0,   0],
    [5,   10,  10,  10,  10,  10,  10,  5],
    [-5,  0,   0,   0,   0,   0,   0,   -5],
    [-5,  0,   0,   0,   0,   0,   0,   -5],
    [-5,  0,   0,   0,   0,   0,   0,   -5],
    [-5,  0,   0,   0,   0,   0,   0,   -5],
    [-5,  0,   0,   0,   0,   0,   0,   -5],
    [0,   0,   0,   5,   5,   0,   0,   0],
  ],
  q: [
    [-20, -10, -10, -5,  -5,  -10, -10, -20],
    [-10, 0,   0,   0,   0,   0,   0,   -10],
    [-10, 0,   5,   5,   5,   5,   0,   -10],
    [-5,  0,   5,   5,   5,   5,   0,   -5],
    [0,   0,   5,   5,   5,   5,   0,   -5],
    [-10, 5,   5,   5,   5,   5,   0,   -10],
    [-10, 0,   5,   0,   0,   0,   0,   -10],
    [-20, -10, -10, -5,  -5,  -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20,  20,  0,   0,   0,   0,   20,  20],
    [20,  30,  10,  0,   0,   10,  30,  20],
  ],
};

function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === 'w' ? -99999 : 99999;
  if (game.isDraw()) return 0;

  let score = 0;
  const board = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] ?? 0;
      const pstRow = piece.color === 'w' ? r : 7 - r;
      const pst = PST[piece.type]?.[pstRow]?.[c] ?? 0;
      score += piece.color === 'w' ? value + pst : -(value + pst);
    }
  }
  // Small mobility bonus
  const mobility = game.moves().length;
  score += game.turn() === 'w' ? mobility : -mobility;
  return score;
}

function scoreMoveForOrdering(m: any): number {
  if (m.san.includes('#')) return 100000;
  if (m.captured) return (PIECE_VALUES[m.captured] ?? 0) * 10 - (PIECE_VALUES[m.piece] ?? 0);
  if (m.san.includes('+')) return 50;
  if (m.san === 'O-O' || m.san === 'O-O-O') return 30;
  return 0;
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0 || game.isGameOver()) return evaluateBoard(game);

  const moves = (game.moves({ verbose: true }) as any[]).sort(
    (a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a),
  );

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      game.move(move);
      const val = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      game.move(move);
      const val = minimax(game, depth - 1, alpha, beta, true);
      game.undo();
      if (val < best) best = val;
      if (val < beta) beta = val;
      if (beta <= alpha) break;
    }
    return best;
  }
}

const DIFFICULTY_DEPTH: Record<string, number> = {
  beginner: 1,
  easy: 2,
  medium: 3,
  hard: 4,
  master: 5,
};

self.onmessage = (e: MessageEvent) => {
  const { fen, difficulty } = e.data as { fen: string; difficulty: string };

  const game = new Chess(fen);
  const allMoves = game.moves({ verbose: true }) as any[];

  if (allMoves.length === 0) {
    self.postMessage({ bestMove: null });
    return;
  }

  if (difficulty === 'beginner') {
    const checks = allMoves.filter((m: any) => m.san.includes('#') || m.san.includes('+'));
    const captures = allMoves.filter((m: any) => m.captured);
    const pool = checks.length && Math.random() > 0.4
      ? checks
      : captures.length && Math.random() > 0.5
        ? captures
        : allMoves;
    self.postMessage({ bestMove: pool[Math.floor(Math.random() * pool.length)].san });
    return;
  }

  if (difficulty === 'easy') {
    const scored = allMoves.map((m: any) => ({
      move: m,
      score: scoreMoveForOrdering(m) + Math.random() * 60,
    }));
    scored.sort((a: any, b: any) => b.score - a.score);
    const top = scored.slice(0, 5);
    self.postMessage({ bestMove: top[Math.floor(Math.random() * top.length)].move.san });
    return;
  }

  const depth = DIFFICULTY_DEPTH[difficulty] ?? 3;
  const isMax = game.turn() === 'w';
  const randomNoise = difficulty === 'medium' ? 15 : difficulty === 'hard' ? 5 : 0;

  const orderedMoves = [...allMoves].sort(
    (a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a),
  );

  let bestMove = orderedMoves[0];
  let bestScore = isMax ? -Infinity : Infinity;

  for (const move of orderedMoves) {
    game.move(move);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !isMax)
      + (Math.random() * randomNoise);
    game.undo();

    if (isMax ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  self.postMessage({ bestMove: bestMove?.san ?? null });
};
