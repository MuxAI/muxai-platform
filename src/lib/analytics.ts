import { track } from '@vercel/analytics';

/**
 * Log a user action or system event to Vercel Analytics with error shielding
 */
export function trackEvent(name: string, properties?: Record<string, string | number | boolean | null>) {
  try {
    track(name, properties || {});
  } catch {
    // Analytics failure should never disrupt the application experience
  }
}
