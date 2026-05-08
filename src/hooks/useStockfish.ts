import { useCallback, useEffect, useRef, useState } from 'react';

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'master';

const DIFFICULTY_INFO: Record<Difficulty, { name: string; description: string; elo: string; stars: number }> = {
  beginner: { name: 'Beginner', description: 'Random-ish moves, great for learning', elo: '~400', stars: 1 },
  easy:     { name: 'Easy',     description: 'Basic tactics, occasional blunders',  elo: '~800', stars: 2 },
  medium:   { name: 'Medium',   description: 'Solid play, punishes mistakes',        elo: '~1400', stars: 3 },
  hard:     { name: 'Hard',     description: 'Strong positional and tactical play',  elo: '~2000', stars: 4 },
  master:   { name: 'Master',   description: 'Near-perfect play, extremely tough',   elo: '~2800', stars: 5 },
};

export const getDifficultyInfo = (diff: Difficulty) => DIFFICULTY_INFO[diff];
export const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'easy', 'medium', 'hard', 'master'];

export const useStockfish = () => {
  const [isThinking, setIsThinking] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((move: string | null) => void) | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/chessAI.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent<{ bestMove: string | null }>) => {
      const resolve = resolveRef.current;
      resolveRef.current = null;
      setIsThinking(false);
      resolve?.(e.data.bestMove);
    };

    worker.onerror = () => {
      const resolve = resolveRef.current;
      resolveRef.current = null;
      setIsThinking(false);
      resolve?.(null);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const getBestMove = useCallback(
    (fen: string, difficulty: Difficulty): Promise<string | null> => {
      return new Promise<string | null>((resolve) => {
        if (!workerRef.current) { resolve(null); return; }
        setIsThinking(true);
        resolveRef.current = resolve;
        workerRef.current.postMessage({ fen, difficulty });
      });
    },
    [],
  );

  // Used for hints — always uses medium strength
  const getHint = useCallback(
    (fen: string): Promise<string | null> => getBestMove(fen, 'medium'),
    [getBestMove],
  );

  return { getBestMove, getHint, isThinking };
};
