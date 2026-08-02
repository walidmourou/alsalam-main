import "server-only";

import mysql, { type Pool } from "mysql2/promise";

declare global {
  var __mysqlPool: Pool | undefined;
}

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getDatabaseConfig() {
  const uri = getEnv("DATABASE_URL");
  if (uri) {
    return { uri };
  }

  const host = getEnv("DB_HOST") ?? getEnv("MYSQL_HOST");
  const user = getEnv("DB_USER") ?? getEnv("MYSQL_USER");
  const password = getEnv("DB_PASSWORD") ?? getEnv("MYSQL_PASSWORD");
  const database = getEnv("DB_NAME") ?? getEnv("MYSQL_DATABASE");
  const port = Number(getEnv("DB_PORT") ?? getEnv("MYSQL_PORT") ?? "3306");

  if (!host || !user || !database) {
    return null;
  }

  return {
    host,
    user,
    password,
    database,
    port,
  };
}

export function hasDatabaseConfig() {
  return getDatabaseConfig() !== null;
}

export function getDb() {
  if (!global.__mysqlPool) {
    const config = getDatabaseConfig();
    if (!config) {
      throw new Error(
        "MySQL ist nicht konfiguriert. Bitte DATABASE_URL oder DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD setzen."
      );
    }

    global.__mysqlPool = mysql.createPool({
      ...config,
      connectionLimit: 10,
      dateStrings: true,
      decimalNumbers: true,
    });
  }

  return global.__mysqlPool;
}

export function isDatabaseConfigurationError(error: unknown) {
  return error instanceof Error && error.message.includes("MySQL ist nicht konfiguriert");
}
