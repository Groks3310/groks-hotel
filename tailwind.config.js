/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1320',
        ivory: '#F7F3EE',
        charcoal: '#1C1C1C',
        gold: '#C8A96A',
        sand: '#D8C3A5',
        bronze: '#A58E6F',
        'glass-white': 'rgba(255,255,255,0.08)',
        'success': '#4CAF88',
        'danger': '#D96C6C',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #0B1320 0%, #1a2540 50%, #0B1320 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease forwards',
        'slide-up': 'slideUp 0.8s ease forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
}