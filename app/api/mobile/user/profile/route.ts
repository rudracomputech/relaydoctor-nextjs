import { NextResponse } from "next/server"
import {db} from "@/lib/db"
import { verifyToken } from "@/lib/jwt"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    const decoded: any = verifyToken(token)



    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const [rows]: any = await db.query(
      "SELECT id,  email FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    )

  

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(rows[0])
  } catch (error) {
   
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}