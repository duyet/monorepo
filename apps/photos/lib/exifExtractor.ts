import ExifReader from 'exifreader'
import { DetailedExif } from './types'

/**
 * Extract EXIF metadata from an image buffer
 */
export async function extractExifData(
  buffer: Buffer
): Promise<DetailedExif | undefined> {
  try {
    const tags = ExifReader.load(buffer, { expanded: true })

    if (!tags) {
      return undefined
    }

    const exif: DetailedExif = {}

    // Camera information
    if (tags.exif?.Make) {
      exif.make = tags.exif.Make.description || String(tags.exif.Make.value)
    }
    if (tags.exif?.Model) {
      exif.model = tags.exif.Model.description || String(tags.exif.Model.value)
    }
    if (tags.exif?.LensModel) {
      exif.lensModel =
        tags.exif.LensModel.description || String(tags.exif.LensModel.value)
    }

    // Shooting parameters
    if (tags.exif?.ExposureTime) {
      exif.exposureTime =
        tags.exif.ExposureTime.description ||
        String(tags.exif.ExposureTime.value)
    }
    if (tags.exif?.FNumber) {
      exif.fNumber =
        tags.exif.FNumber.description || Number(tags.exif.FNumber.value)
    }
    if (tags.exif?.ApertureValue) {
      exif.aperture =
        tags.exif.ApertureValue.description ||
        String(tags.exif.ApertureValue.value)
    }
    if (tags.exif?.ISO) {
      exif.iso = Number(tags.exif.ISO.value)
    }
    if (tags.exif?.FocalLength) {
      exif.focalLength =
        tags.exif.FocalLength.description ||
        Number(tags.exif.FocalLength.value)
    }
    if (tags.exif?.FocalLengthIn35mmFormat) {
      exif.focalLengthIn35mm = Number(
        tags.exif.FocalLengthIn35mmFormat.value
      )
    }

    // Date and time
    if (tags.exif?.DateTime) {
      exif.dateTime =
        tags.exif.DateTime.description || String(tags.exif.DateTime.value)
    }
    if (tags.exif?.DateTimeOriginal) {
      exif.dateTimeOriginal =
        tags.exif.DateTimeOriginal.description ||
        String(tags.exif.DateTimeOriginal.value)
    }
    if (tags.exif?.DateTimeDigitized) {
      exif.dateTimeDigitized =
        tags.exif.DateTimeDigitized.description ||
        String(tags.exif.DateTimeDigitized.value)
    }

    // GPS location
    if (tags.gps) {
      exif.gps = {}

      if (tags.gps.Latitude !== undefined) {
        exif.gps.latitude = Number(tags.gps.Latitude)
      }
      if (tags.gps.Longitude !== undefined) {
        exif.gps.longitude = Number(tags.gps.Longitude)
      }
      if (tags.gps.Altitude !== undefined) {
        exif.gps.altitude = Number(tags.gps.Altitude)
      }
      if (tags.gps.LatitudeRef) {
        exif.gps.latitudeRef = String(tags.gps.LatitudeRef.value)
      }
      if (tags.gps.LongitudeRef) {
        exif.gps.longitudeRef = String(tags.gps.LongitudeRef.value)
      }
    }

    // Image properties
    if (tags.exif?.Orientation) {
      exif.orientation = Number(tags.exif.Orientation.value)
    }
    if (tags.file?.['Image Width']) {
      exif.width = Number(tags.file['Image Width'].value)
    }
    if (tags.file?.['Image Height']) {
      exif.height = Number(tags.file['Image Height'].value)
    }
    if (tags.exif?.ColorSpace) {
      exif.colorSpace =
        tags.exif.ColorSpace.description || String(tags.exif.ColorSpace.value)
    }
    if (tags.exif?.WhiteBalance) {
      exif.whiteBalance =
        tags.exif.WhiteBalance.description ||
        String(tags.exif.WhiteBalance.value)
    }

    // Additional metadata
    if (tags.exif?.Software) {
      exif.software =
        tags.exif.Software.description || String(tags.exif.Software.value)
    }
    if (tags.exif?.Artist) {
      exif.artist =
        tags.exif.Artist.description || String(tags.exif.Artist.value)
    }
    if (tags.exif?.Copyright) {
      exif.copyright =
        tags.exif.Copyright.description || String(tags.exif.Copyright.value)
    }
    if (tags.exif?.ImageDescription) {
      exif.description =
        tags.exif.ImageDescription.description ||
        String(tags.exif.ImageDescription.value)
    }
    if (tags.exif?.UserComment) {
      exif.userComment =
        tags.exif.UserComment.description ||
        String(tags.exif.UserComment.value)
    }

    // Shooting modes
    if (tags.exif?.ExposureMode) {
      exif.exposureMode =
        tags.exif.ExposureMode.description ||
        String(tags.exif.ExposureMode.value)
    }
    if (tags.exif?.ExposureProgram) {
      exif.exposureProgram =
        tags.exif.ExposureProgram.description ||
        String(tags.exif.ExposureProgram.value)
    }
    if (tags.exif?.MeteringMode) {
      exif.meteringMode =
        tags.exif.MeteringMode.description ||
        String(tags.exif.MeteringMode.value)
    }
    if (tags.exif?.Flash) {
      exif.flash =
        tags.exif.Flash.description || String(tags.exif.Flash.value)
    }
    if (tags.exif?.SceneCaptureType) {
      exif.sceneCaptureType =
        tags.exif.SceneCaptureType.description ||
        String(tags.exif.SceneCaptureType.value)
    }

    // Return undefined if no EXIF data was found
    if (Object.keys(exif).length === 0) {
      return undefined
    }

    return exif
  } catch (error) {
    console.error('Error extracting EXIF data:', error)
    return undefined
  }
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(
  latitude: number,
  longitude: number
): string {
  const latDirection = latitude >= 0 ? 'N' : 'S'
  const lonDirection = longitude >= 0 ? 'E' : 'W'

  const latAbs = Math.abs(latitude)
  const lonAbs = Math.abs(longitude)

  return `${latAbs.toFixed(6)}° ${latDirection}, ${lonAbs.toFixed(6)}° ${lonDirection}`
}

/**
 * Extract date from EXIF or file stats
 */
export function extractPhotoDate(exif?: DetailedExif): string {
  if (exif?.dateTimeOriginal) {
    // Convert EXIF date format (YYYY:MM:DD HH:MM:SS) to ISO
    const exifDate = exif.dateTimeOriginal.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
    const date = new Date(exifDate)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  if (exif?.dateTime) {
    const exifDate = exif.dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
    const date = new Date(exifDate)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  }

  // Fallback to current date
  return new Date().toISOString()
}
