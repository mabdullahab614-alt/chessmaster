import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { ALL_DIFFICULTIES, getDifficultyInfo, type Difficulty } from '../hooks/useStockfish';

interface DifficultySelectorProps {
  selected: Difficulty;
  onSelect: (diff: Difficulty) => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      {ALL_DIFFICULTIES.map((diff, index) => {
        const info = getDifficultyInfo(diff);
        const isSelected = selected === diff;

        return (
          <motion.button
            key={diff}
            onClick={() => onSelect(diff)}
            className={`w-full glass rounded-xl p-4 text-left transition-all duration-300 ${
              isSelected ? 'ring-2 scale-[1.02]' : 'hover:scale-[1.01] opacity-70 hover:opacity-100'
            }`}
            style={{
              ringColor: isSelected ? 'var(--primary-color)' : undefined,
              borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
              border: isSelected ? '1px solid var(--primary-color)' : undefined,
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-display font-bold text-lg">{info.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
                  >
                    {info.elo}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {info.description}
                </p>
              </div>
              <div className="flex space-x-0.5 ml-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 transition-colors ${
                      i < info.stars ? '' : 'opacity-20'
                    }`}
                    fill={i < info.stars ? 'var(--primary-color)' : 'none'}
                    stroke={i < info.stars ? 'var(--primary-color)' : 'currentColor'}
                  />
                ))}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default DifficultySelector;
