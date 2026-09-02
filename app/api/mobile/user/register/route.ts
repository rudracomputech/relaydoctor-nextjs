import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import {db} from "@/lib/db"
import { generateToken } from "@/lib/jwt"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, email, password } = body

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    )

    const token = generateToken({
      id: result.insertId,
      email,
    })

    return NextResponse.json({
      jwt: token,
      user: {
        id: result.insertId,
        name,
        email,
      },
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}