import { generateBlurDataURL } from "@/lib/ImageOptimization";
import { formatFeedCaption } from "@/lib/MetadataFormatters";
import type { Photo } from "@/lib/photo-provider";
import PhotoMetadata from "./PhotoMetadata";

interface PhotoFeedProps {
  photos: Photo[];
}

/**
 * PhotoFeed: A single-column photo stream component
 * Displays photos sequentially with captions, similar to a blog post format
 */
export default function PhotoFeed({ photos }: PhotoFeedProps) {
  if (photos.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-neutral-600 dark:text-neutral-400">
          No photos available in the feed.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-8 sm:px-6 lg:px-8">
      {photos.map((photo, index) => {
        const caption = formatFeedCaption(photo);
        const blurDataURL = generateBlurDataURL(photo);
        const isPriority = index < 2; // Priority load first 2 images

        return (
          <figure
            key={photo.id}
            className="group"
            itemScope
            itemType="https://schema.org/ImageObject"
          >
            <div className="relative overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <img
                src={photo.urls.regular}
                alt={photo.alt_description || photo.description || "Photo"}
                width={photo.width}
                height={photo.height}
                className="h-auto w-full"
                loading={isPriority ? "eager" : "lazy"}
                style={
                  blurDataURL
                    ? {
                        backgroundImage: `url(${blurDataURL})`,
                        backgroundSize: "cover",
                      }
                    : undefined
                }
                itemProp="contentUrl"
              />
            </div>

            <div className="mt-4">
              <figcaption className="flex items-center justify-center gap-2 text-center text-base leading-relaxed text-neutral-700 dark:text-neutral-300 sm:text-lg">
                <span>{caption}</span>
                <PhotoMetadata photo={photo} />
              </figcaption>
            </div>

            {/* Schema.org metadata */}
            {photo.user && (
              <>
                <meta itemProp="creator" content={photo.user.name} />
                <meta itemProp="creditText" content={photo.user.name} />
                <meta itemProp="copyrightNotice" content={photo.user.name} />
              </>
            )}
            <meta itemProp="datePublished" content={photo.created_at} />
          </figure>
        );
      })}
    </div>
  );
}
