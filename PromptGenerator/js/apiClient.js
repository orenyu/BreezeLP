/* ===================================
   API CLIENT
   Handles communication with backend API
   =================================== */

class APIClient {
    constructor() {
        // Backend API URL - uses CONFIG from config.js
        this.baseURL = CONFIG.API_BASE_URL;
        console.log('🌐 API Client initialized with URL:', this.baseURL);
    }

    async generatePrompt(formData) {
        try {
            const response = await fetch(`${this.baseURL}/generate-prompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to generate prompt');
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error', message: error.message };
        }
    }

    setBaseURL(url) {
        this.baseURL = url;
    }
}

// Initialize API client
const apiClient = new APIClient();
