import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Frown, Handshake, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  result: string;
  winner: 'w' | 'b' | 'draw' | null;
  playerColor?: 'w' | 'b';
  moveCount: number;
  onPlayAgain: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ result, winner, playerColor = 'w', moveCount, onPlayAgain }) => {
  const isWin = winner === playerColor;
  const isDraw = winner === 'draw' || winner === null;

  useEffect(() => {
    if (isWin) {
      // Fire confetti!
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#3b82f6', '#00f2ff', '#fbbf24', '#ec4899'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#3b82f6', '#00f2ff', '#fbbf24', '#ec4899'],
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isWin]);

  const getIcon = () => {
    if (isWin) return <Trophy className="w-16 h-16" style={{ color: '#fbbf24' }} />;
    if (isDraw) return <Handshake className="w-16 h-16" style={{ color: 'var(--secondary-color)' }} />;
    return <Frown className="w-16 h-16" style={{ color: '#ef4444' }} />;
  };

  const getTitle = () => {
    if (isWin) return 'Victory!';
    if (isDraw) return 'Draw!';
    return 'Defeat';
  };

  const getBgGradient = () => {
    if (isWin) return 'from-yellow-500/10 to-transparent';
    if (isDraw) return 'from-blue-500/10 to-transparent';
    return 'from-red-500/10 to-transparent';
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className={`modal-content glass-strong rounded-3xl p-10 max-w-md w-full mx-4 text-center bg-gradient-to-b ${getBgGradient()}`}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
          className="flex justify-center mb-6"
        >
          {getIcon()}
        </motion.div>

        <motion.h2
          className="text-4xl font-display font-black mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getTitle()}
        </motion.h2>

        <motion.p
          className="text-lg mb-6"
          style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {result}
        </motion.p>

        <motion.div
          className="glass rounded-xl p-4 mb-8 flex justify-center space-x-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{moveCount}</div>
            <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Moves</div>
          </div>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={onPlayAgain}
            className="btn-primary flex items-center justify-center space-x-2 flex-1"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>
          <Link
            to="/"
            className="btn-ghost flex items-center justify-center space-x-2 flex-1"
          >
            <Home className="w-5 h-5" />
            <span>Lobby</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameOverModal;
