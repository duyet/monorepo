import sharedConfig from "@duyet/tailwind-config/tailwind.config.mjs";

/** @type {import('tailwindcss').Config} */
export default {
  ...sharedConfig,
  theme: {
    ...sharedConfig.theme,
    extend: {
      ...sharedConfig.theme?.extend,
    },
  },
};
