import { NextRequest, NextResponse } from 'next/server'
import {
  getLocalPhoto,
  updateLocalPhoto,
  deleteLocalPhoto,
} from '@/lib/localPhotos'

// GET /api/photos/[id] - Get a single photo by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const photo = getLocalPhoto(id)

    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, photo })
  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch photo',
      },
      { status: 500 }
    )
  }
}

// PATCH /api/photos/[id] - Update photo metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()
    const { description, alt_description, tags, location } = body

    const updates: any = {}

    if (description !== undefined) {
      updates.description = description
    }
    if (alt_description !== undefined) {
      updates.alt_description = alt_description
    }
    if (tags !== undefined) {
      updates.tags = tags
    }
    if (location !== undefined) {
      updates.location = location
    }

    const photo = updateLocalPhoto(id, updates)

    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Photo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, photo })
  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update photo',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/photos/[id] - Delete a photo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const success = deleteLocalPhoto(id)

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Photo not found or failed to delete' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete photo',
      },
      { status: 500 }
    )
  }
}
