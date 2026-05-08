import { useState, useCallback, useRef, useEffect } from 'react';

export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'unlimited';

interface TimeControlConfig {
  name: string;
  baseTime: number; // seconds
  increment: number; // seconds
  label: string;
}

export const TIME_CONTROLS: Record<TimeControl, TimeControlConfig> = {
  bullet: { name: 'Bullet', baseTime: 60, increment: 0, label: '1+0' },
  blitz: { name: 'Blitz', baseTime: 180, increment: 2, label: '3+2' },
  rapid: { name: 'Rapid', baseTime: 600, increment: 5, label: '10+5' },
  classical: { name: 'Classical', baseTime: 1800, increment: 0, label: '30+0' },
  unlimited: { name: 'Unlimited', baseTime: Infinity, increment: 0, label: '∞' },
};

export const ALL_TIME_CONTROLS: TimeControl[] = ['bullet', 'blitz', 'rapid', 'classical', 'unlimited'];

export const formatTime = (seconds: number): string => {
  if (seconds === Infinity) return '∞';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const useGameTimer = (timeControl: TimeControl = 'rapid') => {
  const config = TIME_CONTROLS[timeControl];
  const [whiteTime, setWhiteTime] = useState(config.baseTime);
  const [blackTime, setBlackTime] = useState(config.baseTime);
  const [activeClock, setActiveClock] = useState<'w' | 'b' | null>(null);
  const [flagged, setFlagged] = useState<'w' | 'b' | null>(null);
  const intervalRef = useRef<number | null>(null);

  const isUnlimited = timeControl === 'unlimited';

  // Tick the active clock
  useEffect(() => {
    if (activeClock && !isUnlimited && !flagged) {
      intervalRef.current = window.setInterval(() => {
        if (activeClock === 'w') {
          setWhiteTime(prev => {
            if (prev <= 0.1) {
              setFlagged('w');
              return 0;
            }
            return prev - 0.1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 0.1) {
              setFlagged('b');
              return 0;
            }
            return prev - 0.1;
          });
        }
      }, 100);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeClock, isUnlimited, flagged]);

  const switchClock = useCallback((toColor: 'w' | 'b') => {
    if (isUnlimited || flagged) return;
    // Add increment to the player who just moved
    if (activeClock && config.increment > 0) {
      if (activeClock === 'w') {
        setWhiteTime(prev => prev + config.increment);
      } else {
        setBlackTime(prev => prev + config.increment);
      }
    }
    setActiveClock(toColor);
  }, [activeClock, config.increment, isUnlimited, flagged]);

  const startClock = useCallback(() => {
    if (!isUnlimited) setActiveClock('w');
  }, [isUnlimited]);

  const stopClock = useCallback(() => {
    setActiveClock(null);
  }, []);

  const resetClock = useCallback((tc?: TimeControl) => {
    const c = TIME_CONTROLS[tc || timeControl];
    setWhiteTime(c.baseTime);
    setBlackTime(c.baseTime);
    setActiveClock(null);
    setFlagged(null);
  }, [timeControl]);

  return {
    whiteTime,
    blackTime,
    activeClock,
    flagged,
    isUnlimited,
    switchClock,
    startClock,
    stopClock,
    resetClock,
    config,
  };
};
