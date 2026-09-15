import * as React from "react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export type FileThumbnailProps = {
  file: { name: string; type: string }
  className?: string
  /** width / height */
  previewAspectRatio?: number
  previewClassName?: string
  previewImageUrl?: string
  isLoading?: boolean
  /** Rendered when there is no `previewImageUrl`. */
  previewContent?: React.ReactNode
}

/**
 * Minimal file thumbnail used by the Finder (`file-system.tsx`). Shows the
 * externally generated preview image when available, otherwise whatever
 * `previewContent` the caller passes (a generic file-type tile).
 */
export function FileThumbnail({
  file,
  className,
  previewAspectRatio = 0.78,
  previewClassName,
  previewImageUrl,
  isLoading = false,
  previewContent,
}: FileThumbnailProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[inherit]",
        className
      )}
      style={{ aspectRatio: String(previewAspectRatio) }}
    >
      <div
        className={cn(
          "flex size-full items-center justify-center",
          previewClassName
        )}
      >
        {previewImageUrl ? (
          <img
            src={previewImageUrl}
            alt={file.name}
            draggable={false}
            className="size-full object-cover"
          />
        ) : (
          previewContent
        )}
      </div>
      {isLoading ? (
        <div className="absolute inset-0 grid place-items-center bg-background/40 backdrop-blur-[1px]">
          <Spinner className="size-4 text-muted-foreground" />
        </div>
      ) : null}
    </div>
  )
}

export default FileThumbnail
