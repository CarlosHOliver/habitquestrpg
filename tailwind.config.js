/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./login.html",
    "./auth-check.html",
    "./login-standalone.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
      animation: {
        'xp-gain': 'xp-gain 2s ease-out forwards',
      },
      keyframes: {
        'xp-gain': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateY(-20px) scale(1.2)', opacity: '1' },
          '100%': { transform: 'translateY(-40px) scale(1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
