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
    async loadModuleRoutes(moduleName, router, routeType = 'dashboard') {
        try {
            const modulePath = path.join(__dirname, '../modules', moduleName, 'routes.js');
            
            if (!fs.existsSync(modulePath)) {
                console.log(`Routes dosyası bulunamadı: ${moduleName}/routes.js`);
                return false;
            }

            // Require cache'i temizle (development için)
            delete require.cache[require.resolve(modulePath)];
            
            const moduleRoutes = require(modulePath);
            
            // Module guard middleware - deaktif modüllerin route'larını engelle
            const moduleGuard = async (req, res, next) => {
                try {
                    const enabledModules = await this.getEnabledModules();
                    if (!enabledModules.includes(moduleName)) {
                        // Public route'lar için farklı davranış
                        if (routeType === 'public') {
                            return res.status(404).send('Sayfa bulunamadı');
                        }
                        
                        // Dashboard route'lar için yönlendirme
                        if (req.headers.accept && req.headers.accept.includes('text/html')) {
                            return res.redirect('/dashboard?error=module_disabled&module=' + moduleName);
                        }
                        return res.status(403).json({ 
                            error: `${moduleName} modülü devre dışı`,
                            redirect: '/dashboard'
                        });
                    }
                    next();
                } catch (error) {
                    next();
                }
            };
            
            // Route type'a göre farklı mount
            if (routeType === 'public') {
                // Public route'lar için root'ta mount et
                router.use('/', moduleGuard, moduleRoutes.publicRouter || moduleRoutes);
            } else {
                // Dashboard route'lar için normal mount
                router.use('/', moduleGuard, moduleRoutes.dashboardRouter || moduleRoutes);
            }
            
            this.loadedModules.set(moduleName, {
                routes: moduleRoutes,
                loadedAt: new Date(),
                routeType
            });

            logger.module(moduleName, `${routeType} routes loaded`, true);
            return true;
        } catch (error) {
            logger.module(moduleName, `${routeType} routes load failed`, false, { error: error.message });
            return false;
        }
    }

    /**
     * TÜM modülleri yükle (guard middleware ile korunarak)
     */
    async loadAllModules(router, routeType = 'dashboard') {
        // Önce modülleri tara
        await this.scanModules();
        
        // Aktif modülleri al (sadece log için)
        const enabledModules = await this.getEnabledModules();
        console.log(`Aktif modüller (${routeType}):`, enabledModules);

        const loadResults = [];
        
        // TÜM modülleri yükle (aktif/deaktif fark etmeksizin)
        for (const [moduleName, config] of this.moduleConfigs) {
            // Routes'ları yükle (guard ile korunacak)
            const loaded = await this.loadModuleRoutes(moduleName, router, routeType);
            loadResults.push({
                name: moduleName,
                loaded: loaded,
                config: config,
                enabled: enabledModules.includes(moduleName),
                routeType
            });
        }

        return loadResults;
    }

    /**
     * Public modül route'larını yükle
     */
    async loadPublicModules(router) {
        return await this.loadAllModules(router, 'public');
    }
    
    /**
     * Backward compatibility - eski method name
     */
    async loadEnabledModules(router) {
        return await this.loadAllModules(router);
    }

    /**
     * Modül menü items'larını topla (cached) - sadece aktif modüllerin menüleri
     */
    async getModuleMenuItems() {
        const menuItems = [];
        const enabledModules = await this.getEnabledModules();

        for (const [moduleName, config] of this.moduleConfigs) {
            // Sadece aktif modüllerin menülerini göster
            if (enabledModules.includes(moduleName) && config.menuItems && Array.isArray(config.menuItems)) {
                config.menuItems.forEach(item => {
                    menuItems.push({
                        ...item,
                        module: moduleName,
                        core: config.core || false
                    });
                });
            }
        }

        // Order'a göre sırala
        return menuItems.sort((a, b) => (a.order || 99) - (b.order || 99));
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
    async getModuleStatus() {
        const status = {};
        const enabledModules = await this.getEnabledModules();
        
        for (const [moduleName, config] of this.moduleConfigs) {
            status[moduleName] = {
                name: config.displayName || moduleName,
                version: config.version || '1.0.0',
                core: config.core || false,
                loaded: this.loadedModules.has(moduleName),
                enabled: enabledModules.includes(moduleName),
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