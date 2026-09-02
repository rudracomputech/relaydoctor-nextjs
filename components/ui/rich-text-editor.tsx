"use client"

import dynamic from "next/dynamic"
import React from "react"
import "react-quill-new/dist/quill.snow.css"

const ReactQuill = dynamic(
  () => import("react-quill-new"),
  { ssr: false }
)

interface Props {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export function RichTextEditor({
  value,
  onChange,
  maxLength = 500,
}: Props) {

const getPlainTextLength = (html: string) => {
  if (!html) return 0

  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()
    .length
}

const currentLength = getPlainTextLength(value)

const handleChange = (
  content: string,
  delta: any,
  source: any,
  editor: any
) => {

  const textLength = editor.getText().trim().length

  if (textLength <= maxLength) {
    onChange(content)
  }
}

 

 const [charCount, setCharCount] = React.useState(0)


  return (
    <div className="space-y-2">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        className="bg-white"
      />

      <div className="text-right text-xs text-muted-foreground">
        {maxLength - currentLength} characters left
      </div>
    </div>
  )
}