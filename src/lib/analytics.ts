/**
 * Log a user action or system event with error shielding (no-op in AI Studio)
 */
export function trackEvent(_name: string, _properties?: Record<string, string | number | boolean | null>) {
  // Safe no-op for AI Studio environment
}
