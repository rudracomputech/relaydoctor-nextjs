import mysql from "mysql2/promise"

// Object structure to safely store the pool globally in TypeScript/JavaScript
const globalForDb = globalThis as unknown as {
  conn: mysql.Pool | undefined
}

export const db =
  globalForDb.conn ||
  mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "ujjain_local",
    port: parseInt(process.env.DB_PORT || "3306"),
    connectTimeout: 5000,
    waitForConnections: true,
    connectionLimit: 10, // Explicitly limit connections per pool
    queueLimit: 0,
  })

// In development, save the pool to global storage to prevent re-creation
if (process.env.NODE_ENV !== "production") globalForDb.conn = db
