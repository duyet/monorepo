'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react'
import { LocalPhoto } from '@/lib/types'

interface UploadStatus {
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
  photo?: LocalPhoto
  error?: string
}

interface PhotoUploaderProps {
  onUploadSuccess?: (photo: LocalPhoto) => void
  onUploadError?: (error: string) => void
  className?: string
}

export default function PhotoUploader({
  onUploadSuccess,
  onUploadError,
  className = '',
}: PhotoUploaderProps) {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadStatus[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      // Add file to uploads list
      const uploadId = Date.now()
      const newUpload: UploadStatus = {
        file,
        status: 'uploading',
        progress: 0,
      }

      setUploads((prev) => [...prev, newUpload])

      try {
        // Create form data
        const formData = new FormData()
        formData.append('file', file)

        // Upload with progress tracking
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100
            setUploads((prev) =>
              prev.map((upload) =>
                upload.file === file ? { ...upload, progress } : upload
              )
            )
          }
        })

        const response = await new Promise<any>((resolve, reject) => {
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
          })

          xhr.open('POST', '/api/upload')
          xhr.send(formData)
        })

        if (response.success && response.photo) {
          setUploads((prev) =>
            prev.map((upload) =>
              upload.file === file
                ? { ...upload, status: 'success', photo: response.photo }
                : upload
            )
          )
          onUploadSuccess?.(response.photo)

          // Refresh the page to show the new photo
          setTimeout(() => {
            router.refresh()
          }, 1000)
        } else {
          throw new Error(response.error || 'Upload failed')
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed'
        setUploads((prev) =>
          prev.map((upload) =>
            upload.file === file
              ? { ...upload, status: 'error', error: errorMessage }
              : upload
          )
        )
        onUploadError?.(errorMessage)
      }
    },
    [onUploadSuccess, onUploadError]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          onUploadError?.(`${file.name} is not an image file`)
          return
        }

        uploadFile(file)
      })
    },
    [uploadFile, onUploadError]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files)
      // Reset input so the same file can be selected again
      e.target.value = ''
    },
    [handleFiles]
  )

  const removeUpload = useCallback((file: File) => {
    setUploads((prev) => prev.filter((upload) => upload.file !== file))
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <Upload
            className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragging ? 'Drop your photos here' : 'Upload Photos'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Supports JPEG, PNG, WebP (max 50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <div className="h-10 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                {upload.status === 'success' && (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                )}
                {upload.status === 'error' && (
                  <AlertCircle className="h-10 w-10 text-red-500" />
                )}
              </div>

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {upload.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(upload.file.size)}
                </p>

                {/* Progress bar */}
                {upload.status === 'uploading' && (
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error message */}
                {upload.status === 'error' && upload.error && (
                  <p className="mt-1 text-xs text-red-500">{upload.error}</p>
                )}

                {/* Success message */}
                {upload.status === 'success' && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Upload complete
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeUpload(upload.file)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Remove"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
