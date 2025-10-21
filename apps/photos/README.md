# Photos App - Photography Portfolio with Build-Time Metadata Extraction

A Next.js 15 photography portfolio application that displays photos from both Unsplash and local files, with comprehensive EXIF metadata inspection. Photos are scanned and metadata is extracted at build time for optimal performance.

## Features

### 🖼️ Dual Photo Sources
- **Unsplash Integration**: Automatically fetches photos from your Unsplash profile
- **Local Photos**: Place photos in `public/photos/` directory
- **Build-Time Scanning**: All local photos are scanned and metadata extracted during build
- **Unified Timeline**: Both sources are merged and sorted chronologically

### 📸 EXIF Metadata Extraction
- Comprehensive metadata extraction from local photos during build:
  - Camera information (make, model, lens)
  - Shooting parameters (aperture, shutter speed, ISO, focal length)
  - GPS location data (latitude, longitude, altitude)
  - Date and time information
  - Image properties (dimensions, color space, orientation)
  - Additional metadata (software, copyright, artist)

### 🎨 User Interface
- **Masonry Grid Layout**: Responsive grid with 1-4 columns based on screen size
- **Lightbox Viewer**: Full-screen photo viewer with navigation
- **Detailed Metadata Panel**: View all photo metadata in the lightbox
- **Dark Mode Support**: Automatic dark/light theme support
- **Static Export**: Fully static site with no server required

### 🔍 Photo Inspection
- View comprehensive EXIF data for local photos
- GPS coordinates display for geotagged photos
- File information (size, type, dimensions)
- Camera settings and technical details
- Extended EXIF information (exposure mode, metering, flash, white balance)

## Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router, Static Export)
- **Build Mode**: Static Site Generation (SSG)
- **Image Processing**: Sharp
- **EXIF Extraction**: ExifReader
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Layout**: React Masonry CSS

### Directory Structure

```
apps/photos/
├── app/
│   ├── page.tsx                      # Main gallery page
│   └── [year]/page.tsx               # Year-filtered gallery
├── components/
│   ├── PhotoGrid.tsx                 # Masonry grid display
│   ├── PhotoCard.tsx                 # Individual photo cards
│   ├── Lightbox.tsx                  # Photo viewer
│   └── LightboxControls.tsx          # Lightbox controls & metadata display
├── lib/
│   ├── types.ts                      # TypeScript interfaces
│   ├── localPhotos.ts                # Build-time photo scanner
│   ├── exifExtractor.ts              # EXIF metadata extraction
│   ├── unsplash.ts                   # Unsplash API integration
│   ├── MetadataFormatters.ts         # Metadata formatting utilities
│   └── ImageOptimization.ts          # Image optimization utilities
└── public/
    └── photos/                       # Place your photos here!
        └── .gitkeep
```

## How It Works

### Build-Time Photo Scanning

When you run `yarn build`, the application:

1. **Scans** `public/photos/` directory for image files (JPEG, PNG, WebP)
2. **Extracts** comprehensive EXIF metadata from each photo
3. **Processes** metadata to extract camera info, GPS coordinates, dates, etc.
4. **Merges** local photos with Unsplash photos into a unified timeline
5. **Generates** static HTML pages with all photo data pre-rendered

### Adding Photos

Simply place your photos in the `public/photos/` directory:

```bash
# Add photos to the public folder
cp ~/my-photos/*.jpg apps/photos/public/photos/

# Rebuild the site to scan and extract metadata
yarn build

# The photos will now appear in your gallery with full metadata!
```

### Photo Processing

At build time, for each photo in `public/photos/`:

1. File is read and analyzed
2. EXIF metadata is extracted using ExifReader
3. Image dimensions are determined using Sharp
4. GPS coordinates are parsed (if available)
5. Creation date is extracted from EXIF DateTimeOriginal
6. All metadata is compiled into a structured Photo object
7. Photos are merged with Unsplash photos and sorted by date

## Build-Time Scanner

### scanLocalPhotos()

The core function that scans photos during build:

```typescript
export async function scanLocalPhotos(): Promise<LocalPhoto[]> {
  // 1. Check if public/photos directory exists
  // 2. Read all files in the directory
  // 3. Filter for image files (.jpg, .jpeg, .png, .webp)
  // 4. For each image:
  //    - Read file buffer
  //    - Extract EXIF metadata
  //    - Get image dimensions
  //    - Parse GPS coordinates
  //    - Extract creation date
  //    - Compile into Photo object
  // 5. Return array of all processed photos
}
```

