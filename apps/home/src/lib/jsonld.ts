/** JSON-LD builders for schema.org structured data on the homepage. */

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "duyet.net",
    url: "https://duyet.net",
    inLanguage: "en",
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Duyet",
    url: "https://duyet.net/",
    jobTitle: "Senior Data Engineer",
    sameAs: [
      "https://github.com/duyet",
      "https://linkedin.com/in/duyet",
      "https://x.com/_duyet",
    ],
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "duyet.net",
    url: "https://duyet.net",
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "me@duyet.net",
        url: "https://duyet.net/contact",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "VN",
    },
  };
}
