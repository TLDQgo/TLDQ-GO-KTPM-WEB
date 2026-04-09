/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    container: {
      center: true, // tự canh giữa
      padding: {
        DEFAULT: "1rem", // mobile
        sm: "2rem", // ≥ 640px (iPad dọc)
        md: "3rem", // ≥ 768px (iPad ngang)
        lg: "8rem", // ≥ 1024px
        xl: "8rem", // ≥ 1280px
        // ≥ 1536px
      },
    },
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
