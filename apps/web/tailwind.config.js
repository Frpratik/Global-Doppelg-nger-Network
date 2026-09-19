/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        primary: {
          DEFAULT: "#00F0FF",
          glow: "#00f0ff40",
          dark: "#00838f"
        },
        secondary: {
          DEFAULT: "#8A2BE2",
          glow: "#8a2be240",
          dark: "#4b0082"
        },
        accent: {
          cyan: "#00F0FF",
          violet: "#A855F7",
          emerald: "#10B981",
          rose: "#F43F5E"
        },
        surface: {
          dark: "#0A0D14",
          card: "#111622",
          cardHover: "#182030",
          border: "#1E293B"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "scan-line": "scanline 2.5s ease-in-out infinite"
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        scanline: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" }
        }
      }
    },
  },
  plugins: [],
}
