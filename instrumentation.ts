export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logLicenseStatusOnStartup } = await import("@/lib/config/license");
    logLicenseStatusOnStartup();
  }
}