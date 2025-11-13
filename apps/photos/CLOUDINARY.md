# Cloudinary Integration

This photos app now supports **mixed content from multiple providers**: Unsplash and Cloudinary.

## Configuration

### Environment Variables

Add the following environment variables to your `.env` or `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=optional_folder_name  # Optional: filter photos by folder
```

### How to Get Cloudinary Credentials

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. Go to your Dashboard
3. Find your credentials:
   - **Cloud Name**: Found in the "Product Environment Credentials" section
   - **API Key**: Found in the same section
   - **API Secret**: Click "Reveal" to see your API secret

### Optional: Folder Configuration

If you want to display photos from a specific folder in your Cloudinary account:

```bash
CLOUDINARY_FOLDER=my-photos
```

This will only fetch photos from the `my-photos` folder. Leave it empty to fetch all photos.

## How It Works

### Photo Providers

The app now uses a unified photo provider system that:

1. Fetches photos from **Unsplash** (if `UNSPLASH_ACCESS_KEY` is configured)
2. Fetches photos from **Cloudinary** (if Cloudinary credentials are configured)
3. Merges photos from both sources
4. Sorts all photos by creation date (newest first)

### Provider Architecture

```
lib/
├── cloudinary.ts              # Cloudinary SDK configuration
├── cloudinary-provider.ts     # Cloudinary photo fetching
├── unsplash-provider.ts       # Unsplash photo adapter
├── photo-provider.ts          # Unified provider (merges both)
├── types.ts                   # Photo types and interfaces
└── unsplash.ts                # Original Unsplash implementation
```

### Data Structure

All photos are converted to a generic `Photo` interface that works with both providers:

```typescript
interface Photo {
  id: string
  provider: 'unsplash' | 'cloudinary'
  created_at: string
  width: number
  height: number
  urls: {
    full: string
    regular: string
    small: string
    thumb: string
  }
  // ... and more fields
}
```

## Metadata Support

### Cloudinary Metadata

Cloudinary photos support custom metadata through context:

```javascript
// Example: Adding metadata to your Cloudinary photos
{
  context: {
    custom: {
      caption: "Photo description",
      alt: "Alt text for accessibility",
      location: {
        name: "Location name",
        city: "City",
        country: "Country"
      }
    }
  }
}
```

### EXIF Data

Both providers support EXIF data (camera settings, location, etc.). Enable `image_metadata: true` in the Cloudinary API call to fetch EXIF data.

## Usage

The app automatically detects which providers are configured and fetches photos from all available sources.

### Enable Both Providers

```bash
# .env.local
UNSPLASH_ACCESS_KEY=your_unsplash_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Disable a Provider

To disable Unsplash: Remove or comment out `UNSPLASH_ACCESS_KEY`
To disable Cloudinary: Remove or comment out Cloudinary variables

## Benefits

- **Flexibility**: Use one or both providers
- **Unified Interface**: All photos use the same data structure
- **Automatic Merging**: Photos are automatically sorted and merged
- **Graceful Degradation**: If one provider fails, the app continues with the other
- **Easy Migration**: Move photos between providers without changing the app code
