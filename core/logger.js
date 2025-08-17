const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...meta
        };
        return JSON.stringify(logEntry) + '\n';
    }

    writeToFile(filename, content) {
        try {
            const filepath = path.join(this.logDir, filename);
            fs.appendFileSync(filepath, content);
        } catch (error) {
            console.error('Log yazma hatası:', error);
        }
    }

    info(message, meta = {}) {
        const content = this.formatMessage('INFO', message, meta);
        console.log(`ℹ️ ${message}`, meta);
        this.writeToFile('app.log', content);
    }

    error(message, error = null, meta = {}) {
        const errorMeta = error ? {
            stack: error.stack,
            name: error.name,
            message: error.message,
            ...meta
        } : meta;
        
        const content = this.formatMessage('ERROR', message, errorMeta);
        console.error(`❌ ${message}`, errorMeta);
        this.writeToFile('error.log', content);
    }

    warn(message, meta = {}) {
        const content = this.formatMessage('WARN', message, meta);
        console.warn(`⚠️ ${message}`, meta);
        this.writeToFile('app.log', content);
    }

    debug(message, meta = {}) {
        if (process.env.NODE_ENV === 'development') {
            const content = this.formatMessage('DEBUG', message, meta);
            console.debug(`🐛 ${message}`, meta);
            this.writeToFile('debug.log', content);
        }
    }

    module(moduleName, action, success = true, meta = {}) {
        const message = `Module ${moduleName}: ${action}`;
        const moduleMeta = { module: moduleName, action, success, ...meta };
        
        if (success) {
            this.info(message, moduleMeta);
        } else {
            this.error(message, null, moduleMeta);
        }
        
        this.writeToFile('modules.log', this.formatMessage('MODULE', message, moduleMeta));
    }

    // Clean old logs (keep last 7 days)
    cleanOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);

            files.forEach(file => {
                const filepath = path.join(this.logDir, file);
                const stats = fs.statSync(filepath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filepath);
                    console.log(`Eski log dosyası silindi: ${file}`);
                }
            });
        } catch (error) {
            console.error('Log temizleme hatası:', error);
        }
    }
}

// Singleton instance
const logger = new Logger();

// Clean logs on startup
logger.cleanOldLogs();

module.exports = logger;