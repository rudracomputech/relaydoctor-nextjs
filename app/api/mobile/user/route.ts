
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new Response("Unauthorized", {status:401})

  const [rows] = await db.query("SELECT id,email FROM users")
  return Response.json(rows)
}
