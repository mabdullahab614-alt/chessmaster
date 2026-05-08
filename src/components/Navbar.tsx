import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Settings, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ soundEnabled = true, onToggleSound }) => {
  const location = useLocation();
  useTheme(); // keeps ThemeContext subscription for future use

  const links = [
    { to: '/', icon: <Home className="w-4 h-4" />, label: 'Home' },
    { to: '/leaderboard', icon: <Trophy className="w-4 h-4" />, label: 'Stats' },
    { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' },
  ];

  return (
    <nav className="glass-strong sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + tagline */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="text-2xl">♚</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-display font-black tracking-tight">
                CHESS<span style={{ color: 'var(--primary-color)' }}>MASTER</span>
              </span>
              <span
                className="text-[9px] font-medium uppercase tracking-[0.15em] hidden sm:block"
                style={{ color: 'var(--text-muted)' }}
              >
                by Abdullah Javid
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center space-x-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link flex items-center space-x-2 rounded-lg ${
                  location.pathname === link.to ? 'active' : ''
                }`}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}

            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="nav-link flex items-center rounded-lg"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 opacity-50" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