Build output will show:
```
Found 15 photos in public/photos directory
Processed: IMG_1234.jpg (4032x3024)
Processed: IMG_1235.jpg (4032x3024)
...
Successfully processed 15 local photos
```

## Data Structure

### Local Photo Metadata

Each scanned photo generates:

```typescript
{
  id: "uuid",
  source: "local",
  filename: "IMG_1234.jpg",
  originalName: "IMG_1234.jpg",
  created_at: "2024-01-01T12:00:00.000Z",  // from EXIF
  updated_at: "2024-01-15T10:30:00.000Z",  // file mtime
  width: 4032,
  height: 3024,
  size: 5242880,  // bytes
  mimeType: "image/jpeg",
  urls: {
    raw: "/photos/IMG_1234.jpg",
    full: "/photos/IMG_1234.jpg",
    regular: "/photos/IMG_1234.jpg",
    small: "/photos/IMG_1234.jpg",
    thumb: "/photos/IMG_1234.jpg"
  },
  exif: {
    make: "Apple",
    model: "iPhone 15 Pro",
    lensModel: "iPhone 15 Pro back triple camera",
    exposureTime: "1/100",
    fNumber: "1.8",
    iso: 64,
    focalLength: "6.86",
    dateTimeOriginal: "2024:01:01 12:00:00",
    gps: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 10
    }
  },
  location: {
    position: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  }
}
```

## Usage

### Development
```bash
# Start development server
# Photos are scanned on each page load
cd apps/photos
yarn dev
```

### Production Build
```bash
# Build static site
# Photos are scanned once during build
yarn build

# Preview the static build
yarn start

# Deploy the 'out' directory
```

### Adding New Photos

1. Place photos in `public/photos/`:
   ```bash
   cp ~/vacation-photos/*.jpg apps/photos/public/photos/
   ```

2. Rebuild the site:
   ```bash
   yarn build
   ```

3. Photos appear in your gallery with full metadata!

### Environment Variables
Required in `turbo.json` or `.env`:
```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### Supported Photo Formats
- JPEG / JPG
- PNG
- WebP

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
  created_at: string  // from EXIF DateTimeOriginal
  width: number
  height: number
  size: number        // file size in bytes
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
All local photos are processed at build time to extract:
- **Camera Info**: Make, model, lens information
- **Settings**: Aperture, shutter speed, ISO, focal length
- **GPS Data**: Coordinates, altitude with degree precision
- **Timing**: Original capture time, digitization time
- **Technical**: Color space, orientation, white balance
- **Creative**: Exposure mode, metering mode, scene type

### Photo Timeline
Photos from both Unsplash and local folder are:
- Merged into a single timeline
- Sorted by capture date (newest first)
- Grouped by year for filtering
- Displayed with source indicators

### Metadata Display
- **Compact View**: Date, dimensions, stats on photo cards
- **Lightbox View**: Full metadata panel with all EXIF data
- **Extended EXIF**: Additional details for local photos
- **Source Indicator**: Visual differentiation between sources

## Build Performance

- **Static Export**: Entire site is pre-rendered
- **Fast Builds**: Photos scanned once during build
- **No Server Required**: Deploy anywhere (Vercel, Netlify, S3, etc.)
- **SEO Friendly**: All content is pre-rendered HTML

## Deployment

The static site can be deployed to:
- Vercel (automatic)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

Just deploy the `out/` directory after running `yarn build`.

## Development Workflow

1. Add photos to `public/photos/`
2. Run `yarn dev` to see changes locally
3. Photos are scanned on each page load in dev mode
4. Run `yarn build` to create production build
5. Photos are scanned once and baked into static HTML
6. Deploy `out/` directory

## Troubleshooting

### Photos not appearing?
- Ensure photos are in `public/photos/` directory
- Check file format (must be .jpg, .jpeg, .png, or .webp)
- Rebuild the site: `yarn build`
- Check build logs for errors

### Missing EXIF data?
- Some photos may not have EXIF data
- Photos edited in some apps may strip EXIF
- Use a EXIF viewer to check if data exists in the file

### Build errors?
- Ensure Sharp is properly installed: `yarn install`
- Check that photos are not corrupted
- Verify file permissions on the photos directory

## License

Part of the duyet.net monorepo.
