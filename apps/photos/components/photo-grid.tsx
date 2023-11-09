import Image from 'next/image';
import Link from 'next/link';
import type { ImageProps } from '../interfaces';
import getCloudinaryUrl from '../utils/cloudinary-url';

interface PhotoGridProps {
  images: ImageProps[];
}

export default function PhotoGrid({ images }: PhotoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {images.map((image: ImageProps) => (
        <Link
          as={`/p/${image.id}`}
          className="after:content group relative cursor-zoom-in after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
          href={`/p/${image.id}`}
          key={image.id}
          shallow
        >
          <Image
            alt={image.filename}
            blurDataURL={image.blurDataUrl}
            className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
            height={480}
            placeholder="blur"
            sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
            src={getCloudinaryUrl(image, 720, 'c_fill,w_720,h_480')}
            style={{ transform: 'translate3d(0, 0, 0)' }}
            width={720}
          />
        </Link>
      ))}
    </div>
  );
}
