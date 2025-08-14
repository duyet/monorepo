"use client";

import { ReactElement, JSXElementConstructor, useEffect, useState } from "react";
import { Auth0Provider } from "@auth0/auth0-react";

export default function Providers({
  children,
}: {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const redirect_uri = isClient ? window.location.origin : "";

  // Don't render Auth0Provider during SSR
  if (!isClient) {
    return children;
  }

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
