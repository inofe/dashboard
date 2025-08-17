const express = require('express');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.moduleConfigs = new Map();
        this.menuItemsCache = null;
        this.lastScanTime = null;
        this.cacheTimeout = 30 * 1000; // 30 saniye cache
    }

    /**
     * Tüm mevcut modülleri tara ve config'lerini yükle
     */
    async scanModules() {
        // Cache kontrolü
        if (this.lastScanTime && (Date.now() - this.lastScanTime < this.cacheTimeout)) {
            return Array.from(this.moduleConfigs.keys());
        }

        const modulesDir = path.join(__dirname, '../modules');
        
        if (!fs.existsSync(modulesDir)) {
            console.log('Modules klasörü bulunamadı:', modulesDir);
            return [];
        }

        const moduleNames = fs.readdirSync(modulesDir).filter(item => {
            const itemPath = path.join(modulesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });

        logger.info('Modül taraması başlatıldı', { moduleCount: moduleNames.length });

        for (const moduleName of moduleNames) {
            try {
                await this.loadModuleConfig(moduleName);
                logger.module(moduleName, 'config loaded', true);
            } catch (error) {
                logger.module(moduleName, 'config load failed', false, { error: error.message });
            }
        }

        this.lastScanTime = Date.now();
        return Array.from(this.moduleConfigs.keys());
    }

    /**
     * Modül config dosyasını yükle
     */
    async loadModuleConfig(moduleName) {
        const configPath = path.join(__dirname, '../modules', moduleName, 'module.json');
        
        if (!fs.existsSync(configPath)) {
            throw new Error(`module.json bulunamadı: ${configPath}`);
        }

        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        
        // Varsayılan değerler
        config.name = config.name || moduleName;
        config.core = config.core || false;
        config.enabled = config.enabled !== false; // Varsayılan olarak aktif
        
        this.moduleConfigs.set(moduleName, config);
        logger.debug(`Modül config yüklendi: ${moduleName}`, { config });
        
        return config;
    }

    /**
     * Aktif modül listesini settings'den al
     */
    async getEnabledModules() {
        try {
            const { getEnabledModules } = require('./database');
            return await getEnabledModules();
        } catch (error) {
            console.error('Aktif modüller alınamadı:', error.message);
            return ['proposals']; // Fallback
        }
    }

    /**
     * Modül route'larını Express router'ına yükle
     */
    async loadModuleRoutes(moduleName, router) {
        try {
            const modulePath = path.join(__dirname, '../modules', moduleName, 'routes.js');
            
            if (!fs.existsSync(modulePath)) {
                console.log(`Routes dosyası bulunamadı: ${moduleName}/routes.js`);
                return false;
            }

            // Require cache'i temizle (development için)
            delete require.cache[require.resolve(modulePath)];
            
            const moduleRoutes = require(modulePath);
            router.use('/', moduleRoutes);
            
            this.loadedModules.set(moduleName, {
                routes: moduleRoutes,
                loadedAt: new Date()
            });

            logger.module(moduleName, 'routes loaded', true);
            return true;
        } catch (error) {
            logger.module(moduleName, 'routes load failed', false, { error: error.message });
            return false;
        }
    }

    /**
     * Tüm aktif modülleri yükle
     */
    async loadEnabledModules(router) {
        // Önce modülleri tara
        await this.scanModules();
        
        // Aktif modülleri al
        const enabledModules = await this.getEnabledModules();
        console.log('Yüklenecek modüller:', enabledModules);

        const loadResults = [];

        for (const moduleName of enabledModules) {
            // Config var mı kontrol et
            if (!this.moduleConfigs.has(moduleName)) {
                console.log(`⚠️ Modül config bulunamadı: ${moduleName}`);
                continue;
            }

            // Routes'ları yükle
            const loaded = await this.loadModuleRoutes(moduleName, router);
            loadResults.push({
                name: moduleName,
                loaded: loaded,
                config: this.moduleConfigs.get(moduleName)
            });
        }

        return loadResults;
    }

    /**
     * Modül menü items'larını topla (cached)
     */
    getModuleMenuItems() {
        // Cache kontrolü
        if (this.menuItemsCache && this.lastScanTime && 
            (Date.now() - this.lastScanTime < this.cacheTimeout)) {
            return this.menuItemsCache;
        }

        const menuItems = [];

        for (const [moduleName, config] of this.moduleConfigs) {
            if (config.menuItems && Array.isArray(config.menuItems)) {
                config.menuItems.forEach(item => {
                    menuItems.push({
                        ...item,
                        module: moduleName,
                        core: config.core || false
                    });
                });
            }
        }

        // Order'a göre sırala ve cache'le
        this.menuItemsCache = menuItems.sort((a, b) => (a.order || 99) - (b.order || 99));
        return this.menuItemsCache;
    }

    /**
     * Belirli bir modülün bilgilerini al
     */
    getModuleInfo(moduleName) {
        return {
            config: this.moduleConfigs.get(moduleName),
            loaded: this.loadedModules.has(moduleName),
            loadedAt: this.loadedModules.get(moduleName)?.loadedAt
        };
    }

    /**
     * Tüm yüklü modüllerin durumunu al
     */
    getModuleStatus() {
        const status = {};
        
        for (const [moduleName, config] of this.moduleConfigs) {
            status[moduleName] = {
                name: config.displayName || moduleName,
                version: config.version || '1.0.0',
                core: config.core || false,
                loaded: this.loadedModules.has(moduleName),
                description: config.description || '',
                category: config.category || 'other'
            };
        }

        return status;
    }

    /**
     * Modül route'larını kaldır (unload)
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            // Route'ları kaldırmak Express'te direkt mümkün değil
            // Restart gerekebilir
            this.loadedModules.delete(moduleName);
            console.log(`Modül kaldırıldı: ${moduleName}`);
            return true;
        }
        return false;
    }
}

// Singleton instance
const moduleLoader = new ModuleLoader();

module.exports = moduleLoader;