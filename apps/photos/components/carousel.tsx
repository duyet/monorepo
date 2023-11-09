'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ImageProps } from '../interfaces';
import { useLastViewedPhoto } from '../hooks/use-last-viewed-photo';
import { useKeyPress } from '../hooks/use-keypress';
import SharedModal from './shared-modal';

export default function Carousel({
  index,
  currentPhoto,
}: {
  index: string;
  currentPhoto: ImageProps;
}) {
  const router = useRouter();
  const [, setLastViewedPhoto] = useLastViewedPhoto();

  function closeModal() {
    setLastViewedPhoto(currentPhoto.id);
    router.push('/');
  }

  function changePhotoId(newVal: number) {
    return newVal;
  }

  useKeyPress('Escape', () => {
    closeModal();
  });

  return (
    <div className="inset-0 flex items-center justify-center">
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
        changePhotoId={changePhotoId}
        closeModal={closeModal}
        currentPhoto={currentPhoto}
        index={index}
        navigation={false}
      />
    </div>
  );
}
