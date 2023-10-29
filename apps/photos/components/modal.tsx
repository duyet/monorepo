'use client';

import { useRef, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ImageProps } from '../interfaces';
import { useKeyPress } from '../hooks/use-keypress';
import SharedModal from './shared-modal';

export default function Modal({
  images,
  onClose,
}: {
  images: ImageProps[];
  onClose?: () => void;
}) {
  const overlayRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const photoId = searchParams.get('photoId') || '0';
  const index = Number(photoId);

  const [direction, setDirection] = useState(0);
  const [curIndex, setCurIndex] = useState(index);

  function handleClose() {
    router.push('/');
    onClose && onClose();
  }

  function changePhotoId(newVal: number) {
    if (newVal > index) {
      setDirection(1);
    } else {
      setDirection(-1);
    }
    setCurIndex(newVal);
    router.push(`/p/${newVal}?photoId=${newVal}`);
  }

  useKeyPress('ArrowRight', () => {
    if (index + 1 < images.length) {
      changePhotoId(index + 1);
    }
  });

  useKeyPress('ArrowLeft', () => {
    if (index > 0) {
      changePhotoId(index - 1);
    }
  });

  return (
    <Dialog
      className="fixed inset-0 z-10 flex items-center justify-center"
      initialFocus={overlayRef}
      onClose={handleClose}
      open
      static
    >
      <Dialog.Overlay
        animate={{ opacity: 1 }}
        as={motion.div}
        className="fixed inset-0 z-30 bg-black/70 backdrop-blur-2xl"
        initial={{ opacity: 0 }}
        key="backdrop"
        ref={overlayRef}
      />
      <SharedModal
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        direction={direction}
        images={images}
        index={curIndex}
        navigation
      />
    </Dialog>
  );
}
