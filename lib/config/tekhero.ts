/**
 * TEKHERO product configuration — open-core vs commercial edition flags.
 */

export const TEKHERO_URL = "https://tekhero.us";
export const TEKHERO_CONTACT_EMAIL = "info@tekhero.us";
export const TEKHERO_COMMERCIAL_DOCS_URL =
  "https://github.com/kheron/TekMarketing/blob/main/COMMERCIAL.md";
export const TEKHERO_GITHUB_URL = "https://github.com/kheron/TekMarketing";
/** In-app landing page; set NEXT_PUBLIC_TEKHERO_PRODUCT_URL for external canonical URL */
export const TEKHERO_PRODUCT_PATH = "/tekmarketing";
export const TEKHERO_PRODUCT_URL =
  process.env.NEXT_PUBLIC_TEKHERO_PRODUCT_URL ?? TEKHERO_PRODUCT_PATH;

export type TekheroEdition = "open-core" | "commercial";

import { getLicenseStatus, type LicenseTier } from "@/lib/config/license";

export interface TekheroConfig {
  edition: TekheroEdition;
  commercialMode: boolean;
  licenseKeyConfigured: boolean;
  telemetryOptIn: boolean;
  productName: string;
  companyName: string;
  licenseTier: LicenseTier;
  licenseBlocked: boolean;
  licenseMessage: string | null;
}

export function getTekheroConfig(): TekheroConfig {
  const edition =
    process.env.TEKHERO_EDITION === "commercial" ? "commercial" : "open-core";
  const license = getLicenseStatus();

  return {
    edition,
    commercialMode:
      process.env.COMMERCIAL_MODE === "true" ||
      edition === "commercial" ||
      license.tier === "commercial",
    licenseKeyConfigured: license.licenseKeyConfigured,
    telemetryOptIn: process.env.TELEMETRY_OPT_IN === "true",
    productName: "TekMarketing",
    companyName: "TEKHERO",
    licenseTier: license.tier,
    licenseBlocked: license.blocked,
    licenseMessage: license.message,
  };
}

/** Client-safe subset exposed via API */
export function getPublicTekheroConfig() {
  const config = getTekheroConfig();
  return {
    edition: config.edition,
    commercialMode: config.commercialMode,
    licenseKeyConfigured: config.licenseKeyConfigured,
    telemetryOptIn: config.telemetryOptIn,
    productName: config.productName,
    companyName: config.companyName,
    licenseTier: config.licenseTier,
    licenseBlocked: config.licenseBlocked,
    licenseMessage: config.licenseMessage,
    productUrl: TEKHERO_PRODUCT_URL,
    contactEmail: TEKHERO_CONTACT_EMAIL,
  };
}