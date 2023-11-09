'use client';

import {
  ArrowTopRightOnSquareIcon,
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { variants } from '../utils/animation-variants';
import type { ImageProps } from '../interfaces';
import getCloudinaryImageUrl from '../utils/cloudinary-url';
import { useKeyPress } from '../hooks/use-keypress';

interface SharedModalProps {
  photos?: ImageProps[];
  currentPhoto: ImageProps;
  nextPhoto?: ImageProps;
  previousPhoto?: ImageProps;
  direction?: number;
}

export default function SharedModal({
  photos,
  currentPhoto,
  nextPhoto,
  previousPhoto,
  direction,
}: SharedModalProps) {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  // TODO: Get 15 photos before and after the current image
  const filteredPhotos = photos;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      router.push(`/p/${nextPhoto?.id}`);
    },
    onSwipedRight: () => {
      router.push(`/p/${previousPhoto?.id}`);
    },
    trackMouse: true,
  });

  useKeyPress('Escape', () => {
    router.push('/');
  });

  useKeyPress('ArrowLeft', () => {
    router.push(`/p/${previousPhoto?.id}`);
  });

  useKeyPress('ArrowRight', () => {
    router.push(`/p/${nextPhoto?.id}`);
  });

  const numPhotos = photos?.length || 0;

  return (
    <MotionConfig
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div
        className="relative z-50 flex aspect-[3/2] w-full max-w-7xl items-center wide:h-full xl:taller-than-854:h-auto"
        {...handlers}
      >
        {/* Main image */}
        <div className="w-full overflow-hidden">
          <div className="relative flex aspect-[3/2] items-center justify-center">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                animate="center"
                className="absolute"
                custom={direction}
                exit="exit"
                initial="enter"
                variants={variants}
              >
                <Image
                  alt={currentPhoto.filename}
                  height={1280}
                  onLoadingComplete={() => {
                    setLoaded(true);
                  }}
                  priority
                  src={getCloudinaryImageUrl(currentPhoto)}
                  width={1920}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Buttons + bottom nav bar */}
        <div className="absolute inset-0 mx-auto flex max-w-7xl items-center justify-center">
          {/* Buttons */}
          {loaded ? (
            <div className="relative aspect-[3/2] max-h-full w-full">
              {Boolean(previousPhoto) && (
                <button
                  className="absolute left-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                  onClick={() => {
                    router.push(`/p/${previousPhoto?.id}`);
                  }}
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                  type="button"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
              )}

              {Boolean(nextPhoto) && (
                <button
                  className="absolute right-3 top-[calc(50%-16px)] rounded-full bg-black/50 p-3 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white focus:outline-none"
                  onClick={() => {
                    router.push(`/p/${nextPhoto?.id}`);
                  }}
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                  type="button"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              )}

              <div className="absolute top-0 right-0 flex items-center gap-2 p-3 text-white">
                <a
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                  href={getCloudinaryImageUrl(currentPhoto, -1)}
                  rel="noreferrer"
                  target="_blank"
                  title="Open fullsize version"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
              </div>
              <div className="absolute top-0 left-0 flex items-center gap-2 p-3 text-white">
                <button
                  className="rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
                  type="button"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}

          {/* Bottom Nav bar */}
          <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden bg-gradient-to-b from-black/0 to-black/60">
            <motion.div
              className="mx-auto mt-6 mb-6 flex aspect-[3/2] h-14"
              initial={false}
            >
              <AnimatePresence initial={false}>
                {filteredPhotos?.map(({ publicId, format, id }) => (
                  <motion.button
                    animate={{
                      scale: id === currentPhoto.id ? 1.25 : 1,
                      width: '100%',
                      x: `${Math.max(1 * -100, 15 * -100)}%`,
                    }}
                    className={`${
                      id === currentPhoto.id
                        ? 'z-20 rounded-md shadow shadow-black/50'
                        : 'z-10'
                    } ${id === 0 ? 'rounded-l-md' : ''} ${
                      id === numPhotos - 1 ? 'rounded-r-md' : ''
                    } relative inline-block w-full shrink-0 transform-gpu overflow-hidden focus:outline-none`}
                    exit={{ width: '0%' }}
                    initial={{
                      width: '0%',
                      x: `${Math.max((1 - 1) * -100, 15 * -100)}%`,
                    }}
                    key={id}
                    onClick={() => {
                      router.push(`/p/${id}`);
                    }}
                  >
                    <Image
                      alt="small photos on the bottom"
                      className={`${
                        id === currentPhoto.id
                          ? 'brightness-110 hover:brightness-110'
                          : 'brightness-50 contrast-125 hover:brightness-75'
                      } h-full transform object-cover transition`}
                      height={120}
                      src={getCloudinaryImageUrl({ publicId, format }, 180)}
                      width={180}
                    />
                  </motion.button>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
