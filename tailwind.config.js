/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Paleta y tipografía institucionales tomadas de umng.edu.co
      colors: {
        umng: {
          blue: '#043074',
          navy: '#02183A',
          yellow: '#FDC600',
          gold: '#B08022',
          red: '#EE3124',
          green: '#0D5E30',
          ink: '#231F20',
          mist: '#F5F7FA',
          ice: '#E6EAFA',
          cream: '#FFF4D1',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
