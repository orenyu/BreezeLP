/* ===================================
   BREEZE ANIMATION - PROMPT GENERATOR
   Backend Server
   =================================== */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const xss = require('xss');
const helmet = require('helmet');
const GeminiService = require('./geminiService');
const PromptBuilder = require('./promptBuilder');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
let geminiService;
const promptBuilder = new PromptBuilder();

try {
    geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini service initialized');
} catch (error) {
    console.error('❌ Failed to initialize Gemini service:', error.message);
    console.error('⚠️  Server will run in fallback mode (template-based prompts)');
}

// ===== MIDDLEWARE =====

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3001',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ===== INPUT SANITIZATION =====

/**
 * Sanitize user input to prevent injection attacks
 * @param {Object} data - Raw form data from client
 * @returns {Object} Sanitized form data
 */
function sanitizeInput(data) {
    const sanitized = {};

    // Sanitize string fields
    if (data.productField) sanitized.productField = xss(validator.escape(data.productField));
    if (data.productFieldOther) sanitized.productFieldOther = xss(validator.escape(data.productFieldOther));
    if (data.productDescription) sanitized.productDescription = xss(validator.escape(data.productDescription));
    if (data.challenges) sanitized.challenges = xss(validator.escape(data.challenges));
    if (data.primaryGoal) sanitized.primaryGoal = xss(validator.escape(data.primaryGoal));
    if (data.targetAudience) sanitized.targetAudience = xss(validator.escape(data.targetAudience));
    if (data.targetAudienceOther) sanitized.targetAudienceOther = xss(validator.escape(data.targetAudienceOther));

    // Validate and sanitize URL
    if (data.websiteLink && validator.isURL(data.websiteLink)) {
        sanitized.websiteLink = data.websiteLink;
    }

    // Sanitize arrays
    if (Array.isArray(data.mainBenefits)) {
        sanitized.mainBenefits = data.mainBenefits.map(b => xss(validator.escape(b)));
    }
    if (Array.isArray(data.secondaryBenefits)) {
        sanitized.secondaryBenefits = data.secondaryBenefits.map(b => xss(validator.escape(b)));
    }
    if (Array.isArray(data.mainMessages)) {
        sanitized.mainMessages = data.mainMessages.map(m => xss(validator.escape(m)));
    }
    if (Array.isArray(data.secondaryMessages)) {
        sanitized.secondaryMessages = data.secondaryMessages.map(m => xss(validator.escape(m)));
    }

    // Sanitize other fields
    if (data.mainBenefitsOther) sanitized.mainBenefitsOther = xss(validator.escape(data.mainBenefitsOther));
    if (data.secondaryBenefitsOther) sanitized.secondaryBenefitsOther = xss(validator.escape(data.secondaryBenefitsOther));

    return sanitized;
}

// ===== ROUTES =====

// Health check endpoint
app.get('/api/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        geminiStatus: geminiService ? 'connected' : 'fallback mode',
        uptime: process.uptime()
    };

    res.json(health);
});

// Test Gemini connection
app.get('/api/test-gemini', async (req, res) => {
    if (!geminiService) {
        return res.status(503).json({
            success: false,
            message: 'Gemini service not initialized'
        });
    }

    try {
        const result = await geminiService.testConnection();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gemini test failed',
            error: error.message
        });
    }
});

// Generate prompt endpoint
app.post('/api/generate-prompt', async (req, res) => {
    try {
        const formData = req.body;

        // Validate required fields
        if (!formData.productField || !formData.productDescription) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productField and productDescription are required'
            });
        }

        console.log('📝 Generating prompt for:', formData.productField);

        // ✨ Sanitize all user inputs
        const sanitizedData = sanitizeInput(formData);

        // Build the meta-prompt with sanitized data
        const metaPrompt = promptBuilder.buildPrompt(sanitizedData);

        let generatedPrompt;
        let usedFallback = false;

        // Try to generate with Gemini
        if (geminiService) {
            try {
                const result = await geminiService.generatePrompt(metaPrompt);
                generatedPrompt = result.generatedPrompt;
                console.log('✅ Prompt generated successfully with Gemini');
            } catch (geminiError) {
                console.error('⚠️  Gemini generation failed, using fallback:', geminiError.message);
                generatedPrompt = promptBuilder.generateFallbackPrompt(sanitizedData);
                usedFallback = true;
            }
        } else {
            // Use fallback template
            generatedPrompt = promptBuilder.generateFallbackPrompt(sanitizedData);
            usedFallback = true;
            console.log('ℹ️  Using fallback template (Gemini not available)');
        }

        // Return response
        res.json({
            success: true,
            generatedPrompt: generatedPrompt,
            metadata: {
                timestamp: new Date().toISOString(),
                usedFallback: usedFallback,
                industry: sanitizedData.productField
            }
        });

    } catch (error) {
        console.error('❌ Error generating prompt:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate prompt',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get service stats (development only)
app.get('/api/stats', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const stats = geminiService ? geminiService.getStats() : { message: 'Gemini service not initialized' };
    res.json(stats);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// ===== START SERVER =====

app.listen(PORT, () => {
    console.log('\n🚀 Breeze Prompt Generator Backend Server');
    console.log('━'.repeat(50));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Gemini API: ${geminiService ? '✅ Connected' : '⚠️  Fallback mode'}`);
    console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://127.0.0.1:3001'}`);
    console.log('━'.repeat(50));
    console.log('\n📋 Available endpoints:');
    console.log('  GET  /api/health           - Health check');
    console.log('  GET  /api/test-gemini      - Test Gemini connection');
    console.log('  POST /api/generate-prompt  - Generate prompt');
    console.log('  GET  /api/stats            - Service statistics (dev only)');
    console.log('\n⏳ Waiting for requests...\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Shutting down gracefully...');
    process.exit(0);
});
