/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ السطر الوحيد اللي ضفناه لتفعيل الدارك مود
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ✅ ربطنا الألوان الأساسية بالمتغيرات عشان تتقلب في الدارك مود
        cream: "rgb(var(--bg-cream) / <alpha-value>)",
        charcoal: "rgb(var(--text-charcoal) / <alpha-value>)",
        white: "rgb(var(--bg-white) / <alpha-value>)",

        // باقي ألوانك زي ما هي بالظبط
        gold: "#C89B5A",
        "gold-dark": "#A87F45",
        muted: "#6B6B6B",
        success: "#10B981",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-plex-arabic)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "fade-down": "fadeDown 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};