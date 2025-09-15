/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", ],
  theme: {
    extend: {
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        textLoop: {
          "0%, 20%": { opacity: 1, transform: "translateY(0)" },
          "25%, 100%": { opacity: 0, transform: "translateY(-100%)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 1s ease-out forwards",
        fadeIn: "fadeIn 1.2s ease-out forwards",
        textLoop: "textLoop 9s infinite",
      },
    },
  },
  plugins: [],
}

