import { readFileSync } from "node:fs";
import postgres from "postgres";

// Managed PostgreSQL — Timeweb Cloud (ru-1, Москва). Read `DATABASE_URL_RU`
// first so we can point Production at the Russian database without touching
// the Vercel–Neon integration's own `DATABASE_URL` (which it keeps managed).
// Falls back to `DATABASE_URL` for local dev and any not-yet-switched env.
const connectionString = process.env.DATABASE_URL_RU || process.env.DATABASE_URL!;

// Optional TLS root CA (Timeweb publishes one). Without it the connection is
// still encrypted, just not chain-verified.
//   PGSSL_CA_FILE — path to the .pem
//   PGSSL_CA      — the PEM contents inline
function caCert(): string | undefined {
  if (process.env.PGSSL_CA_FILE) return readFileSync(process.env.PGSSL_CA_FILE, "utf8");
  return process.env.PGSSL_CA || undefined;
}
const ca = caCert();

const client = postgres(connectionString, {
  ssl: ca ? { ca } : "require",
  max: Number(process.env.PGPOOL_MAX ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
});

// The db/*.ts modules were written against @neondatabase/serverless, whose
// tagged template resolves to a loosely typed `any[]` of rows. postgres.js is
// runtime-compatible — rows are plain objects with snake_case columns, and
// RETURNING, `COUNT(*)::int`, `unnest(${a}::int[])` and `= ANY(${a}::int[])`
// all behave the same — but ships stricter row types. This shim keeps every
// existing call site unchanged; queries stay as loosely typed as they were.
type SqlTag = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

export const sql = client as unknown as SqlTag;
export const dbClient = client;
