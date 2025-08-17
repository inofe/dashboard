const logger = require('./logger');

class SimpleCache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 dakika
        this.maxSize = 1000; // Max cache entries
    }

    /**
     * Cache'e değer ekle
     */
    set(key, value, ttl = this.defaultTTL) {
        // Max size kontrolü
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }

        const expiresAt = Date.now() + ttl;
        this.cache.set(key, {
            value,
            expiresAt,
            createdAt: Date.now()
        });

        logger.debug(`Cache set: ${key}`, { ttl, size: this.cache.size });
    }

    /**
     * Cache'den değer al
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Expire kontrolü
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            logger.debug(`Cache expired: ${key}`);
            return null;
        }

        logger.debug(`Cache hit: ${key}`);
        return item.value;
    }

    /**
     * Cache'den değer sil
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            logger.debug(`Cache deleted: ${key}`);
        }
        return deleted;
    }

    /**
     * Pattern ile cache temizle
     */
    deletePattern(pattern) {
        const regex = new RegExp(pattern);
        let count = 0;
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }
        
        logger.debug(`Cache pattern deleted: ${pattern}`, { count });
        return count;
    }

    /**
     * Süresi dolmuş cache'leri temizle
     */
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        // Eğer hala fazla ise, en eskilerini sil
        if (this.cache.size >= this.maxSize) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].createdAt - b[1].createdAt);
            
            const toDelete = entries.slice(0, Math.floor(this.maxSize * 0.1)); // %10'unu sil
            toDelete.forEach(([key]) => {
                this.cache.delete(key);
                cleaned++;
            });
        }
        
        if (cleaned > 0) {
            logger.debug('Cache cleanup completed', { cleaned, remaining: this.cache.size });
        }
    }

    /**
     * Cache istatistikleri
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        
        for (const item of this.cache.values()) {
            if (now > item.expiresAt) {
                expired++;
            }
        }
        
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            expired,
            active: this.cache.size - expired
        };
    }

    /**
     * Tüm cache'i temizle
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        logger.info('Cache cleared', { previousSize: size });
    }
}

// Global cache instance
const cache = new SimpleCache();

// Periyodik temizlik (her 10 dakikada)
setInterval(() => {
    cache.cleanup();
}, 10 * 60 * 1000);

module.exports = cache;