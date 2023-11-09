import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import type { ImageProps } from '../../../interfaces';
import { getImages } from '../../../utils/cloudinary';
import SharedModal from '../../../components/shared-modal';

interface PhotoPageProps {
  params: {
    id: string;
  };
}

const getPhoto = (
  photos: ImageProps[],
  id: ImageProps['id'],
  offset = 0,
): ImageProps => {
  const currentIndex = photos.findIndex((image) => image.id === id);

  if (currentIndex === -1) {
    return photos[0];
  }

  return photos[currentIndex + offset];
};

export async function generateMetadata(
  { params }: PhotoPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // read route params
  const id = params.id;

  const photos = await getImages();
  const currentPhoto = getPhoto(photos, id);

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: currentPhoto.filename,
    openGraph: {
      images: [currentPhoto.dataUrl, ...previousImages],
    },
  };
}

export async function generateStaticParams() {
  const photos = await getImages();

  return photos.map((photo: ImageProps) => ({
    slug: photo.id,
  }));
}

export default async function Page({ params: { id } }: PhotoPageProps) {
  const photos: ImageProps[] = await getImages();
  const currentPhoto = getPhoto(photos, id);
  const nextPhoto = getPhoto(photos, id, -1);
  const previousPhoto = getPhoto(photos, id, 1);

  return (
    <main className="mx-auto max-w-[1960px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute inset-0 z-30 cursor-default bg-black backdrop-blur-2xl">
          <Image
            alt="blurred background"
            className="pointer-events-none h-full w-full"
            fill
            priority
            src={currentPhoto.blurDataUrl}
          />
        </div>
        <SharedModal
          currentPhoto={currentPhoto}
          images={photos}
          nextPhoto={nextPhoto}
          previousPhoto={previousPhoto}
        />
      </div>
    </main>
  );
}
