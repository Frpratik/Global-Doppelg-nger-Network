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
        background: "#090C10",
        surface: {
          DEFAULT: "#0F141C",
          subtle: "#0D1117",
          elevated: "#161B26",
          hover: "#1C2331",
          border: "#1E2638",
          borderHover: "#2D374D",
          borderActive: "#00D8E6"
        },
        brand: {
          cyan: "#00D8E6",
          cyanHover: "#33E0EB",
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
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px"
      },
      boxShadow: {
        panel: "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(30, 38, 56, 0.8)",
        panelHover: "0 8px 30px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(45, 55, 77, 1)",
        buttonPrimary: "0 2px 8px 0 rgba(0, 216, 230, 0.25)",
        focusCyan: "0 0 0 2px #090C10, 0 0 0 4px #00D8E6"
      }
    }
  },
  plugins: []
};
