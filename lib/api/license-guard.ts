import { NextResponse } from "next/server";
import { getLicenseEnforcement } from "@/lib/config/license";
import { TEKHERO_CONTACT_EMAIL, TEKHERO_PRODUCT_PATH } from "@/lib/config/tekhero";

/**
 * Returns a 402 response when production license requirements are not met.
 * Use at the top of mutating agent / generation API handlers.
 */
export function licenseGuardResponse(): NextResponse | null {
  const enforcement = getLicenseEnforcement();
  if (!enforcement.blocked) return null;

  return NextResponse.json(
    {
      error: "License required",
      code: "LICENSE_REQUIRED",
      message: enforcement.message,
      tier: enforcement.tier,
      contact: TEKHERO_CONTACT_EMAIL,
      commercialUrl: TEKHERO_PRODUCT_PATH,
      docsUrl:
        "https://github.com/kheron/TekMarketing/blob/main/COMMERCIAL.md",
    },
    { status: 402 }
  );
}