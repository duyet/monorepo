import { theme as tremorTheme, plugins as tremorPlugins, safelist as tremorSafelist } from "./tremor.theme.mjs";
import { theme as shadcnTheme } from "./shadcn.theme.mjs";
import colors from "./colors.js";
import deepmerge from "deepmerge";
import typography from "@tailwindcss/typography";
import highlightjs from "tailwind-highlightjs";
import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./packages/components/**/*.{js,ts,jsx,tsx}",
    "./apps/**/src/**/*.{js,ts,jsx,tsx}",
    "./apps/**/app/**/*.{js,ts,jsx,tsx}",
    "./apps/**/components/**/*.{js,ts,jsx,tsx}",
    "./apps/**/pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: deepmerge(tremorTheme, {
    ...shadcnTheme,
    extend: {
      colors: {
        ...shadcnTheme.colors,
        ...colors,
      },
    },
  }),
  plugins: [
    ...tremorPlugins,
    typography,
    highlightjs,
    animate,
  ],
  safelist: [...tremorSafelist],
};
