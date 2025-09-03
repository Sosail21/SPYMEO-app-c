// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#edf4f6",
        text: "#0b1239",
        muted: "#5b6b8b",
        primary: "#0b1239",
        accent: "#17a2b8",
        border: "rgba(11,18,57,.08)",
      },
      borderRadius: { lg: "16px", xl: "20px" },
      boxShadow: { elev: "0 10px 30px rgba(11,18,57,.10)" },
      maxWidth: { container: "1200px" },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    
  ],
};
