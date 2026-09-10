import { readFileSync } from "node:fs";
import postgres from "postgres";

// Managed PostgreSQL (Yandex Cloud, ru-central1). The app runs long-lived on a
// VM in the same subnet, so a normal connection pool is fine — no per-request
// HTTP driver.
//
// TLS to the YC cluster wants their root CA:
//   PGSSL_CA_FILE — path to CA.pem (preferred on the VM / in the container)
//   PGSSL_CA      — the PEM contents inline (alternative)
// With neither, we still require an encrypted connection but skip chain
// verification.
function caCert(): string | undefined {
  if (process.env.PGSSL_CA_FILE) return readFileSync(process.env.PGSSL_CA_FILE, "utf8");
  return process.env.PGSSL_CA || undefined;
}
const ca = caCert();

const client = postgres(process.env.DATABASE_URL!, {
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
