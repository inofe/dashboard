const express = require('express');
const session = require('express-session');
const path = require('path');
const compression = require('compression');
require('dotenv').config();

const logger = require('./core/logger');
const { securityHeaders, requestLogger, errorHandler, createRateLimiter } = require('./core/security');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Compression middleware
if (process.env.ENABLE_COMPRESSION === 'true') {
    app.use(compression());
}

// Security headers
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// General rate limiting
if (process.env.ENABLE_RATE_LIMITING === 'true') {
    app.use(createRateLimiter());
}

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use('/dashboard/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// Initialize database
const { initDB } = require('./core/database');

// Setup dashboard module system
const setupDashboard = async () => {
    try {
        // Initialize database
        await initDB();
        console.log('✅ Database initialized');

        // Setup modular dashboard
        const setupModule = require('./app/bootstrap');
        await setupModule(app);
        console.log('✅ Dashboard modules loaded');

        // Error handling middleware (must be last)
        app.use(errorHandler);

        // Start server
        const PORT = process.env.PORT || 3000;
        const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');
        
        app.listen(PORT, HOST, () => {
            logger.info('Dashboard server started', {
                port: PORT,
                host: HOST,
                environment: process.env.NODE_ENV || 'development',
                compression: process.env.ENABLE_COMPRESSION === 'true',
                rateLimiting: process.env.ENABLE_RATE_LIMITING === 'true'
            });
            
            console.log('🎉 Dashboard Ready!');
            const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
            console.log(`🔐 Login: http://${displayHost}:${PORT}/dashboard/login`);
            console.log(`📝 CMS: http://${displayHost}:${PORT}/dashboard/cms`);
            console.log(`📋 Proposals: http://${displayHost}:${PORT}/dashboard/proposals`);
            console.log(`⚙️ Settings: http://${displayHost}:${PORT}/dashboard/settings`);
            console.log(`🌐 Public: http://${displayHost}:${PORT}/`);
        });

    } catch (error) {
        logger.error('Dashboard startup failed', error);
        process.exit(1);
    }
};

setupDashboard();