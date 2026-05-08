/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We'll use CSS variables for theme-aware colors
        board: {
          light: 'var(--board-light)',
          dark: 'var(--board-dark)',
        },
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
      },
      fontFamily: {
        'display': ['Outfit', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--accent-color)' },
          '100%': { boxShadow: '0 0 20px var(--accent-color)' },
        }
      }
    },
  },
  plugins: [],
}
