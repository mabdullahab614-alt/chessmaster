import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Swords, Flame, BarChart3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadStats, type GameRecord } from '../lib/gameStats';

const Leaderboard = () => {
  // Re-read from localStorage every time the page mounts
  const stats = useMemo(() => loadStats(), []);

  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  const statCards = [
    { icon: <Swords className="w-5 h-5" />,  label: 'Games Played', value: stats.totalGames, color: 'var(--primary-color)' },
    { icon: <Trophy className="w-5 h-5" />,  label: 'Victories',    value: stats.wins,        color: '#22c55e' },
    { icon: <Target className="w-5 h-5" />,  label: 'Win Rate',     value: `${winRate}%`,     color: 'var(--accent-color)' },
    { icon: <Flame className="w-5 h-5" />,   label: 'Best Streak',  value: stats.bestStreak,  color: '#f59e0b' },
  ];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-black mb-2">Your Stats</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track your chess journey</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-xl p-5 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--bg-card)', color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="text-3xl font-display font-black" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Win/Loss/Draw Bar */}
        <motion.div
          className="glass rounded-xl p-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
            <span>Performance</span>
            {stats.totalGames > 0 && (
              <span className="ml-auto text-xs font-normal" style={{ color: 'var(--text-muted)' }}>
                {stats.totalGames} games total
              </span>
            )}
          </h3>
          {stats.totalGames > 0 ? (
            <div className="space-y-4">
              <div className="flex rounded-full overflow-hidden h-6">
                {stats.wins > 0 && (
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{ width: `${(stats.wins / stats.totalGames) * 100}%`, backgroundColor: '#22c55e' }}
                  >
                    {stats.wins}W
                  </div>
                )}
                {stats.draws > 0 && (
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{ width: `${(stats.draws / stats.totalGames) * 100}%`, backgroundColor: '#6b7280' }}
                  >
                    {stats.draws}D
                  </div>
                )}
                {stats.losses > 0 && (
                  <div
                    className="flex items-center justify-center text-xs font-bold text-white"
                    style={{ width: `${(stats.losses / stats.totalGames) * 100}%`, backgroundColor: '#ef4444' }}
                  >
                    {stats.losses}L
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Wins ({stats.wins})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" /> Draws ({stats.draws})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Losses ({stats.losses})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>No games played yet</p>
              <Link to="/play/ai" className="btn-primary inline-flex items-center space-x-2">
                <Swords className="w-4 h-4" />
                <span>Play Your First Game</span>
              </Link>
            </div>
          )}
        </motion.div>

        {/* Game History */}
        {stats.games.length > 0 && (
          <motion.div
            className="glass rounded-xl p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-sm font-bold mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              <span>Recent Games</span>
            </h3>
            <div className="space-y-1 max-h-[320px] overflow-y-auto custom-scrollbar">
              {(stats.games as GameRecord[]).slice(-30).reverse().map((game, i) => (
                <div
                  key={game.id || i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      game.result === 'win' ? 'bg-green-500' :
                      game.result === 'loss' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <span className="text-sm font-medium">{game.opponent}</span>
                      <span className="text-xs ml-2 opacity-50">{game.mode === 'vs-ai' ? 'vs AI' : 'Local'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{game.moves} moves</span>
                    <span className="opacity-60">{formatDate(game.date)}</span>
                    <span className={`font-bold uppercase w-10 text-right ${
                      game.result === 'win' ? 'text-green-500' :
                      game.result === 'loss' ? 'text-red-500' : 'text-gray-400'
                    }`}>{game.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Motivational */}
        <motion.div
          className="text-center mt-12 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--primary-color)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Every game makes you stronger. Keep playing, keep improving.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
