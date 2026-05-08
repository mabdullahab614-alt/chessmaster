import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Palette, Trash2, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('chess-sound') !== 'false';
  });

  const themes = [
    {
      id: 'dark',
      name: 'Sleek Dark',
      desc: 'Modern dark interface with blue accents',
      colors: ['#020617', '#1e293b', '#3b82f6', '#00f2ff'],
    },
    {
      id: 'classic',
      name: 'Classic Wood',
      desc: 'Traditional wooden board feel',
      colors: ['#f5f0e8', '#ebecd0', '#779556', '#5d4037'],
    },
    {
      id: 'neon',
      name: 'Neon Cyber',
      desc: 'Futuristic cyberpunk with glow effects',
      colors: ['#020005', '#1a1a2e', '#bc13fe', '#00f2ff'],
    },
    {
      id: 'anime',
      name: 'Anime Pop',
      desc: 'Soft pink aesthetic inspired by anime',
      colors: ['#fff1f2', '#fdf2f8', '#ec4899', '#f472b6'],
    },
  ];

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem('chess-sound', String(next));
      return next;
    });
  };

  const clearStats = () => {
    if (confirm('Are you sure? This will permanently delete all game history.')) {
      localStorage.removeItem('chess-stats');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-black mb-2">Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Customize your experience</p>
        </div>

        {/* Theme Section */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center space-x-2">
            <Palette className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
            <span>Board Theme</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t, i) => (
              <motion.button
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`glass rounded-xl p-4 text-left transition-all ${
                  theme === t.id ? 'ring-2 scale-[1.01]' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: theme === t.id ? 'var(--primary-color)' : 'var(--border-color)',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold">{t.name}</span>
                  {theme === t.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{
                      background: 'var(--primary-color)',
                      color: 'white'
                    }}>Active</span>
                  )}
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{t.desc}</p>
                <div className="flex space-x-1.5">
                  {t.colors.map((c, j) => (
                    <div
                      key={j}
                      className="w-8 h-5 rounded"
                      style={{ backgroundColor: c, border: '1px solid rgba(128,128,128,0.2)' }}
                    />
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
              ) : (
                <VolumeX className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              )}
              <div>
                <h3 className="font-display font-bold">Sound Effects</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Move, capture, check, and game-over sounds
                </p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-14 h-8 rounded-full transition-all relative`}
              style={{ background: soundEnabled ? 'var(--primary-color)' : 'var(--bg-card)' }}
            >
              <div
                className="w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-md"
                style={{ transform: soundEnabled ? 'translateX(28px)' : 'translateX(4px)' }}
              />
            </button>
          </div>
        </div>

        {/* About */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center space-x-2">
            <Monitor className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
            <span>About ChessMaster</span>
          </h3>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Version</span>
              <span className="font-mono">0.1.0</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Engine</span>
              <span className="font-mono">chess.js + Minimax AI</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>Framework</span>
              <span className="font-mono">React + TypeScript</span>
            </div>
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span>UI</span>
              <span className="font-mono">Tailwind + Framer Motion</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Built by</span>
              <span className="font-mono font-bold" style={{ color: 'var(--primary-color)' }}>Abdullah Javid</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass rounded-2xl p-6 border border-red-500/20">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center space-x-2 text-red-400">
            <Trash2 className="w-5 h-5" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            This will permanently delete all your game statistics and history.
          </p>
          <button
            onClick={clearStats}
            className="px-4 py-2 rounded-lg text-sm font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Reset All Statistics
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
