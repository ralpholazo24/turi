import Constants from "expo-constants";
import PostHog from "posthog-react-native";

/**
 * PostHog configuration
 *
 * The API key should be set in one of the following ways:
 * 1. In app.json under extra.posthogApiKey
 * 2. As an environment variable POSTHOG_API_KEY
 * 3. Or set directly here (not recommended for production)
 */
export const POSTHOG_CONFIG = {
  apiKey:
    Constants.expoConfig?.extra?.posthogApiKey ||
    process.env.POSTHOG_API_KEY ||
    "",
  host: "https://eu.i.posthog.com",
  // PostHog is disabled in development mode by default
  // In production builds, __DEV__ is false, so PostHog will be enabled automatically
  disabled: __DEV__,
  // Enable autocapture for automatic screen tracking
  autocapture: {
    captureLifecycleEvents: true,
  },
  // Flush settings
  flushAt: 20,
  flushInterval: 10000,
};

/**
 * PostHog instance for use in stores and non-React contexts
 * This instance is also used by PostHogProvider
 */
export const posthog =
  POSTHOG_CONFIG.apiKey && !POSTHOG_CONFIG.disabled
    ? new PostHog(POSTHOG_CONFIG.apiKey, {
        host: POSTHOG_CONFIG.host,
        disabled: POSTHOG_CONFIG.disabled,
        captureAppLifecycleEvents:
          POSTHOG_CONFIG.autocapture.captureLifecycleEvents,
        flushAt: POSTHOG_CONFIG.flushAt,
        flushInterval: POSTHOG_CONFIG.flushInterval,
      })
    : null;

/**
 * Check if PostHog is properly configured
 */
export function isPostHogConfigured(): boolean {
  return !!POSTHOG_CONFIG.apiKey && !POSTHOG_CONFIG.disabled;
}

/**
 * Safely capture an event (only if PostHog is configured)
 */
export function captureEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (posthog && isPostHogConfigured()) {
    posthog.capture(eventName, properties);
    if (__DEV__) {
      console.log("[PostHog] Event captured:", eventName, properties);
    }
  } else {
    if (__DEV__) {
      console.log(
        "[PostHog] Event not captured (disabled or not configured):",
        eventName
      );
    }
  }
}

/**
 * Test PostHog by sending a test event
 * Useful for verifying PostHog is working
 */
export function testPostHog(): void {
  if (posthog && isPostHogConfigured()) {
    captureEvent("posthog_test", {
      timestamp: new Date().toISOString(),
      test: true,
    });
    // Force flush to send immediately
    posthog.flush();
    console.log("[PostHog] Test event sent! Check your PostHog dashboard.");
  } else {
    console.warn("[PostHog] Not configured or disabled. Current status:", {
      hasApiKey: !!POSTHOG_CONFIG.apiKey,
      disabled: POSTHOG_CONFIG.disabled,
      isDev: __DEV__,
      posthogInstance: !!posthog,
    });
  }
}

/**
 * Manually flush queued events to PostHog
 * Useful for testing to see events immediately
 */
export function flushPostHog(): void {
  if (posthog && isPostHogConfigured()) {
    posthog.flush();
    console.log("[PostHog] Events flushed to PostHog.");
  } else {
    console.warn(
      "[PostHog] Cannot flush - PostHog not configured or disabled."
    );
  }
}
