const TEKHERO_CONTACT_EMAIL = "info@tekhero.us";
const TEKHERO_GITHUB_URL = "https://github.com/kheron/TekMarketing";
const TEKHERO_PRODUCT_PATH = "/tekmarketing";

export type LicenseTier =
  | "development"
  | "commercial"
  | "open-core-ack"
  | "unlicensed";

export interface LicenseStatus {
  tier: LicenseTier;
  isProduction: boolean;
  blocked: boolean;
  message: string | null;
  licenseKeyConfigured: boolean;
  openCoreAck: boolean;
}

const LICENSE_KEY_PATTERN = /^TKM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4,}$/i;

export function isValidLicenseKey(key: string | undefined): boolean {
  if (!key?.trim()) return false;
  return LICENSE_KEY_PATTERN.test(key.trim());
}

export function getLicenseStatus(): LicenseStatus {
  const isProduction = process.env.NODE_ENV === "production";
  const licenseKey = process.env.TEKHERO_LICENSE_KEY?.trim();
  const licenseKeyConfigured = Boolean(licenseKey);
  const openCoreAck = process.env.TEKHERO_OPEN_CORE_ACK === "true";

  if (!isProduction) {
    return {
      tier: "development",
      isProduction: false,
      blocked: false,
      message: null,
      licenseKeyConfigured,
      openCoreAck,
    };
  }

  if (licenseKey && isValidLicenseKey(licenseKey)) {
    return {
      tier: "commercial",
      isProduction: true,
      blocked: false,
      message: null,
      licenseKeyConfigured: true,
      openCoreAck,
    };
  }

  if (openCoreAck) {
    return {
      tier: "open-core-ack",
      isProduction: true,
      blocked: false,
      message:
        "Running under Open Core personal-use acknowledgment. Commercial use requires a TEKHERO license.",
      licenseKeyConfigured: false,
      openCoreAck: true,
    };
  }

  return {
    tier: "unlicensed",
    isProduction: true,
    blocked: true,
    message: `Production deployment requires TEKHERO_LICENSE_KEY (commercial) or TEKHERO_OPEN_CORE_ACK=true (personal non-commercial only). Contact ${TEKHERO_CONTACT_EMAIL}.`,
    licenseKeyConfigured: false,
    openCoreAck: false,
  };
}

export function getLicenseEnforcement() {
  const status = getLicenseStatus();
  return {
    blocked: status.blocked,
    tier: status.tier,
    message: status.message,
  };
}

export function logLicenseStatusOnStartup(): void {
  const status = getLicenseStatus();
  const prefix = "[TekMarketing License]";

  if (status.tier === "development") {
    console.info(`${prefix} Development mode — license enforcement relaxed.`);
    return;
  }

  if (status.tier === "commercial") {
    console.info(`${prefix} Commercial license key validated.`);
    return;
  }

  if (status.tier === "open-core-ack") {
    console.warn(`${prefix} ${status.message}`);
    return;
  }

  console.error(`${prefix} UNLICENSED PRODUCTION DEPLOYMENT`);
  console.error(`${prefix} Agent and generation APIs are blocked.`);
  console.error(`${prefix} ${status.message}`);
  console.error(`${prefix} Product: ${TEKHERO_PRODUCT_PATH} · Source: ${TEKHERO_GITHUB_URL}`);
}