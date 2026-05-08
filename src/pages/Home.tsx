import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Users, Rocket, Zap, Shield, BarChart3, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const themes: { id: string; name: string; color: string }[] = [
    { id: 'dark',    name: 'Sleek Dark',   color: '#1e293b' },
    { id: 'classic', name: 'Classic Wood', color: '#779556' },
    { id: 'neon',    name: 'Neon Cyber',   color: '#bc13fe' },
    { id: 'anime',   name: 'Anime Pop',    color: '#ec4899' },
  ];

  const features = [
    { icon: <Zap className="w-5 h-5" />,      title: 'Minimax AI',    desc: '5 difficulty levels with alpha-beta' },
    { icon: <Shield className="w-5 h-5" />,   title: 'Full Rules',    desc: 'Castling, en passant, promotion' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Stats Tracking', desc: 'Win rate, streaks, history' },
    { icon: <Sparkles className="w-5 h-5" />, title: '4 Themes',      desc: 'Dark, Classic, Neon, Anime' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden">
        {/* Floating pieces background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
          {['♔', '♕', '♖', '♗', '♘', '♙'].map((piece, i) => (
            <div
              key={i}
              className="absolute text-8xl animate-float select-none"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              {piece}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10"
        >
          <div className="mb-4">
            <span
              className="inline-block text-xs font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full glass"
              style={{ color: 'var(--primary-color)' }}
            >
              ♚ The Ultimate Chess Experience
            </span>
          </div>

          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-none">
            CHESS<span style={{ color: 'var(--primary-color)' }}>MASTER</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Play against world-class AI with 5 difficulty levels, challenge friends locally,
            and track your journey to mastery.
          </p>

          {/* Tagline */}
          <motion.p
            className="mt-3 text-xs font-medium uppercase tracking-[0.25em]"
            style={{ color: 'var(--text-muted)', opacity: 0.6 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6 }}
          >
            Built by Abdullah Javid
          </motion.p>
        </motion.div>

        {/* Game mode cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl mt-12 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <GameModeCard
            title="vs Computer"
            desc="Battle AI with adaptive difficulty"
            icon={<Cpu className="w-7 h-7" />}
            onClick={() => navigate('/play/ai')}
            accent="primary"
          />
          <GameModeCard
            title="Local Match"
            desc="Pass-and-play with a friend"
            icon={<Users className="w-7 h-7" />}
            onClick={() => navigate('/play/local')}
            accent="accent"
          />
          <GameModeCard
            title="Quick Play"
            desc="Jump into a fast bullet game vs AI"
            icon={<Rocket className="w-7 h-7" />}
            onClick={() => navigate('/play/ai?quick=true')}
            accent="secondary"
          />
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-sm font-bold uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>
            Features
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass rounded-xl p-5 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'var(--bg-card)', color: 'var(--primary-color)' }}
                >
                  {f.icon}
                </div>
                <h3 className="font-bold text-sm">{f.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Theme Selector */}
      <motion.section
        className="py-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex flex-col items-center space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
            Choose Your Theme
          </h3>
          <div className="flex space-x-4">
            {themes.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id as any)} className="group relative" title={t.name}>
                <div
                  className={`w-14 h-14 rounded-full border-4 transition-all duration-300 ${
                    theme === t.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: t.color }}
                />
                <span
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap transition-opacity ${
                    theme === t.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ color: 'var(--text-muted)' }}
                >
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="text-center py-8 space-y-1">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Built with ♥ using React, chess.js &amp; Framer Motion
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--primary-color)', opacity: 0.7 }}>
          Built by Abdullah Javid
        </p>
      </footer>
    </div>
  );
};

const GameModeCard = ({
  title, desc, icon, onClick, accent,
}: {
  title: string; desc: string; icon: React.ReactNode; onClick: () => void; accent: string;
}) => (
  <motion.button
    onClick={onClick}
    className="glass rounded-2xl p-6 sm:p-8 text-left group relative overflow-hidden"
    whileHover={{ scale: 1.03, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle at top left, var(--${accent}-color), transparent 70%)` }}
    />
    <div
      className="p-3 rounded-xl w-fit mb-4 transition-all duration-300 group-hover:scale-110"
      style={{ background: 'color-mix(in srgb, var(--primary-color) 15%, transparent)', color: 'var(--primary-color)' }}
    >
      {icon}
    </div>
    <h3 className="text-xl font-display font-bold mb-1">{title}</h3>
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
  </motion.button>
);

export default Home;
