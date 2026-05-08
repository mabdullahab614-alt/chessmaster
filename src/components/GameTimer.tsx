import React from 'react';
import { formatTime } from '../hooks/useGameTimer';

interface GameTimerProps {
  time: number;
  isActive: boolean;
  isUnlimited: boolean;
  label: string;
  flipped?: boolean;
}

const GameTimer: React.FC<GameTimerProps> = ({ time, isActive, isUnlimited, label }) => {
  if (isUnlimited) {
    return (
      <div className="glass rounded-xl px-4 py-3 flex items-center justify-between min-w-[160px]">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span className="text-xl font-mono font-bold" style={{ color: 'var(--text-muted)' }}>∞</span>
      </div>
    );
  }

  const isLow = time < 30 && time > 0;
  const isCritical = time < 10 && time > 0;

  return (
    <div
      className={`rounded-xl px-4 py-3 flex items-center justify-between min-w-[160px] transition-all duration-300 ${
        isActive ? 'timer-active glass-strong' : 'glass'
      } ${isCritical ? 'timer-low' : ''}`}
    >
      <span
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </span>
      <span
        className={`text-2xl font-mono font-black transition-colors duration-300 ${
          isActive ? '' : 'opacity-60'
        } ${isLow ? 'text-red-500' : ''} ${isCritical ? 'animate-pulse' : ''}`}
        style={!isLow ? { color: isActive ? 'var(--primary-color)' : 'var(--text-main)' } : undefined}
      >
        {formatTime(time)}
      </span>
    </div>
  );
};

export default GameTimer;
