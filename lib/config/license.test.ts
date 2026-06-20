import { afterEach, describe, expect, it } from "vitest";
import { getLicenseStatus, isValidLicenseKey } from "./license";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("isValidLicenseKey", () => {
  it("accepts TKM-formatted keys", () => {
    expect(isValidLicenseKey("TKM-AB12-CD34-EF56GH78")).toBe(true);
  });

  it("rejects invalid formats", () => {
    expect(isValidLicenseKey("")).toBe(false);
    expect(isValidLicenseKey("demo-key")).toBe(false);
    expect(isValidLicenseKey("TKM-short")).toBe(false);
  });
});

describe("getLicenseStatus", () => {
  it("allows development without license", () => {
    process.env.NODE_ENV = "development";
    delete process.env.TEKHERO_LICENSE_KEY;
    delete process.env.TEKHERO_OPEN_CORE_ACK;

    expect(getLicenseStatus().blocked).toBe(false);
    expect(getLicenseStatus().tier).toBe("development");
  });

  it("blocks unlicensed production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.TEKHERO_LICENSE_KEY;
    delete process.env.TEKHERO_OPEN_CORE_ACK;

    const status = getLicenseStatus();
    expect(status.blocked).toBe(true);
    expect(status.tier).toBe("unlicensed");
  });

  it("allows production with valid license key", () => {
    process.env.NODE_ENV = "production";
    process.env.TEKHERO_LICENSE_KEY = "TKM-AB12-CD34-EF56GH78";

    const status = getLicenseStatus();
    expect(status.blocked).toBe(false);
    expect(status.tier).toBe("commercial");
  });

  it("allows production with open-core acknowledgment", () => {
    process.env.NODE_ENV = "production";
    process.env.TEKHERO_OPEN_CORE_ACK = "true";

    const status = getLicenseStatus();
    expect(status.blocked).toBe(false);
    expect(status.tier).toBe("open-core-ack");
  });
});