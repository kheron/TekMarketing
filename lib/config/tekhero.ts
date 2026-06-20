/**
 * TEKHERO product configuration — open-core vs commercial edition flags.
 * License enforcement will expand in future releases; keys are stubs today.
 */

export const TEKHERO_URL = "https://tekhero.us";
export const TEKHERO_CONTACT_EMAIL = "info@tekhero.us";
export const TEKHERO_COMMERCIAL_DOCS_URL =
  "https://github.com/kheron/TekMarketing/blob/main/COMMERCIAL.md";
export const TEKHERO_GITHUB_URL = "https://github.com/kheron/TekMarketing";

export type TekheroEdition = "open-core" | "commercial";

export interface TekheroConfig {
  edition: TekheroEdition;
  commercialMode: boolean;
  licenseKeyConfigured: boolean;
  telemetryOptIn: boolean;
  productName: string;
  companyName: string;
}

export function getTekheroConfig(): TekheroConfig {
  const edition =
    process.env.TEKHERO_EDITION === "commercial" ? "commercial" : "open-core";

  return {
    edition,
    commercialMode:
      process.env.COMMERCIAL_MODE === "true" || edition === "commercial",
    licenseKeyConfigured: Boolean(process.env.TEKHERO_LICENSE_KEY?.trim()),
    telemetryOptIn: process.env.TELEMETRY_OPT_IN === "true",
    productName: "TekMarketing",
    companyName: "TEKHERO",
  };
}

/** Client-safe subset exposed via API */
export function getPublicTekheroConfig(): Omit<
  TekheroConfig,
  "licenseKeyConfigured"
> & { licenseKeyConfigured: boolean } {
  const config = getTekheroConfig();
  return {
    edition: config.edition,
    commercialMode: config.commercialMode,
    licenseKeyConfigured: config.licenseKeyConfigured,
    telemetryOptIn: config.telemetryOptIn,
    productName: config.productName,
    companyName: config.companyName,
  };
}