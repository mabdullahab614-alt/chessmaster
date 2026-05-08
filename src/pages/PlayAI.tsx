import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChess } from '../hooks/useChess';
import { useStockfish, type Difficulty, getDifficultyInfo } from '../hooks/useStockfish';
import { useGameTimer, type TimeControl, ALL_TIME_CONTROLS, TIME_CONTROLS } from '../hooks/useGameTimer';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { saveResult } from '../lib/gameStats';
import Board from '../components/Board';
import PlayerCard from '../components/PlayerCard';
import PromotionModal from '../components/PromotionModal';
import GameOverModal from '../components/GameOverModal';
import DifficultySelector from '../components/DifficultySelector';
import {
  ChevronLeft, RotateCcw, Flag, Play, Clock,
  FlipHorizontal2, Lightbulb, Undo2, AlertTriangle,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type GamePhase = 'setup' | 'playing' | 'ended';

const PlayAI = () => {
  const [searchParams] = useSearchParams();
  const isQuickPlay = searchParams.get('quick') === 'true';

  const [phase, setPhase] = useState<GamePhase>(isQuickPlay ? 'playing' : 'setup');
  const [difficulty, setDifficulty] = useState<Difficulty>(isQuickPlay ? 'medium' : 'medium');
  const [timeControl, setTimeControl] = useState<TimeControl>(isQuickPlay ? 'bullet' : 'rapid');
  const [showGameOver, setShowGameOver] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const statsSavedRef = useRef(false);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chess = useChess();
  const { getBestMove, getHint, isThinking } = useStockfish();
  const timer = useGameTimer(timeControl);
  const { playSound, soundEnabled, toggleSound } = useSoundEffects();

  const {
    fen, makeMove, getValidMoves, selectedSquare, setSelectedSquare,
    isGameOver, isCheck, turn, resetGame, undoMoves, canUndo, history,
    lastMove, capturedPieces, materialAdvantage, gameResult,
    isPromotionMove, pendingPromotion, setPendingPromotion, kingInCheckSquare,
  } = chess;

  // Save game result once per game
  const persistResult = useCallback((result: 'win' | 'loss' | 'draw') => {
    if (statsSavedRef.current) return;
    statsSavedRef.current = true;
    saveResult({
      opponent: `AI (${getDifficultyInfo(difficulty).name})`,
      result,
      moves: history.length,
      mode: 'vs-ai',
      timeControl,
      difficulty,
    });
  }, [difficulty, history.length, timeControl]);

  const startGame = useCallback(() => {
    statsSavedRef.current = false;
    resetGame();
    timer.resetClock(timeControl);
    setPhase('playing');
    setShowGameOver(false);
    setHintMove(null);
    playSound('start');
    timer.startClock();
  }, [resetGame, timer, timeControl, playSound]);

  // Quick play: auto-start
  useEffect(() => {
    if (isQuickPlay && phase === 'playing') {
      timer.resetClock('bullet');
      timer.startClock();
      playSound('start');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI move
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'b' || isGameOver) return;
    timer.switchClock('b');

    const doAIMove = async () => {
      const moveSan = await getBestMove(fen, difficulty);
      if (!moveSan) return;
      const result = makeMove(moveSan);
      if (result) {
        if (result.captured) playSound('capture');
        else if (result.san === 'O-O' || result.san === 'O-O-O') playSound('castle');
        else playSound('move');
        setTimeout(() => { if (chess.isCheck) playSound('check'); }, 50);
      }
    };

    const t = setTimeout(doAIMove, 250);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, isGameOver, phase]);

  // Switch white clock after AI moves
  useEffect(() => {
    if (turn === 'w' && phase === 'playing' && history.length > 0) {
      timer.switchClock('w');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase]);

  // Game over by chess rules
  useEffect(() => {
    if (isGameOver && phase === 'playing') {
      timer.stopClock();
      setPhase('ended');
      playSound('gameOver');
      const winner = chess.isCheckmate ? (turn === 'w' ? 'b' : 'w') : 'draw';
      persistResult(winner === 'w' ? 'win' : winner === 'draw' ? 'draw' : 'loss');
      setTimeout(() => setShowGameOver(true), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver, phase]);

  // Timer flag
  useEffect(() => {
    if (timer.flagged && phase === 'playing') {
      timer.stopClock();
      setPhase('ended');
      playSound('gameOver');
      persistResult(timer.flagged === 'w' ? 'loss' : 'win');
      setTimeout(() => setShowGameOver(true), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.flagged, phase]);

  const handleSquareClick = (square: string) => {
    if (isThinking || isGameOver || turn !== 'w' || phase !== 'playing') return;
    setHintMove(null);

    if (selectedSquare === square) { setSelectedSquare(null); return; }

    if (selectedSquare) {
      if (isPromotionMove(selectedSquare, square)) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      const move = getValidMoves(selectedSquare).find((m: any) => m.to === square);
      if (move) {
        const result = makeMove({ from: selectedSquare, to: square });
        if (result) {
          if (result.captured) playSound('capture');
          else if (result.san === 'O-O' || result.san === 'O-O-O') playSound('castle');
          else playSound('move');
          if (chess.isCheck) setTimeout(() => playSound('check'), 50);
        }
        setSelectedSquare(null);
      } else {
        const newMoves = getValidMoves(square);
        setSelectedSquare(newMoves.length > 0 ? square : null);
      }
    } else {
      if (getValidMoves(square).length > 0) setSelectedSquare(square);
    }
  };

  const handlePromotion = (piece: string) => {
    if (!pendingPromotion) return;
    const result = makeMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
    if (result) {
      playSound('promote');
      if (chess.isCheck) setTimeout(() => playSound('check'), 50);
    }
    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  const handleHint = async () => {
    if (isHinting || isThinking || turn !== 'w' || phase !== 'playing') return;
    setIsHinting(true);
    setHintMove(null);
    const san = await getHint(fen);
    setIsHinting(false);
    if (!san) return;
    // Resolve SAN → from/to squares
    const verbose = getValidMoves().find((m: any) => m.san === san);
    if (verbose) {
      setHintMove({ from: verbose.from, to: verbose.to });
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = setTimeout(() => setHintMove(null), 3000);
    }
  };

  const handleUndo = () => {
    if (isThinking || phase !== 'playing') return;
    // Take back 2 moves (AI + player) unless only 1 move played
    const n = history.length >= 2 ? 2 : history.length;
    if (n === 0) return;
    undoMoves(n);
    setHintMove(null);
  };

  const handleResign = () => {
    setShowResignConfirm(false);
    timer.stopClock();
    setPhase('ended');
    playSound('gameOver');
    persistResult('loss');
    setShowGameOver(true);
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    if (isQuickPlay) {
      statsSavedRef.current = false;
      resetGame();
      timer.resetClock('bullet');
      timer.startClock();
      setPhase('playing');
      playSound('start');
    } else {
      setPhase('setup');
      resetGame();
    }
  };

  const getWinner = (): 'w' | 'b' | 'draw' => {
    if (timer.flagged) return timer.flagged === 'w' ? 'b' : 'w';
    if (!isGameOver) return 'b'; // resigned
    if (chess.isCheckmate) return turn === 'w' ? 'b' : 'w';
    return 'draw';
  };

  const getResultText = () => {
    if (timer.flagged) return `${timer.flagged === 'w' ? 'You' : 'AI'} ran out of time!`;
    if (!isGameOver) return 'You resigned';
    return gameResult || 'Game Over';
  };

  // ── Setup Screen ─────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center mb-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Lobby
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-display font-black mb-2">Play vs Computer</h1>
            <p style={{ color: 'var(--text-muted)' }}>Choose your difficulty and time control</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-display font-bold mb-4 flex items-center space-x-2">
              <span>🤖</span><span>AI Difficulty</span>
            </h3>
            <DifficultySelector selected={difficulty} onSelect={setDifficulty} />
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-display font-bold mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5" /><span>Time Control</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ALL_TIME_CONTROLS.map(tc => {
                const config = TIME_CONTROLS[tc];
                const isSelected = timeControl === tc;
                return (
                  <button
                    key={tc}
                    onClick={() => setTimeControl(tc)}
                    className={`glass rounded-xl p-3 text-center transition-all ${
                      isSelected ? 'ring-1 scale-105' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)' }}
                  >
                    <div className="font-bold text-lg">{config.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{config.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.button
            onClick={startGame}
            className="btn-primary w-full text-lg flex items-center justify-center space-x-3 py-4"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            <Play className="w-6 h-6" /><span>Start Game</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Game Screen ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <Link to="/" className="flex items-center text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Lobby
        </Link>
        <div className="flex items-center space-x-2">
          <span
            className="text-xs px-3 py-1 rounded-full glass font-medium"
            style={{ color: 'var(--primary-color)' }}
          >
            {getDifficultyInfo(difficulty).name} AI
          </span>

          {/* Flip board */}
          <button
            onClick={() => setFlipped(f => !f)}
            className="p-2 glass rounded-lg transition-colors hover:bg-white/10"
            title="Flip board"
          >
            <FlipHorizontal2 className="w-4 h-4" />
          </button>

          {/* Hint */}
          <button
            onClick={handleHint}
            disabled={isHinting || isThinking || turn !== 'w' || phase !== 'playing'}
            className="p-2 glass rounded-lg transition-colors hover:bg-amber-500/10 disabled:opacity-40"
            title="Get a hint"
            style={{ color: isHinting ? '#f59e0b' : undefined }}
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo || isThinking || phase !== 'playing'}
            className="p-2 glass rounded-lg transition-colors hover:bg-white/10 disabled:opacity-40"
            title="Take back move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* New game */}
          <button
            onClick={handlePlayAgain}
            className="p-2 glass rounded-lg transition-colors hover:bg-white/10"
            title="New Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Resign */}
          {phase === 'playing' && (
            <button
              onClick={() => setShowResignConfirm(true)}
              className="p-2 glass rounded-lg transition-colors hover:bg-red-500/20 text-red-400"
              title="Resign"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col items-center space-y-3">
          {/* Top card — AI when normal, You when flipped */}
          <div className="w-full max-w-[600px]">
            <PlayerCard
              name={flipped ? 'You (White)' : `AI (${getDifficultyInfo(difficulty).name})`}
              isActive={flipped ? turn === 'w' && phase === 'playing' : turn === 'b' && phase === 'playing'}
              time={flipped ? timer.whiteTime : timer.blackTime}
              isUnlimited={timer.isUnlimited}
              capturedPieces={flipped ? capturedPieces.white : capturedPieces.black}
              capturedColor={flipped ? 'b' : 'w'}
              advantage={flipped
                ? (materialAdvantage > 0 ? materialAdvantage : undefined)
                : (materialAdvantage < 0 ? -materialAdvantage : undefined)}
            />
          </div>

          <Board
            fen={fen}
            onMove={() => {}}
            selectedSquare={selectedSquare}
            onSquareClick={handleSquareClick}
            validMoves={selectedSquare ? getValidMoves(selectedSquare) : []}
            lastMove={lastMove}
            flipped={flipped}
            kingInCheck={kingInCheckSquare}
            disabled={turn !== 'w' || phase !== 'playing' || isThinking}
            hintMove={hintMove}
          />

          {/* Bottom card — You when normal, AI when flipped */}
          <div className="w-full max-w-[600px]">
            <PlayerCard
              name={flipped ? `AI (${getDifficultyInfo(difficulty).name})` : 'You (White)'}
              isActive={flipped ? turn === 'b' && phase === 'playing' : turn === 'w' && phase === 'playing'}
              time={flipped ? timer.blackTime : timer.whiteTime}
              isUnlimited={timer.isUnlimited}
              capturedPieces={flipped ? capturedPieces.black : capturedPieces.white}
              capturedColor={flipped ? 'w' : 'b'}
              advantage={flipped
                ? (materialAdvantage < 0 ? -materialAdvantage : undefined)
                : (materialAdvantage > 0 ? materialAdvantage : undefined)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Status */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                phase === 'playing'
                  ? (isThinking ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse')
                  : 'bg-red-400'
              }`} />
              <span className="font-bold text-sm">
                {phase === 'ended'
                  ? 'Game Over'
                  : isThinking || isHinting
                  ? isHinting ? 'Finding best move…' : 'AI is thinking…'
                  : turn === 'w' ? 'Your turn' : 'Waiting…'}
              </span>
            </div>
            {isCheck && phase === 'playing' && (
              <div className="mt-2 text-xs font-bold text-red-400 animate-pulse">⚠ CHECK!</div>
            )}
            {hintMove && (
              <div className="mt-2 text-xs font-bold animate-pulse" style={{ color: '#f59e0b' }}>
                💡 Hint highlighted on board
              </div>
            )}
          </div>

          {/* Move History */}
          <div className="glass rounded-xl p-4 flex flex-col" style={{ maxHeight: '380px' }}>
            <h3 className="text-sm font-bold mb-3 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              Move History
            </h3>
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No moves yet</p>
              ) : (
                Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
                  <div key={i} className="grid grid-cols-[30px_1fr_1fr] text-sm py-1 hover:bg-white/5 rounded px-2">
                    <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{i + 1}.</span>
                    <span className="font-mono font-medium">{history[i * 2]?.san}</span>
                    <span className="font-mono font-medium" style={{ color: 'var(--text-muted)' }}>
                      {history[i * 2 + 1]?.san || ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="glass rounded-xl p-4 space-y-2">
            <button
              onClick={handleHint}
              disabled={isHinting || isThinking || turn !== 'w' || phase !== 'playing'}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 hover:bg-amber-500/10"
              style={{ color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              <Lightbulb className="w-4 h-4" />
              <span>{isHinting ? 'Finding hint…' : 'Get Hint'}</span>
            </button>
            <button
              onClick={handleUndo}
              disabled={!canUndo || isThinking || phase !== 'playing'}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 hover:bg-white/10"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <Undo2 className="w-4 h-4" />
              <span>Take Back Move</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Promotion Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <PromotionModal
            color="w"
            onSelect={handlePromotion}
            onCancel={() => { setPendingPromotion(null); setSelectedSquare(null); }}
          />
        )}
      </AnimatePresence>

      {/* Resign Confirmation */}
      <AnimatePresence>
        {showResignConfirm && (
          <div className="modal-overlay">
            <motion.div
              className="glass-strong rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">Resign Game?</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                This will count as a loss. Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResignConfirm(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResign}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Resign
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Game Over Modal */}
      {showGameOver && (
        <GameOverModal
          result={getResultText()}
          winner={getWinner()}
          playerColor="w"
          moveCount={history.length}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
};

export default PlayAI;
