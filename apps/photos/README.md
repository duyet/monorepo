# Photos App - Photography Portfolio with Local Upload

A Next.js 15 photography portfolio application that displays photos from both Unsplash and local uploads, with comprehensive EXIF metadata inspection and a beautiful masonry gallery layout.

## Features

### 🖼️ Dual Photo Sources
- **Unsplash Integration**: Automatically fetches photos from your Unsplash profile
- **Local Uploads**: Upload and host photos directly in the public folder
- **Unified Timeline**: Both sources are merged and sorted chronologically

### 📸 EXIF Metadata Extraction
- Comprehensive metadata extraction from uploaded photos:
  - Camera information (make, model, lens)
  - Shooting parameters (aperture, shutter speed, ISO, focal length)
  - GPS location data (latitude, longitude, altitude)
  - Date and time information
  - Image properties (dimensions, color space, orientation)
  - Additional metadata (software, copyright, artist)

### 🎨 User Interface
- **Drag & Drop Upload**: Simple drag-and-drop interface for uploading photos
- **Masonry Grid Layout**: Responsive grid with 1-4 columns based on screen size
- **Lightbox Viewer**: Full-screen photo viewer with navigation
- **Detailed Metadata Panel**: View all photo metadata in the lightbox
- **Dark Mode Support**: Automatic dark/light theme support

### 🔍 Photo Inspection
- View comprehensive EXIF data for local photos
- GPS coordinates display for geotagged photos
- File information (size, type, dimensions)
- Camera settings and technical details
- Extended EXIF information (exposure mode, metering, flash, white balance)

## Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Runtime Mode**: Server-Side Rendering (SSR)
- **Image Processing**: Sharp
- **EXIF Extraction**: ExifReader
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Layout**: React Masonry CSS

### Directory Structure

```
apps/photos/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # Photo upload endpoint
│   │   └── photos/[id]/route.ts     # Photo management API
│   ├── page.tsx                      # Main gallery page
│   └── [year]/page.tsx               # Year-filtered gallery
├── components/
│   ├── PhotoUploader.tsx             # Drag & drop upload UI
│   ├── PhotoGrid.tsx                 # Masonry grid display
│   ├── PhotoCard.tsx                 # Individual photo cards
│   ├── Lightbox.tsx                  # Photo viewer
│   └── LightboxControls.tsx          # Lightbox controls & metadata display
├── lib/
│   ├── types.ts                      # TypeScript interfaces
│   ├── localPhotos.ts                # Local photo storage service
│   ├── exifExtractor.ts              # EXIF metadata extraction
│   ├── unsplash.ts                   # Unsplash API integration
│   ├── MetadataFormatters.ts         # Metadata formatting utilities
│   └── ImageOptimization.ts          # Image optimization utilities
└── public/
    └── photos/
        ├── metadata.json             # Photo metadata database
        └── thumbs/                   # Thumbnail storage
```

## API Endpoints

### POST /api/upload
Upload a photo with automatic metadata extraction.

