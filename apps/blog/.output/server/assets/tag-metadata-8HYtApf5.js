const colorRotation = [
  "sage",
  "lavender",
  "cactus",
  "coral",
  "terracotta",
  "oat",
  "cream",
  "ivory"
];
const illustrationRotation = [
  "geometric",
  "blob",
  "wavy"
];
function getTagMetadata(tagName, postCount = 0, index = 0) {
  const color = colorRotation[index % colorRotation.length];
  const illustration = illustrationRotation[index % illustrationRotation.length];
  const description = generateTagDescription(tagName, postCount);
  return {
    description,
    color,
    illustration
  };
}
function generateTagDescription(tagName, postCount) {
  const lowerTag = tagName.toLowerCase();
  const countText = postCount > 0 ? `${postCount} ${postCount === 1 ? "article" : "articles"} exploring` : "Deep dive into";
  const patterns = [
    // Programming languages
    {
      regex: /^(python|javascript|typescript|go|rust|java|scala|kotlin|ruby|php|c\+\+|c#)/i,
      template: (tag) => `${countText} ${tag} programming, patterns, and best practices`
    },
    // Frameworks & libraries
    {
      regex: /(react|vue|angular|svelte|next\.?js|django|flask|spring|express)/i,
      template: (tag) => `${countText} building applications with ${tag}`
    },
    // Data & ML
    {
      regex: /(machine learning|deep learning|data|analytics|bigquery|spark|flink|kafka|airflow)/i,
      template: (tag) => `${countText} ${tag} engineering and architecture`
    },
    // Cloud & Infrastructure
    {
      regex: /(aws|azure|gcp|cloud|kubernetes|docker|terraform|helm)/i,
      template: (tag) => `${countText} ${tag} infrastructure and deployment`
    },
    // Databases
    {
      regex: /(postgres|mysql|mongodb|redis|elasticsearch|clickhouse|cassandra)/i,
      template: (tag) => `${countText} ${tag} optimization and design patterns`
    },
    // Tools & Practices
    {
      regex: /(git|ci\/cd|testing|monitoring|observability|performance)/i,
      template: (tag) => `${countText} ${tag} techniques and workflows`
    },
    // Career & Soft Skills
    {
      regex: /(career|interview|leadership|management|productivity)/i,
      template: (tag) => `${countText} ${tag} insights and experiences`
    }
  ];
  for (const { regex, template } of patterns) {
    if (regex.test(lowerTag)) {
      return template(tagName);
    }
  }
  return `${countText} ${tagName.toLowerCase()}`;
}
function getTagColorClass(color, variant = "light") {
  const colorMap = {
    ivory: variant === "light" ? "bg-ivory" : "bg-ivory-medium",
    oat: variant === "light" ? "bg-oat-light" : "bg-oat",
    cream: variant === "light" ? "bg-cream" : "bg-cream-warm",
    cactus: variant === "light" ? "bg-cactus-light" : "bg-cactus",
    sage: variant === "light" ? "bg-sage-light" : "bg-sage",
    lavender: variant === "light" ? "bg-lavender-light" : "bg-lavender",
    terracotta: variant === "light" ? "bg-terracotta-light" : "bg-terracotta",
    coral: variant === "light" ? "bg-coral-light" : "bg-coral"
  };
  return colorMap[color];
}
export {
  getTagColorClass as a,
  getTagMetadata as g
};
