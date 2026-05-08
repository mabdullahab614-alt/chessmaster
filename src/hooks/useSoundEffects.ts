import { useCallback, useRef, useState } from 'react';

type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'gameOver' | 'illegal' | 'start' | 'promote';

const audioContextRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playNoise(duration: number, volume: number = 0.08) {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.start();
}

const SOUNDS: Record<SoundType, () => void> = {
  move: () => {
    playNoise(0.08, 0.12);
    playTone(300, 0.08, 'triangle', 0.06);
  },
  capture: () => {
    playNoise(0.12, 0.2);
    playTone(200, 0.15, 'sawtooth', 0.08);
    playTone(150, 0.1, 'square', 0.04);
  },
  check: () => {
    playTone(880, 0.1, 'square', 0.12);
    setTimeout(() => playTone(1100, 0.15, 'square', 0.1), 100);
  },
  castle: () => {
    playNoise(0.06, 0.1);
    playTone(400, 0.1, 'triangle', 0.08);
    setTimeout(() => {
      playNoise(0.06, 0.1);
      playTone(500, 0.1, 'triangle', 0.08);
    }, 150);
  },
  gameOver: () => {
    playTone(523, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.2, 'sine', 0.15), 200);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 400);
    setTimeout(() => playTone(1047, 0.5, 'sine', 0.12), 600);
  },
  illegal: () => {
    playTone(200, 0.15, 'square', 0.1);
    setTimeout(() => playTone(150, 0.2, 'square', 0.08), 100);
  },
  start: () => {
    playTone(440, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(660, 0.15, 'sine', 0.12), 150);
  },
  promote: () => {
    playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(800, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(1000, 0.2, 'sine', 0.12), 200);
  },
};

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('chess-sound');
    return saved !== 'false';
  });
  const lastSoundRef = useRef<number>(0);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;
    // Debounce to avoid overlap
    const now = Date.now();
    if (now - lastSoundRef.current < 50) return;
    lastSoundRef.current = now;

    try {
      SOUNDS[type]();
    } catch (e) {
      // Audio context may not be available
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('chess-sound', String(next));
      return next;
    });
  }, []);

  return { playSound, soundEnabled, toggleSound };
};
