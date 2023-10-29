import type { CloudinaryImage, ImageProps } from '../interfaces';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Returns Cloudinary image URL
 *
 * @param image - Image object
 * @param scale - Image width (this will be ignored if attributes is provided)
 * @param attributes - Image attributes
 * @returns Image URL
 */
export const cloudinaryImageUrl = (
  image:
    | Pick<CloudinaryImage, 'public_id' | 'format'>
    | Pick<ImageProps, 'publicId' | 'format'>,
  scale = 720,
  attributes = '',
) => {
  const { format } = image;
  const publicId = 'public_id' in image ? image.public_id : image.publicId;

  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (attributes) {
    return `${prefix}/${attributes}/${publicId}.${format}`;
  }

  if (scale < 0) {
    return `${prefix}/${publicId}.${format}`;
  }

  return `${prefix}/c_scale,w_${scale}/${publicId}.${format}`;
};

export default cloudinaryImageUrl;
