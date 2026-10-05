import { describe, expect, test } from "vitest";
import { cloudinaryToPhoto } from "@/lib/cloudinary-provider";
import type { CloudinaryPhoto } from "@/lib/types";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

const input: CloudinaryPhoto = {
  asset_id: "asset-1",
  public_id: "folder/shot",
  created_at: "2024-05-01T00:00:00Z",
  updated_at: "2024-05-02T00:00:00Z",
  width: 1000,
  height: 800,
  format: "jpg",
  bytes: 1234,
  tags: ["street"],
  secure_url: "https://res.cloudinary.com/demo/image/upload/folder/shot.jpg",
  colors: [["#112233", 0.4]],
  context: {
    custom: {
      caption: "A street",
      alt: "Street photo",
      location: { name: "Old Quarter", city: "Hanoi", country: "Vietnam" },
    },
  },
  image_metadata: {
    Make: "Fujifilm",
    Model: "X100V",
    ExposureTime: "1/250",
    FNumber: "2.0",
    FocalLength: "23mm",
    ISO: 320,
  },
};

describe("cloudinaryToPhoto", () => {
  test("maps a small Cloudinary resource to a Photo", () => {
    const photo = cloudinaryToPhoto(input);

    expect(photo).toMatchObject({
      id: "asset-1",
      provider: "cloudinary",
      created_at: "2024-05-01T00:00:00Z",
      width: 1000,
      height: 800,
      color: "#112233",
      blur_hash: null,
      description: "A street",
      alt_description: "Street photo",
      format: "jpg",
      bytes: 1234,
      tags: ["street"],
      likes: 0,
      location: { name: "Old Quarter", city: "Hanoi", country: "Vietnam" },
      exif: {
        make: "Fujifilm",
        model: "X100V",
        exposure_time: "1/250",
        aperture: "2.0",
        focal_length: "23mm",
        iso: 320,
      },
      user: { id: "cloudinary", username: "cloudinary", name: "Cloudinary" },
    });
    const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
    expect(photo.urls).toEqual({
      raw: `${base}/folder/shot`,
      full: `${base}/f_auto,q_90/folder/shot`,
      regular: `${base}/f_auto,w_1080,q_80/folder/shot`,
      small: `${base}/f_auto,w_400,q_80/folder/shot`,
      thumb: `${base}/f_auto,w_200,h_200,c_fill,q_80/folder/shot`,
    });
    expect(photo.links).toEqual({
      html: input.secure_url,
      download: input.secure_url,
    });
  });
});
