/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function({ addBase, addUtilities }) {
      // Áp dụng cho toàn bộ trang
      addBase({
        'html': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        'html::-webkit-scrollbar': {
          display: 'none',
        },
      });
      
      // Tạo class utility để áp dụng cho các phần tử riêng lẻ
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
}