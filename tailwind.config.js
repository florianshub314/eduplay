/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        inner: 'inset 0 1px 6px rgba(0,0,0,0.06)',
      },
      colors: {
        canvas: '#ffffff',
        ink: '#0b0b0c',
        subtle: '#f5f6f7'
      }
    },
  },
  plugins: [],
};
