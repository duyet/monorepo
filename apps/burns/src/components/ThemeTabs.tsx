import { useTheme } from "@duyet/components/ThemeProvider";
import { type JSX, useEffect, useState } from "react";
import { TextTabs } from "./TextTabs";

const THEMES = [
  { key: "light", label: "Light" },
  { key: "system", label: "Auto" },
  { key: "dark", label: "Dark" },
] as const;

type ThemeKey = (typeof THEMES)[number]["key"];

/** Light / Auto / Dark, on the app's next-themes provider. */
export function ThemeTabs(): JSX.Element {
  const { theme, setTheme } = useTheme();
  // The saved theme is only known in the browser; render the default until then
  // so hydration matches the prerendered HTML.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <TextTabs<ThemeKey>
      label="Theme"
      options={THEMES}
      value={mounted && theme ? (theme as ThemeKey) : "system"}
      onChange={setTheme}
    />
  );
}
