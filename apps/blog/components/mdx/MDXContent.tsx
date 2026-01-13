"use client";

import React, { useMemo } from 'react';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import { MDX_COMPONENTS } from './MDXComponentRegistry';

// Import recharts styles dynamically
// This is needed for the WakaTimeChart component
import 'recharts/styles.css';

export interface MDXContentProps {
  content: string;
  components?: Record<string, React.ComponentType<any>>;
  scope?: Record<string, any>;
}

/**
 * MDXContent - Client-side component for rendering MDX content with interactive components
 */
export const MDXContent: React.FC<MDXContentProps> = ({
  content,
  components = {},
  scope = {},
}) => {
  const [serialized, setSerialized] = React.useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const serializeContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Serialize the MDX content
        const result = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [],
            rehypePlugins: [],
            format: 'mdx',
          },
          parseFrontmatter: false,
        });

        setSerialized(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to serialize MDX content');
        console.error('MDX Serialization Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (content) {
      serializeContent();
    }
  }, [content]);

  const mergedComponents = useMemo(() => ({
    ...MDX_COMPONENTS,
    ...components,
  }), [components]);

  if (loading) {
    return <div className="animate-pulse bg-gray-100 rounded p-4">Loading MDX content...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
        <strong>MDX Error:</strong> {error}
      </div>
    );
  }

  if (!serialized) {
    return <div>No content to display</div>;
  }

  return (
    <MDXRemote
      {...serialized}
      components={mergedComponents}
      scope={scope}
    />
  );
};