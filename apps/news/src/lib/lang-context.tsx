import { createContext, useContext } from "react";
import type { Lang } from "./types";

export const LangContext = createContext<Lang>("en");

export function useLang(): Lang {
  return useContext(LangContext);
}
