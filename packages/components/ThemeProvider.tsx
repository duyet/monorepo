"use client";

import { ThemeProvider, type ThemeProviderProps } from "next-themes";

/** Light is `:root`. Only add `.dark` when the user saved dark. */
export const THEME_BOOT_SCRIPT = `(function(){try{var r=document.documentElement;if(localStorage.getItem("theme")==="dark"){r.classList.add("dark");r.style.colorScheme="dark";}else{r.classList.remove("dark");r.style.colorScheme="light";}}catch(e){}})();`;

export function duyetThemeHeadScripts(): Array<{ children: string }> {
  return [{ children: THEME_BOOT_SCRIPT }];
}

export default function Providers({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <ThemeProvider
      defaultTheme="light"
      attribute="class"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}
