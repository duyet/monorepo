import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { extractExifData, extractPhotoDate } from '@/lib/exifExtractor'
import {
  ensureDirectories,
  addLocalPhoto,
  getPhotosPaths,
  generateUniqueFilename,
} from '@/lib/localPhotos'
import { LocalPhoto } from '@/lib/types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Ensure directories exist
    ensureDirectories()

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Extract EXIF data
    const exif = await extractExifData(buffer)

    // Get image metadata using sharp
    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const thumbFilename = `thumb_${filename}`

    // Get paths
    const { photosDir, thumbsDir } = getPhotosPaths()
    const photoPath = path.join(photosDir, filename)
    const thumbPath = path.join(thumbsDir, thumbFilename)

    // Save original image
    await writeFile(photoPath, buffer)

    // Generate thumbnail (max 400px width, maintain aspect ratio)
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: 80 })
      .toBuffer()

    await writeFile(thumbPath, thumbnailBuffer)

    // Generate smaller sizes
    const smallBuffer = await sharp(buffer)
      .resize(800, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: 85 })
      .toBuffer()

    const regularBuffer = await sharp(buffer)
      .resize(1920, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    // Save resized versions
    const smallFilename = `small_${filename}`
    const regularFilename = `regular_${filename}`

    await writeFile(path.join(photosDir, smallFilename), smallBuffer)
    await writeFile(path.join(photosDir, regularFilename), regularBuffer)

    // Extract location from GPS data if available
    let location
    if (exif?.gps?.latitude && exif?.gps?.longitude) {
      location = {
        position: {
          latitude: exif.gps.latitude,
          longitude: exif.gps.longitude,
        },
      }
    }

    // Create photo object
    const photoId = uuidv4()
    const createdAt = extractPhotoDate(exif)

    const photo: LocalPhoto = {
      id: photoId,
      source: 'local',
      filename,
      originalName: file.name,
      created_at: createdAt,
      updated_at: new Date().toISOString(),
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: file.size,
      mimeType: file.type,
      urls: {
        raw: `/photos/${filename}`,
        full: `/photos/${filename}`,
        regular: `/photos/${regularFilename}`,
        small: `/photos/${smallFilename}`,
        thumb: `/photos/thumbs/${thumbFilename}`,
      },
      exif,
      location,
      description: exif?.description || exif?.userComment,
      alt_description: formData.get('description') as string | undefined,
      stats: {
        views: 0,
        downloads: 0,
      },
    }

    // Save to metadata file
    addLocalPhoto(photo)

    return NextResponse.json(
      {
        success: true,
        photo,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to upload photo',
      },
      { status: 500 }
    )
  }
}

// Disable body parsing to allow file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
