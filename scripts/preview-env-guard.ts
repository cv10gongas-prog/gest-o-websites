/**
 * Preflight fail-closed for the isolated NWS visual Preview.
 * This is intentionally called from vite.config.ts, before the production/Preview bundle is built.
 * It does not validate the Supabase migrations or replace runtime permissions.
 */
export function assertPreviewEnvironment(env: Record<string, string | undefined> = process.env) {
  const demoClient = env["VITE_DEMO_MODE"] === "true";
  const demoServer = env["DEMO_MODE"] === "true";
  const previewFlag = env["VITE_DEPLOYMENT_ENV"] === "preview";
  const vercelEnv = env["VERCEL_ENV"];
  const anyDemoFlag = demoClient || demoServer;

  // Never deploy an accidentally unconfigured Vercel Preview with production integrations.
  // A future DB-backed staging environment needs its own deliberately reviewed policy.
  if (vercelEnv === "preview" && !(demoClient && demoServer && previewFlag)) {
    throw new Error(
      "[NWS] Vercel Preview requires explicit isolated DEMO configuration before deployment.",
    );
  }

  if (vercelEnv === "production" && (anyDemoFlag || previewFlag)) {
    throw new Error("[NWS] Production build must not contain DEMO/Preview flags.");
  }
  if (!anyDemoFlag && !previewFlag) return;
  if (!(demoClient && demoServer && previewFlag)) {
    throw new Error(
      "[NWS] DEMO requires VITE_DEMO_MODE=true, DEMO_MODE=true and VITE_DEPLOYMENT_ENV=preview together.",
    );
  }
  if (vercelEnv && vercelEnv !== "preview" && vercelEnv !== "development") {
    throw new Error("[NWS] DEMO is restricted to Vercel Preview/development, never Production.");
  }

  const forbidden = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_KEY",
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VITE_RESTAURANT_SUPABASE_URL",
    "VITE_RESTAURANT_SUPABASE_PUBLISHABLE_KEY",
    "VITE_RESTAURANT_SUPABASE_KEY",
    "RESTAURANT_SUPABASE_URL",
    "RESTAURANT_SUPABASE_SERVICE_ROLE_KEY",
    "VITE_PUBLIC_RESTAURANT_URL",
  ];
  const inherited = forbidden.filter((key) => Boolean(env[key]));
  if (inherited.length) {
    // Print names only. Never expose any credential values in logs.
    throw new Error(
      `[NWS] Isolated DEMO must not inherit production integrations: ${inherited.join(", ")}`,
    );
  }
}
