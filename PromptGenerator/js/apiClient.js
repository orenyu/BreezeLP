/* ===================================
   API CLIENT
   Handles direct communication with Gemini API
   =================================== */

class APIClient {
    constructor() {
        this.apiKey = CONFIG.GEMINI_API_KEY;
        this.apiEndpoint = CONFIG.GEMINI_API_ENDPOINT;
        this.requestCount = 0;
        console.log('🌐 API Client initialized for Gemini API');

        // Check if API key is configured
        if (this.apiKey === 'YOUR_API_KEY_HERE' || !this.apiKey) {
            console.error('❌ Gemini API key not configured!');
        }
    }

    async generatePrompt(formData) {
        try {
            // Check if API key is configured
            if (this.apiKey === 'YOUR_API_KEY_HERE' || !this.apiKey) {
                throw new Error('Gemini API key not configured. Please update config.js with your API key.');
            }

            console.log('📝 Building meta-prompt from form data...');

            // Build the meta-prompt using PromptBuilder
            const metaPrompt = promptBuilder.buildPrompt(formData);

            console.log('🚀 Sending request to Gemini API...');

            // Call Gemini API directly
            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: metaPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);

                // Handle specific errors
                if (response.status === 400) {
                    throw new Error('Invalid API request. Please check your API key and try again.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                } else if (response.status === 403) {
                    throw new Error('Invalid API key. Please check your configuration.');
                }

                throw new Error(errorData.error?.message || 'Failed to generate prompt');
            }

            const data = await response.json();

            // Extract the generated text from Gemini response
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                console.warn('⚠️ No text generated, using fallback...');
                const fallbackPrompt = promptBuilder.generateFallbackPrompt(formData);
                return {
                    success: true,
                    generatedPrompt: fallbackPrompt,
                    usedFallback: true,
                    metadata: {
                        timestamp: new Date().toISOString()
                    }
                };
            }

            console.log('✅ Prompt generated successfully!');
            this.requestCount++;

            return {
                success: true,
                generatedPrompt: generatedText,
                usedFallback: false,
                metadata: {
                    timestamp: new Date().toISOString(),
                    requestCount: this.requestCount
                }
            };

        } catch (error) {
            console.error('API Error:', error);

            // If API fails, try to use fallback
            console.log('⚠️ Using fallback template due to error...');
            try {
                const fallbackPrompt = promptBuilder.generateFallbackPrompt(formData);
                return {
                    success: true,
                    generatedPrompt: fallbackPrompt,
                    usedFallback: true,
                    metadata: {
                        timestamp: new Date().toISOString(),
                        error: error.message
                    }
                };
            } catch (fallbackError) {
                // If even fallback fails, throw the original error
                throw error;
            }
        }
    }

    async testConnection() {
        try {
            if (this.apiKey === 'YOUR_API_KEY_HERE' || !this.apiKey) {
                return {
                    success: false,
                    message: 'API key not configured'
                };
            }

            const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Hello, this is a test.'
                        }]
                    }]
                })
            });

            if (response.ok) {
                return {
                    success: true,
                    message: 'Gemini API connection successful'
                };
            } else {
                return {
                    success: false,
                    message: 'Gemini API connection failed',
                    status: response.status
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Connection failed',
                error: error.message
            };
        }
    }

    getStats() {
        return {
            requestCount: this.requestCount,
            apiConfigured: this.apiKey !== 'YOUR_API_KEY_HERE' && !!this.apiKey
        };
    }
}

// Initialize API client
const apiClient = new APIClient();
