import React from 'react';
import GameTimer from './GameTimer';
import CapturedPieces from './CapturedPieces';

interface PlayerCardProps {
  name: string;
  isActive: boolean;
  time: number;
  isUnlimited: boolean;
  capturedPieces: string[];
  capturedColor: 'w' | 'b';
  advantage?: number;
  avatar?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  isActive,
  time,
  isUnlimited,
  capturedPieces,
  capturedColor,
  advantage,
}) => {
  return (
    <div className={`glass rounded-xl p-4 transition-all duration-300 ${isActive ? 'ring-1' : ''}`}
         style={{ ringColor: isActive ? 'var(--primary-color)' : undefined }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              isActive ? 'animate-pulse-glow' : ''
            }`}
            style={{ background: 'var(--bg-card)', border: '2px solid var(--border-color)' }}
          >
            {name[0]}
          </div>
          <div>
            <div className="font-display font-bold">{name}</div>
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  isActive ? 'bg-green-400' : ''
                }`}
                style={!isActive ? { background: 'var(--secondary-color)' } : undefined}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isActive ? 'Playing' : 'Waiting'}
              </span>
            </div>
          </div>
        </div>
        <GameTimer
          time={time}
          isActive={isActive}
          isUnlimited={isUnlimited}
          label=""
        />
      </div>
      <CapturedPieces
        pieces={capturedPieces}
        color={capturedColor}
        advantage={advantage}
      />
    </div>
  );
};

export default PlayerCard;
