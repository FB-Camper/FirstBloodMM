function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  SUPABASE_URL: required("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: required("SUPABASE_SERVICE_ROLE_KEY"),
  SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
  X_CLIENT_ID: required("X_CLIENT_ID"),
  X_CLIENT_SECRET: process.env.X_CLIENT_SECRET ?? "",
  X_REDIRECT_URI: required("X_REDIRECT_URI"),
  SESSION_SECRET: required("SESSION_SECRET"),
  ADMIN_SECRET: required("ADMIN_SECRET")
};
