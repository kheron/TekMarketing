import { getTekheroConfig } from "@/lib/config/tekhero";

export interface TelemetryEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

/**
 * Privacy-respecting telemetry stub for commercial instances.
 * No events are sent unless TELEMETRY_OPT_IN=true.
 * Replace the sink with your analytics endpoint in commercial builds.
 */
export function trackEvent(event: TelemetryEvent): void {
  const { telemetryOptIn, edition } = getTekheroConfig();
  if (!telemetryOptIn) return;

  // Commercial sink placeholder — wire to TEKHERO analytics in licensed deployments
  if (process.env.NODE_ENV === "development") {
    console.info(`[telemetry:${edition}]`, event.name, event.properties ?? {});
  }
}