module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,css}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'current': 'currentColor',
        'blue': {
          sky: '#00DFE7',
          sapphire: '#00ADB5'
        },
        'gray': {
          lightest: '#FAFAFA',
          light: '#EEEEEE',
          dark: '#2D323A',
          darker: '#222831',
          darkest: '#201f28',
        }
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
