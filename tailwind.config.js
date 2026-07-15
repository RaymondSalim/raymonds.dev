module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'current': 'currentColor',
        'brutalist': {
          bg: '#FAFAF7',
          fg: '#0A0A0A',
          'fg-muted': '#4B5563',
          'fg-muted-dark': '#9CA3AF',
          border: '#0A0A0A',
          accent: '#FF4B1F',
          'accent-contrast': '#0A0A0A',
          surface: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['"Anton"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      screens: {
        '2xl': '1536px',

        'bp-max-1080': {
          'max': '1080px',
        },
        'bp-max-768': {
          'max': '768px',
        },
        'bp-max-600': {
          'max': '600px'
        },
        'bp-max-480': {
          'max': '480px'
        }
      },
    },
  },
  plugins: [],
}
