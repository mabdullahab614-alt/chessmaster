import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChess } from '../hooks/useChess';
import { useGameTimer, type TimeControl, ALL_TIME_CONTROLS, TIME_CONTROLS } from '../hooks/useGameTimer';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { saveResult } from '../lib/gameStats';
import Board from '../components/Board';
import PlayerCard from '../components/PlayerCard';
import PromotionModal from '../components/PromotionModal';
import GameOverModal from '../components/GameOverModal';
import {
  ChevronLeft, RotateCcw, Flag, Play, Clock,
  RefreshCw, Undo2, AlertTriangle, Handshake,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type GamePhase = 'setup' | 'playing' | 'ended';

const PlayLocal = () => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [timeControl, setTimeControl] = useState<TimeControl>('rapid');
  const [showGameOver, setShowGameOver] = useState(false);
  const [autoFlip, setAutoFlip] = useState(true);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [resignConfirm, setResignConfirm] = useState<'w' | 'b' | null>(null);
  const [resignedPlayer, setResignedPlayer] = useState<'w' | 'b' | null>(null);
  const [drawOffer, setDrawOffer] = useState<'w' | 'b' | null>(null);
  const statsSavedRef = useRef(false);

  const chess = useChess();
  const timer = useGameTimer(timeControl);
  const { playSound } = useSoundEffects();

  const {
    fen, makeMove, getValidMoves, selectedSquare, setSelectedSquare,
    isGameOver, isCheck, turn, resetGame, undoMoves, canUndo, history,
    lastMove, capturedPieces, materialAdvantage, gameResult,
    isPromotionMove, pendingPromotion, setPendingPromotion, kingInCheckSquare,
  } = chess;

  const persistResult = useCallback((winner: 'w' | 'b' | 'draw') => {
    if (statsSavedRef.current) return;
    statsSavedRef.current = true;
    // Save from white's perspective
    const result = winner === 'draw' ? 'draw' : winner === 'w' ? 'win' : 'loss';
    saveResult({
      opponent: player2Name,
      result,
      moves: history.length,
      mode: 'local',
      timeControl,
    });
  }, [player1Name, player2Name, history.length, timeControl]);

  const startGame = useCallback(() => {
    statsSavedRef.current = false;
    resetGame();
    timer.resetClock(timeControl);
    setPhase('playing');
    setShowGameOver(false);
    setDrawOffer(null);
    playSound('start');
    timer.startClock();
  }, [resetGame, timer, timeControl, playSound]);

  // Switch clock on turn change
  useEffect(() => {
    if (phase === 'playing' && history.length > 0) {
      timer.switchClock(turn);
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
      persistResult(winner);
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
      persistResult(timer.flagged === 'w' ? 'b' : 'w');
      setTimeout(() => setShowGameOver(true), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.flagged, phase]);

  const handleSquareClick = (square: string) => {
    if (isGameOver || phase !== 'playing') return;
    setDrawOffer(null);

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

  const handleResignConfirm = () => {
    const loser = resignConfirm!;
    setResignedPlayer(loser);
    setResignConfirm(null);
    timer.stopClock();
    setPhase('ended');
    playSound('gameOver');
    persistResult(loser === 'w' ? 'b' : 'w');
    setShowGameOver(true);
  };

  const handleDrawAccepted = () => {
    setDrawOffer(null);
    timer.stopClock();
    setPhase('ended');
    playSound('gameOver');
    persistResult('draw');
    setTimeout(() => setShowGameOver(true), 300);
  };

  const handleUndo = () => {
    if (phase !== 'playing' || !canUndo) return;
    undoMoves(1);
  };

  const handlePlayAgain = () => {
    setShowGameOver(false);
    setPhase('setup');
    resetGame();
  };

  const getWinner = (): 'w' | 'b' | 'draw' => {
    if (timer.flagged) return timer.flagged === 'w' ? 'b' : 'w';
    if (chess.isCheckmate) return turn === 'w' ? 'b' : 'w';
    return 'draw';
  };

  const getResultText = () => {
    if (timer.flagged) {
      const loserName = timer.flagged === 'w' ? player1Name : player2Name;
      return `${loserName} ran out of time!`;
    }
    if (!isGameOver) {
      const loserName = resignedPlayer === 'w' ? player1Name : player2Name;
      return `${loserName} resigned`;
    }
    return gameResult || 'Game Over';
  };

  const currentPlayerName = turn === 'w' ? player1Name : player2Name;

  // ── Setup Screen ─────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center mb-8 transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Lobby
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-display font-black mb-2">Local Match</h1>
            <p style={{ color: 'var(--text-muted)' }}>Pass-and-play with a friend</p>
          </div>

          {/* Player names */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-display font-bold mb-4">👥 Player Names</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>White ♔</label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={e => setPlayer1Name(e.target.value || 'Player 1')}
                  className="w-full glass rounded-lg px-4 py-2 text-sm font-medium outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  placeholder="Player 1"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Black ♚</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={e => setPlayer2Name(e.target.value || 'Player 2')}
                  className="w-full glass rounded-lg px-4 py-2 text-sm font-medium outline-none"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}
                  placeholder="Player 2"
                />
              </div>
            </div>
          </div>

          {/* Time control */}
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

          {/* Auto-flip */}
          <div className="glass rounded-2xl p-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h3 className="text-lg font-display font-bold flex items-center space-x-2">
                  <RefreshCw className="w-5 h-5" /><span>Auto-Flip Board</span>
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Rotate board after each move</p>
              </div>
              <div
                className="w-12 h-7 rounded-full transition-colors relative cursor-pointer"
                style={{ background: autoFlip ? 'var(--primary-color)' : 'var(--bg-card)' }}
                onClick={() => setAutoFlip(f => !f)}
              >
                <div
                  className="w-5 h-5 bg-white rounded-full absolute top-1 transition-transform"
                  style={{ transform: autoFlip ? 'translateX(24px)' : 'translateX(4px)' }}
                />
              </div>
            </label>
          </div>

          <motion.button
            onClick={startGame}
            className="btn-primary w-full text-lg flex items-center justify-center space-x-3 py-4"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            <Play className="w-6 h-6" /><span>Start Match</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Game Screen ───────────────────────────────────────────────────────────
  const isFlipped = autoFlip && turn === 'b';
  const topName    = isFlipped ? player1Name : player2Name;
  const bottomName = isFlipped ? player2Name : player1Name;
  const topColor   = isFlipped ? 'w' : 'b';
  const bottomColor: 'w' | 'b' = isFlipped ? 'b' : 'w';

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <Link to="/" className="flex items-center text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Lobby
        </Link>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full glass font-medium" style={{ color: 'var(--primary-color)' }}>
            Local Match
          </span>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo || phase !== 'playing'}
            className="p-2 glass rounded-lg transition-colors hover:bg-white/10 disabled:opacity-40"
            title="Undo last move"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* New game */}
          <button onClick={handlePlayAgain} className="p-2 glass rounded-lg transition-colors hover:bg-white/10" title="New Game">
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Draw offer */}
          {phase === 'playing' && (
            <button
              onClick={() => setDrawOffer(turn)}
              className="p-2 glass rounded-lg transition-colors hover:bg-blue-500/20"
              title="Offer draw"
              style={{ color: 'var(--accent-color)' }}
            >
              <Handshake className="w-4 h-4" />
            </button>
          )}

          {/* Resign */}
          {phase === 'playing' && (
            <button
              onClick={() => setResignConfirm(turn)}
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
          {/* Top player */}
          <div className="w-full max-w-[600px]">
            <PlayerCard
              name={topName}
              isActive={topColor === turn && phase === 'playing'}
              time={topColor === 'w' ? timer.whiteTime : timer.blackTime}
              isUnlimited={timer.isUnlimited}
              capturedPieces={topColor === 'w' ? capturedPieces.white : capturedPieces.black}
              capturedColor={topColor === 'w' ? 'b' : 'w'}
              advantage={topColor === 'w'
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
            flipped={isFlipped}
            kingInCheck={kingInCheckSquare}
            disabled={phase !== 'playing'}
          />

          {/* Bottom player */}
          <div className="w-full max-w-[600px]">
            <PlayerCard
              name={bottomName}
              isActive={bottomColor === turn && phase === 'playing'}
              time={bottomColor === 'w' ? timer.whiteTime : timer.blackTime}
              isUnlimited={timer.isUnlimited}
              capturedPieces={bottomColor === 'w' ? capturedPieces.white : capturedPieces.black}
              capturedColor={bottomColor === 'w' ? 'b' : 'w'}
              advantage={bottomColor === 'w'
                ? (materialAdvantage > 0 ? materialAdvantage : undefined)
                : (materialAdvantage < 0 ? -materialAdvantage : undefined)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Status */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${phase === 'playing' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="font-bold text-sm">
                {phase === 'ended'
                  ? 'Game Over'
                  : `${currentPlayerName}'s turn (${turn === 'w' ? 'White' : 'Black'})`}
              </span>
            </div>
            {isCheck && phase === 'playing' && (
              <div className="mt-2 text-xs font-bold text-red-400 animate-pulse">⚠ CHECK!</div>
            )}
          </div>

          {/* Draw offer notification */}
          {drawOffer && drawOffer !== turn && phase === 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 border border-blue-400/30"
            >
              <p className="text-sm font-bold mb-3" style={{ color: 'var(--accent-color)' }}>
                {drawOffer === 'w' ? player1Name : player2Name} offers a draw
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDrawAccepted}
                  className="flex-1 py-2 rounded-lg text-sm font-bold text-white"
                  style={{ background: 'var(--accent-color)' }}
                >
                  Accept
                </button>
                <button
                  onClick={() => setDrawOffer(null)}
                  className="flex-1 py-2 rounded-lg text-sm font-bold border"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  Decline
                </button>
              </div>
            </motion.div>
          )}

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

          {/* In-game actions */}
          {phase === 'playing' && (
            <div className="glass rounded-xl p-4 space-y-2">
              <button
                onClick={() => setDrawOffer(turn)}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all hover:bg-blue-500/10"
                style={{ color: 'var(--accent-color)', border: '1px solid rgba(0,242,255,0.2)' }}
              >
                <Handshake className="w-4 h-4" /><span>Offer Draw</span>
              </button>
              <button
                onClick={() => setResignConfirm(turn)}
                className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all hover:bg-red-500/10 text-red-400"
                style={{ border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <Flag className="w-4 h-4" />
                <span>{turn === 'w' ? player1Name : player2Name} Resign</span>
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Promotion Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <PromotionModal
            color={turn}
            onSelect={handlePromotion}
            onCancel={() => { setPendingPromotion(null); setSelectedSquare(null); }}
          />
        )}
      </AnimatePresence>

      {/* Resign Confirmation */}
      <AnimatePresence>
        {resignConfirm && (
          <div className="modal-overlay">
            <motion.div
              className="glass-strong rounded-2xl p-8 max-w-sm w-full mx-4 text-center"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            >
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">
                {resignConfirm === 'w' ? player1Name : player2Name} Resigns?
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                {resignConfirm === 'w' ? player2Name : player1Name} wins the match.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setResignConfirm(null)} className="btn-ghost flex-1">Cancel</button>
                <button
                  onClick={handleResignConfirm}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Confirm
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

export default PlayLocal;
