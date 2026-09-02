// app/api/upload/delete/route.ts

import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const filePath = body.path

  if (!filePath) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  try {
    const fullPath = path.join(process.cwd(), "public", filePath)

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json({ success: false }, { status: 500 })
  }
}
