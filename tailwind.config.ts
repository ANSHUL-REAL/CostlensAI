import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--panel-strong) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        bone: "rgb(var(--panel-soft) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        body: "rgb(var(--body) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line-soft) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          50: "rgb(var(--brand) / 0.08)",
          100: "rgb(var(--brand) / 0.16)",
          600: "rgb(var(--brand) / <alpha-value>)",
          700: "rgb(var(--brand-strong) / <alpha-value>)",
          900: "rgb(var(--ink) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          soft: "rgb(var(--success) / 0.12)",
          ink: "rgb(var(--success) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          soft: "rgb(var(--warning) / 0.12)",
          ink: "rgb(var(--warning) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)",
          soft: "rgb(var(--danger) / 0.12)",
          ink: "rgb(var(--danger) / <alpha-value>)",
        },
      },
      borderRadius: {
        card: "var(--radius-small)",
        lg: "var(--radius-button-modal)",
        md: "var(--radius-small)",
        sm: "var(--radius-base)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--surface-shadow)",
        pop: "0 18px 48px rgba(0, 0, 0, 0.24)",
        glow: "0 0 24px rgba(var(--brand), 0.22)",
        focus: "0 0 0 3px rgba(var(--brand), 0.18)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        "display-lg": ["4.75rem", { lineHeight: "0.9", letterSpacing: "-0.04em" }],
        display: ["3rem", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        heading: ["1.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        title: ["1.125rem", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
      },
      spacing: {
        section: "96px",
        page: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
