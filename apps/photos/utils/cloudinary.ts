import { v2 as cloudinary } from 'cloudinary';
import type { ImageProps, CloudinaryImage } from '../interfaces';
import getCloudinaryImageUrl from './cloudinary-url';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const getImages = async (maxResults = 400) => {
  const results = (await cloudinary.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(maxResults)
    .execute()) as { resources: CloudinaryImage[] };

  const reducedResults: ImageProps[] = [];

  for (const result of results.resources) {
    reducedResults.push({
      id: result.asset_id,
      filename: result.filename,
      height: result.height,
      width: result.width,
      publicId: result.public_id,
      format: result.format,
      dataUrl: getCloudinaryImageUrl(result),
      blurDataUrl: getCloudinaryImageUrl(result, 0, 'w_8,h_8,q_70'),
    });
  }

  return reducedResults;
};

export default cloudinary;
