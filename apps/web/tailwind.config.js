/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/services/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: {
          DEFAULT: "#0F141C",
          subtle: "#0A0E15",
          elevated: "#151B27",
          highlight: "#1C2434",
          hover: "#182030",
          border: "#1C2538",
          borderHover: "#2A3752",
          borderActive: "#00D8E6"
        },
        brand: {
          cyan: "#00D8E6",
          cyanHover: "#33E0EB",
          cyanGlow: "rgba(0, 216, 230, 0.2)",
          indigo: "#4F46E5",
          violet: "#7C3AED",
        },
        content: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
          subtle: "#475569"
        },
        status: {
          success: "#10B981",
          successBg: "rgba(16, 185, 129, 0.12)",
          warning: "#F59E0B",
          warningBg: "rgba(245, 158, 11, 0.12)",
          danger: "#EF4444",
          dangerBg: "rgba(239, 68, 68, 0.12)",
          info: "#00D8E6",
          infoBg: "rgba(0, 216, 230, 0.12)"
        }
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif"
        ],
        mono: [
          '"SFMono-Regular"',
          "Consolas",
          '"Liberation Mono"',
          "Menlo",
          "Courier",
          "monospace"
        ]
      },
      maxWidth: {
        feed: "760px",
        profile: "1180px",
        settings: "1040px",
        explorer: "1400px",
        inbox: "1280px"
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px"
      },
      boxShadow: {
        panel: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(28, 37, 56, 0.8)",
        panelHover: "0 12px 36px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(42, 55, 82, 1)",
        glowCyan: "0 0 24px -2px rgba(0, 216, 230, 0.35)",
        buttonPrimary: "0 2px 10px 0 rgba(0, 216, 230, 0.3)",
        focusCyan: "0 0 0 2px #080B10, 0 0 0 4px #00D8E6"
      }
    }
  },
  plugins: []
};