**Request**: `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP)

**Response**:
```json
{
  "success": true,
  "photo": {
    "id": "uuid",
    "source": "local",
    "filename": "generated_filename.jpg",
    "created_at": "ISO date",
    "width": 4032,
    "height": 3024,
    "exif": { /* comprehensive EXIF data */ },
    "urls": {
      "raw": "/photos/filename.jpg",
      "full": "/photos/filename.jpg",
      "regular": "/photos/regular_filename.jpg",
      "small": "/photos/small_filename.jpg",
      "thumb": "/photos/thumbs/thumb_filename.jpg"
    }
  }
}
```

### GET /api/photos/[id]
Get metadata for a specific photo.

### PATCH /api/photos/[id]
Update photo metadata (description, tags, location).

**Request**:
```json
{
  "description": "New description",
  "alt_description": "Alt text",
  "tags": ["landscape", "sunset"],
  "location": {
    "name": "Location name",
    "city": "City",
    "country": "Country"
  }
}
```

### DELETE /api/photos/[id]
Delete a photo and its files.

## Data Storage

### Local Photos
- **Files**: Stored in `public/photos/` directory
- **Thumbnails**: Stored in `public/photos/thumbs/`
- **Metadata**: Stored in `public/photos/metadata.json`

### Metadata Structure
```json
{
  "id": "uuid",
  "source": "local",
  "filename": "photo_123456789_abc123.jpg",
  "originalName": "IMG_1234.jpg",
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z",
  "width": 4032,
  "height": 3024,
  "size": 5242880,
  "mimeType": "image/jpeg",
  "urls": { /* ... */ },
  "exif": {
    "make": "Apple",
    "model": "iPhone 15 Pro",
    "lensModel": "iPhone 15 Pro back triple camera",
    "exposureTime": "1/100",
    "fNumber": "1.8",
    "iso": 64,
    "focalLength": "6.86",
    "dateTimeOriginal": "2024:01:01 12:00:00",
    "gps": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  },
  "location": {
    "position": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

## Image Processing

When a photo is uploaded, the following sizes are generated:

1. **Original**: Saved as-is
2. **Regular**: Resized to max 1920px width (90% quality)
3. **Small**: Resized to max 800px width (85% quality)
4. **Thumb**: Resized to max 400px width (80% quality)

All resized images maintain aspect ratio and use JPEG compression.

## Usage

### Development
```bash
# Start development server
cd apps/photos
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Environment Variables
Required in `turbo.json` or `.env`:
```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### Upload Limitations
- **Max file size**: 50MB
- **Allowed formats**: JPEG, JPG, PNG, WebP
- **Auto-generated sizes**: 4 versions per photo

## Type Definitions

### Photo Types
```typescript
// Unified photo type supporting both sources
type Photo =
  | (UnsplashPhoto & { source: 'unsplash' })
  | LocalPhoto

// Local photo interface
interface LocalPhoto {
  id: string
  source: 'local'
  filename: string
  originalName: string
  created_at: string
  width: number
  height: number
  exif?: DetailedExif
  location?: {
    position?: {
      latitude: number
      longitude: number
    }
  }
  urls: PhotoURLs
}

// Detailed EXIF metadata
interface DetailedExif {
  make?: string
  model?: string
  lensModel?: string
  exposureTime?: string
  fNumber?: string | number
  iso?: number
  focalLength?: string | number
  dateTimeOriginal?: string
  gps?: {
    latitude?: number
    longitude?: number
    altitude?: number
  }
  // ... and many more fields
}
```

## UI Components

### PhotoUploader
Drag-and-drop upload component with progress tracking.

```tsx
<PhotoUploader
  onUploadSuccess={(photo) => console.log('Uploaded:', photo)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

### PhotoGrid
Masonry grid layout for displaying photos.

```tsx
<PhotoGrid photos={photos} />
```

### Lightbox
Full-screen photo viewer with metadata panel.

```tsx
<Lightbox
  photo={photo}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onNext={() => goToNext()}
  onPrevious={() => goToPrevious()}
  currentIndex={currentIndex}
  totalCount={totalCount}
/>
```

## Features in Detail

### EXIF Metadata Inspection
All uploaded photos are processed to extract comprehensive metadata:
- **Camera Info**: Make, model, lens information
- **Settings**: Aperture, shutter speed, ISO, focal length
- **GPS Data**: Coordinates, altitude with degree precision
- **Timing**: Original capture time, digitization time
- **Technical**: Color space, orientation, white balance
- **Creative**: Exposure mode, metering mode, scene type

### Photo Timeline
Photos from both Unsplash and local uploads are:
- Merged into a single timeline
- Sorted by capture date (newest first)
- Grouped by year for filtering
- Displayed with source indicators

### Metadata Display
- **Compact View**: Date, dimensions, stats on photo cards
- **Lightbox View**: Full metadata panel with all EXIF data
- **Extended EXIF**: Additional details for local photos
- **Source Indicator**: Visual differentiation between sources

## Contributing

When adding new features:
1. Update TypeScript interfaces in `lib/types.ts`
2. Add new API endpoints in `app/api/`
3. Update metadata formatters if needed
4. Test with various photo formats and EXIF data

## License

Part of the duyet.net monorepo.
