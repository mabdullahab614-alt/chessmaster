import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useSoundEffects } from './hooks/useSoundEffects';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PlayAI from './pages/PlayAI';
import PlayLocal from './pages/PlayLocal';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  const { soundEnabled, toggleSound } = useSoundEffects();

  return (
    <>
      <Navbar soundEnabled={soundEnabled} onToggleSound={toggleSound} />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/play/ai" element={<PlayAI />} />
            <Route path="/play/local" element={<PlayLocal />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen">
          <AnimatedRoutes />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
