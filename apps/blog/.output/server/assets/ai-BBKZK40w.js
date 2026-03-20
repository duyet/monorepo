import { jsx, jsxs } from "react/jsx-runtime";
import { C as Container } from "./router-BL7fPxbg.js";
import "@tanstack/react-router";
import "react";
import "fs";
import "remark-math";
import "react-dom";
import "lucide-react";
import "next-themes";
function AI() {
  return /* @__PURE__ */ jsx("div", { className: "mb-16 space-y-6 leading-loose", children: /* @__PURE__ */ jsxs(Container, { className: "mb-8 max-w-2xl md:mb-16", children: [
    /* @__PURE__ */ jsx("h1", { className: "my-10 text-6xl font-bold lg:text-7xl", children: "AI" }),
    /* @__PURE__ */ jsxs("p", { children: [
      "None of the contents in my blog was written by an AI tool. I have used AI for ",
      /* @__PURE__ */ jsx("del", { children: "English sentences correction" }),
      ", now I use AI agent for English corrections and do the review."
    ] }),
    /* @__PURE__ */ jsx("p", { children: "I use different LLM tools for coding, mostly Claude Code + NeoVim." }),
    /* @__PURE__ */ jsx("p", { children: "Latest: Claude Code, opencode, ZAI, Grok." })
  ] }) });
}
export {
  AI as component
};
