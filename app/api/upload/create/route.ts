import { writeFile } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const data = await req.formData()

  const file = data.get("file") as File

  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 })
  }

  // MAX SIZE VALIDATION
  if (file.size > 5 * 1024 * 1024) {
    return Response.json(
      {
        error: "Max file size is 5MB",
      },
      { status: 400 }
    )
  }

  // MIN SIZE VALIDATION
  if (file.size < 5 * 1024) {
    return Response.json(
      {
        error: "Minimum file size is 50KB",
      },
      { status: 400 }
    )
  }

  // MIME TYPE VALIDATION
  if (!file.type.startsWith("image/")) {
    return Response.json(
      {
        error: "Only images are allowed",
      },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const filename = `${Date.now()}-${file.name}`

  const uploadPath = path.join(process.cwd(), "public/uploads", filename)

  await writeFile(uploadPath, buffer)

  return Response.json({
    success: true,
    path: `/uploads/${filename}`,
  })
}
