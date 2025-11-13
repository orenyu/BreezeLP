/**
 * Frontend Configuration
 * Supports environment-specific API URLs
 */
const CONFIG = {
    // API Base URL - uses environment variable if set, otherwise defaults
    API_BASE_URL: (typeof window !== 'undefined' && window.ENV_API_URL)
        ? window.ENV_API_URL
        : 'http://localhost:3000/api',

    // Environment detection
    IS_PRODUCTION: (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        && window.location.hostname !== '127.0.0.1',

    // Version info
    VERSION: '1.0.0',
    BUILD_DATE: '2025-11-12'
};

// Log configuration in development
if (!CONFIG.IS_PRODUCTION) {
    console.log('🔧 Frontend Configuration:', CONFIG);
}
