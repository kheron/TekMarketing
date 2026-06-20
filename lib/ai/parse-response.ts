export function stripJsonFences(raw: string): string {
  return raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
}

export function parseJsonResponse<T = Record<string, unknown>>(raw: string): T {
  const cleaned = stripJsonFences(raw);
  return JSON.parse(cleaned) as T;
}

export function safeParseJsonResponse<T = Record<string, unknown>>(
  raw: string
): T | null {
  try {
    return parseJsonResponse<T>(raw);
  } catch {
    return null;
  }
}
