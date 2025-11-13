/* ===================================
   GEMINI SERVICE
   Handles Google Gemini API integration
   =================================== */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error('Gemini API key is required');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        });

        this.requestCount = 0;
        this.lastResetTime = Date.now();
        this.maxRequestsPerMinute = 60; // Gemini free tier limit
        this.maxRequestsPerDay = 1500; // Gemini free tier daily limit
    }

    async generatePrompt(metaPrompt) {
        try {
            // Check rate limits
            this.checkRateLimit();

            // Generate content using Gemini
            const result = await this.model.generateContent(metaPrompt);
            const response = await result.response;
            const text = response.text();

            // Increment request counter
            this.requestCount++;

            return {
                success: true,
                generatedPrompt: text,
                metadata: {
                    model: 'gemini-pro',
                    timestamp: new Date().toISOString(),
                    requestCount: this.requestCount
                }
            };

        } catch (error) {
            console.error('Gemini API Error:', error);

            // Handle specific error types
            if (error.message.includes('quota')) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            if (error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your configuration.');
            }

            throw new Error(`Failed to generate prompt: ${error.message}`);
        }
    }

    checkRateLimit() {
        const now = Date.now();
        const timeSinceReset = now - this.lastResetTime;

        // Reset counter every minute
        if (timeSinceReset > 60000) {
            this.requestCount = 0;
            this.lastResetTime = now;
        }

        // Check if we've exceeded the per-minute limit
        if (this.requestCount >= this.maxRequestsPerMinute) {
            throw new Error('Rate limit exceeded (60 requests per minute). Please wait a moment.');
        }
    }

    async testConnection() {
        try {
            const result = await this.model.generateContent('Hello, this is a test.');
            const response = await result.response;
            const text = response.text();

            return {
                success: true,
                message: 'Gemini API connection successful',
                response: text
            };
        } catch (error) {
            return {
                success: false,
                message: 'Gemini API connection failed',
                error: error.message
            };
        }
    }

    getStats() {
        return {
            requestCount: this.requestCount,
            maxRequestsPerMinute: this.maxRequestsPerMinute,
            maxRequestsPerDay: this.maxRequestsPerDay,
            lastResetTime: new Date(this.lastResetTime).toISOString()
        };
    }
}

module.exports = GeminiService;
