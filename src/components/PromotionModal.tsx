import React from 'react';
import { motion } from 'framer-motion';
import { PIECE_SETS } from '../lib/pieces-data';
import { useTheme } from '../context/ThemeContext';

interface PromotionModalProps {
  color: 'w' | 'b';
  onSelect: (piece: string) => void;
  onCancel: () => void;
}

const PROMOTION_PIECES = [
  { type: 'q', name: 'Queen' },
  { type: 'r', name: 'Rook' },
  { type: 'b', name: 'Bishop' },
  { type: 'n', name: 'Knight' },
];

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect, onCancel }) => {
  const { theme } = useTheme();

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <motion.div
        className="modal-content glass-strong rounded-2xl p-8 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <h3 className="text-xl font-display font-bold text-center mb-6">
          Choose Promotion
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {PROMOTION_PIECES.map(({ type, name }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="glass rounded-xl p-4 hover:scale-110 transition-all duration-200 group flex flex-col items-center space-y-2"
              title={name}
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div
                className="w-12 h-12"
                dangerouslySetInnerHTML={{
                  __html: PIECE_SETS[theme]?.[color + type.toUpperCase()] || ''
                }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {name}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="mt-4 w-full text-center text-sm py-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
};

export default PromotionModal;
