/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0B0F19', // matching existing bg
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'neon-orange': '#ea580c', // Tailwind orange-600 looks deep amber
      },
      boxShadow: {
        'neon': '0 0 20px rgba(234, 88, 12, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
