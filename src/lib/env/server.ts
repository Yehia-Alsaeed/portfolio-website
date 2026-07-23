export type ResendConfig = {
  apiKey: string;
  from: string;
  to: string;
};

export type ServerEnv = Record<string, string | undefined>;

function readRequired(name: string, env: ServerEnv): string {
  const value = env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required but was not set`);
  }

  return value;
}

export function readDatabaseUrl(env: ServerEnv = process.env): string {
  return readRequired("DATABASE_URL", env);
}

export function readMigrationUrl(env: ServerEnv = process.env): string {
  return env.DATABASE_URL_UNPOOLED?.trim() || readDatabaseUrl(env);
}

export function readAnalyticsSalt(env: ServerEnv = process.env): string {
  return readRequired("ANALYTICS_HASH_SALT", env);
}

export function readCronSecret(env: ServerEnv = process.env): string {
  return readRequired("CRON_SECRET", env);
}

export function readResendConfig(env: ServerEnv = process.env): ResendConfig | undefined {
  const apiKey = env.RESEND_API_KEY?.trim();

  if (!apiKey) return undefined;

  const from = readRequired("CONTACT_NOTIFICATION_FROM", env);
  const to = readRequired("CONTACT_NOTIFICATION_TO", env);

  return { apiKey, from, to };
}
