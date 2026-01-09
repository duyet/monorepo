"use client";

import { useMemo } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { mdxComponents } from "./mdx-components";

interface MDXContentProps {
  code: string;
}

export function MDXContent({ code }: MDXContentProps) {
  const Content = useMemo(() => {
    // The compiled MDX code expects these runtime functions with underscore prefix
    const scope = {
      _jsx: jsxRuntime.jsx,
      _jsxs: jsxRuntime.jsxs,
      _Fragment: jsxRuntime.Fragment,
    };

    // Create a function that will execute the compiled MDX code
    const fn = new Function(...Object.keys(scope), code);
    const result = fn(...Object.values(scope));

    return result.default || result;
  }, [code]);

  return <Content components={mdxComponents} />;
}
