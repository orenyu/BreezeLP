/**
 * Frontend Configuration
 * Supports direct Gemini API calls (client-side)
 */
const CONFIG = {
    // Gemini API Configuration
    // Get your API key from: https://makersuite.google.com/app/apikey
    GEMINI_API_KEY: 'AIzaSyBeFe8cXamPq6on7nUDCJ6w00MxuwPNLCY',

    // Gemini API endpoint
    GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',

    // Environment detection
    IS_PRODUCTION: (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
        && window.location.hostname !== '127.0.0.1',

    // Version info
    VERSION: '1.0.0',
    BUILD_DATE: '2025-11-13'
};

// Log configuration in development
if (!CONFIG.IS_PRODUCTION) {
    console.log('🔧 Frontend Configuration:', CONFIG);
    if (CONFIG.GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Warning: Gemini API key not configured! Please update config.js');
    }
}
