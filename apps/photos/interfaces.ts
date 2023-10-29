export interface ImageProps {
  id: string;
  filename: string;
  height: number;
  width: number;
  publicId: string;
  format: string;
  dataUrl: string;
  blurDataUrl: string;
}

export interface CloudinaryImage {
  asset_id: string;
  filename: string;
  height: number;
  width: number;
  public_id: string;
  format: string;
}
