/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PONS Brand Colors
        'pons-black': '#000000',
        'pons-dark': '#0a0a0a',
        'pons-gray': '#1a1a1a',
        'pons-gray-light': '#2a2a2a',
        'pons-blue': '#3b82f6',
        'pons-blue-glow': '#60a5fa',
        'pons-gold': '#f59e0b',
        'pons-gold-glow': '#fbbf24',
        'pons-red': '#ef4444',
        'pons-red-dark': '#991b1b',
        'pons-green': '#22c55e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(59, 130, 246, 0.3)',
        'glow-gold': '0 0 40px rgba(245, 158, 11, 0.3)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
