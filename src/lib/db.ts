import mysql from "mysql2/promise";
import type { Pool, PoolOptions } from "mysql2/promise";

// Database configuration
const poolConfig: PoolOptions = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create pool instance
let pool: Pool | null = null;

// Get or create pool (singleton pattern)
const getPool = (): Pool => {
  if (!pool) {
    pool = mysql.createPool(poolConfig);

    // Handle pool errors
    pool.on("connection", () => {
      console.log("Database connection established");
    });

    pool.on("error", (err) => {
      console.error("Database pool error:", err);
      if (err.code === "PROTOCOL_CONNECTION_LOST") {
        pool = null; // Reset pool on connection loss
      }
    });
  }
  return pool;
};

// Export the pool getter
export default getPool();

// Helper function to safely execute queries with connection management
export async function executeQuery<T = any>(
  query: string,
  params?: any[],
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    const [results] = await connection.query(query, params);
    return results as T;
  } finally {
    connection.release();
  }
}

// Helper function for transactions
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
