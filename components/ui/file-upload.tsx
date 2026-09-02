"use client"

import * as React from "react"
import { Upload, X, FileIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type FileUploadContextType = {
  files: File[]
  setFiles: (files: File[]) => void
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
}

const FileUploadContext = React.createContext<FileUploadContextType | null>(
  null
)

function useFileUpload() {
  const context = React.useContext(FileUploadContext)

  if (!context) {
    throw new Error("FileUpload components must be inside <FileUpload>")
  }

  return context
}

type FileUploadProps = {
  value: File[]
  onValueChange: (files: File[]) => void
  children: React.ReactNode
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  accept?: Record<string, string[]>
  className?: string
}

export function FileUpload({
  value,
  onValueChange,
  children,
  multiple = false,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  className,
}: FileUploadProps) {
  return (
    <FileUploadContext.Provider
      value={{
        files: value,
        setFiles: onValueChange,
        multiple,
        maxFiles,
        maxSize,
      }}
    >
      <div className={cn("space-y-4", className)}>{children}</div>
    </FileUploadContext.Provider>
  )
}

type FileUploadDropzoneProps = {
  children?: React.ReactNode
  className?: string
}

export function FileUploadDropzone({
  children,
  className,
}: FileUploadDropzoneProps) {
  const { files, setFiles, multiple, maxFiles, maxSize } = useFileUpload()

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      let updatedFiles = multiple
        ? [...files, ...acceptedFiles]
        : acceptedFiles.slice(0, 1)

      if (updatedFiles.length > maxFiles!) {
        updatedFiles = updatedFiles.slice(0, maxFiles)
      }

      setFiles(updatedFiles)
    },
    [files, multiple, maxFiles, setFiles]
  )

  

  const { getRootProps, getInputProps, isDragActive,fileRejections } = useDropzone({
  onDrop,

  multiple,

  maxFiles,

  maxSize:5 * 1024 * 1024, // 5 MB

  minSize: 5 * 1024, // 500 KB

  accept: {
    "image/*": [],
  },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-primary",
        isDragActive && "border-primary bg-muted",
        className
      )}
    >
      <input {...getInputProps()} />

      {children ?? (
        <>
          <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium">Drag & drop files here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </>
      )}

      {fileRejections.length > 0 && (
  <div className="space-y-1 text-sm text-red-500">
    {fileRejections.map(({ file, errors }) => (
      <div key={file.name}>
        {errors.map((e) => (
          <p key={e.code}>
            {file.name}: {e.message}
          </p>
        ))}
      </div>
    ))}
  </div>
)}
    </div>

    
  )

  
}

export function FileUploadList({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function FileUploadItem({
  value,
  children,
}: {
  value: File
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-2">
      {children}
    </div>
  )
}

type PreviewFile = File & {
  preview?: string
}

export function FileUploadItemPreview({ file }: { file: any }) {
  const imageSrc =
    file instanceof File
      ? URL.createObjectURL(file)
      : file.preview || file.path || file.file || ""

  return (
    <div className="flex items-center gap-2">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={file.name || "Preview"}
          className="h-14 w-14 rounded object-cover"
        />
      ) : (
        <FileIcon className="h-10 w-10" />
      )}
    </div>
  )
}

export function FileUploadItemMetadata({ file }: { file: any }) {
  const fileSize =
    file instanceof File ? file.size : file.size || file.file_size || 0

  return (
    <div className="flex flex-col">
      <span className="text-sm">{file?.name || "Image"}</span>

      {fileSize > 0 && (
        <span className="text-xs text-muted-foreground">
          {(fileSize / 1024 / 1024).toFixed(2)} MB
        </span>
      )}
    </div>
  )
}

export function FileUploadItemDelete({ file }: { file: File }) {
  const { files, setFiles } = useFileUpload()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => {
        setFiles(files.filter((f) => f !== file))
      }}
    >
      <X className="h-4 w-4" />
    </Button>
  )
}
