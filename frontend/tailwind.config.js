/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NCC Brand Colors
        ncc: {
          red: '#DC2626',      // Action buttons, alerts
          blue: '#2563EB',     // Primary brand, navigation
          skyblue: '#0EA5E9',  // Secondary accents, links
          yellow: '#FACC15',   // Highlights, achievements
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
