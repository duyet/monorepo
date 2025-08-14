"use client";

import { ReactElement, JSXElementConstructor } from "react";
import dynamic from "next/dynamic";

// Dynamically import Auth0Provider to avoid SSR issues
const Auth0Provider = dynamic(
  () => import("@auth0/auth0-react").then((mod) => mod.Auth0Provider),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function Providers({
  children,
}: {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}) {
  // For SSR, we need a fallback that doesn't use window
  const redirect_uri = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Auth0Provider
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ""}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ""}
      authorizationParams={{
        redirect_uri,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
