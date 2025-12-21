import merge from "deepmerge";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette.js";

import tremorThemeModule from "./tremor.theme.cjs";
import shadcnThemeModule from "./shadcn.theme.cjs";
import claudeThemeModule from "./claude.theme.cjs";
import { colors as designSystemColors } from "./colors.js";

const tremorTheme = tremorThemeModule.theme;
const shadcnTheme = shadcnThemeModule.theme;
const claudeTheme = claudeThemeModule.theme;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Related path
    "../../apps/*/{app,components}/*.{js,ts,jsx,tsx}",
    "../../apps/*/{app,components}/**/*.{js,ts,jsx,tsx}",
    "../../apps/*/components/ui/**/*.{js,ts,jsx,tsx}",
    "../../packages/{components,libs}/*.{js,ts,jsx,tsx}",
    "../../packages/{components,libs}/**/*.{js,ts,jsx,tsx}",
    "../../packages/components/ui/*.{js,ts,jsx,tsx}",
    // Path to the tremor module
    "../../node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
    "../../packages/components/node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
  ],
  variants: {
    extend: {
      opacity: ["disabled"],
      typography: ["dark"],
    },
    typography: ["dark"],
  },
  theme: {
    extend: {
      ...merge.all([
        tremorTheme,
        shadcnTheme,
        claudeTheme,
        {
          colors: {
            gold: "#ffd465",
            // Claude's color palette - flattened for utility class usage
            "claude-beige": "#F4EFE6",
            "claude-cream": "#FBF7F0",
            "claude-tan": "#E6D9C9",
            "claude-brown": "#A07855",
            "claude-copper": "#CC785C",
            "claude-orange": "#D97757",
            "claude-black": "#1F1F1F",
            "claude-gray-50": "#F9F9F8",
            "claude-gray-100": "#F3F2F0",
            "claude-gray-200": "#E8E6E2",
            "claude-gray-300": "#D4D1CB",
            "claude-gray-400": "#A8A399",
            "claude-gray-500": "#7C7869",
            "claude-gray-600": "#5C5850",
            "claude-gray-700": "#3D3C38",
            "claude-gray-800": "#2B2A27",
            "claude-gray-900": "#1F1F1F",
          },
        },
      ]),

      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.black.100"),
            a: {
              color: theme("colors.blue.600"),
              textDecoration: "none",
              textDecorationThickness: "from-font",
              textOverflow: "ellipsis",
              overflow: "hidden",
              overflowWrap: "break-word",
              whiteSpace: "break-spaces",
              wordBreak: "break-word",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            'a[href^="https://"]': {
              "&::after": {
                content: '"↗︎"',
              },
            },
            h1: {
              fontWeight: theme("fontWeight.semibold"),
              fontSize: theme("fontSize.3xl"),
              marginTop: theme("spacing.10"),
            },
            pre: {
              padding: 5,
            },
            code: {
              overflowWrap: "break-word",
              wordBreak: "break-word",
            },
          },
        },
        dark: {
          css: {
            a: {
              color: theme("colors.white"),
              textDecoration: "underline",
            },
          },
        },
      }),
    },
  },
  safelist: [
    // Card component color classes (for blog color palette)
    {
      pattern:
        /^bg-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)(-light|-medium)?$/,
    },
    {
      pattern: /^text-(ivory|oat|cream|cactus|sage|lavender|terracotta|coral)$/,
    },
    {
      pattern: /^text-(cactus|sage|lavender|terracotta|coral)$/,
    },
    ...(tremorThemeModule.safelist || []),
    ...(claudeThemeModule.safelist || []),
  ],
  plugins: [
    ...(tremorThemeModule.plugins || []),
    addVariablesForColors,
  ],
  darkMode: ["class", 'html[class~="dark"]'],
};

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
// https://ui.aceternity.com/components/background-boxes
function addVariablesForColors({ addBase, theme }) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
