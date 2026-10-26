/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        disco: {
          bg: '#2A1033',           // Deep aubergine/plum background
          surface: '#381645',      // Warm plum card surface
          elevated: '#471D57',     // Slightly raised plum element
          border: '#18091D',       // Dark chunky outline
          cream: '#FFF4DC',        // Warm cream primary text (WCAG AAA on #2A1033)
          'cream-muted': '#D8CBB6',// Muted cream secondary text
          'cream-dim': '#AB9A85',  // Subdued tertiary text
          mustard: '#FFC83B',      // 1970s Mustard Yellow accent
          'mustard-dark': '#E5B12A',
          pink: '#FF3377',         // 1970s Hot Pink accent
          'pink-dark': '#E61E63',
          orange: '#FF6B35',       // 1970s Tangerine Orange accent
          'orange-dark': '#E8551E',
          teal: '#00A896',         // 1970s Retro Teal accent
          'teal-dark': '#008C7D',
          grape: '#9C41B3',        // 1970s Groovy Grape accent
        },
        // Reusable game tile colors
        tiles: {
          safe: '#00A896',         // Retro Teal (Solid footing)
          bounce: '#FFC83B',       // Mustard Yellow (High jump)
          slide: '#FF6B35',        // Tangerine Orange (Slick momentum)
          crumble: '#FF3377',      // Hot Pink (Floor collapse)
          mystery: '#9C41B3',      // Groovy Grape (Lane warp / bonus)
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Righteous"', '"Fredoka"', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'retro-xs': '1px 1px 0px #18091D',
        'retro-sm': '2px 2px 0px #18091D',
        'retro': '4px 4px 0px #18091D',
        'retro-lg': '6px 6px 0px #18091D',
        'retro-xl': '8px 8px 0px #18091D',
        'retro-pink': '4px 4px 0px #FF3377',
        'retro-mustard': '4px 4px 0px #FFC83B',
      },
      keyframes: {
        discoSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        retroBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        retroWobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
      },
      animation: {
        'disco-spin': 'discoSpin 14s linear infinite',
        'bounce-subtle': 'retroBounce 0.3s ease-in-out',
        'wobble-subtle': 'retroWobble 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};
