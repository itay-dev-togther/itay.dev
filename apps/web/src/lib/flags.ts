// Feature flags for development and testing
// In production, these should be controlled via environment variables

export const flags = {
  // Skip authentication checks (DEV ONLY)
  skipAuth: process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV === 'development',

  // Use a test user ID when auth is skipped
  testUserId: process.env.TEST_USER_ID || null,

  // Skip GitHub branch creation
  skipGitHub: process.env.SKIP_GITHUB === 'true',

  // Enable verbose logging
  verboseLogging: process.env.VERBOSE_LOGGING === 'true',

  // Mock external services
  mockExternalServices: process.env.MOCK_EXTERNAL === 'true',
}

// Helper to check if we're in dev mode
export const isDev = process.env.NODE_ENV === 'development'

// Log flags on startup in dev
if (isDev && flags.verboseLogging) {
  console.log('Feature flags:', flags)
}
