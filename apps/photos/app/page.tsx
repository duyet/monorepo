import { getImages } from '../utils/cloudinary';
import PhotoGrid from '../components/photo-grid';
import type { ImageProps } from '../interfaces';

export const metadata = {
  title: 'Duyet Photos',
  description: '',
};

export default async function Page() {
  const images: ImageProps[] = await getImages(500);

  return (
    <main className="p-5 px-10">
      <PhotoGrid images={images} />
    </main>
  );
}
