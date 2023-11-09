import type { ImageProps } from '../interfaces';
import getCloudinaryImageUrl from './cloudinary-url';

const cache = new Map<ImageProps, string>();

export default async function getBase64ImageUrl(
  image: ImageProps,
): Promise<string> {
  let url = cache.get(image);
  if (url) {
    return url;
  }

  const photoUrl = getCloudinaryImageUrl(image, 0, 'f_jpg,w_8,h_8,q_70');
  const response = await fetch(photoUrl);

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  url = `data:image/jpeg;base64,${base64}`;

  // Caching
  cache.set(image, url);

  return url;
}
