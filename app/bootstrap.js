const express = require('express');
const path = require('path');
const moduleLoader = require('../core/module-loader');

// Dashboard modülü ana dosyası
const setupDashboardModule = async (app) => {
    try {
        console.log('🚀 Modüler Dashboard başlatılıyor...');
        
        // Önce veritabanını kur
        const setupDatabase = require('../core/setup');
        await setupDatabase();
        
        // Dashboard uploads için static path
        app.use('/dashboard/uploads', express.static(path.join(__dirname, '../uploads')));
        
        // Ana dashboard route'ları (settings, auth vs)
        const dashboardRoutes = express.Router();
        const coreRoutes = require('../routes/dashboard');
        dashboardRoutes.use('/', coreRoutes);
        
        // Modül sistemi - Dashboard routes
        console.log('📦 Dashboard modülleri yükleniyor...');
        const dashboardLoadResults = await moduleLoader.loadAllModules(dashboardRoutes, 'dashboard');
        
        // Public routes için ayrı router
        const publicRoutes = express.Router();
        
        // Önce mevcut public routes'ları yükle (proposals için)
        const existingPublicRoutes = require('../routes/public');
        publicRoutes.use('/', existingPublicRoutes);
        
        // Sonra modül public routes'larını yükle  
        console.log('🌐 Public modül routes yükleniyor...');
        const publicLoadResults = await moduleLoader.loadPublicModules(publicRoutes);
        
        // Yükleme sonuçlarını rapor et
        console.log('\n📊 Dashboard Modülleri:');
        dashboardLoadResults.forEach(result => {
            if (result.loaded) {
                console.log(`✅ ${result.config.displayName || result.name} (${result.config.version || '1.0.0'})`);
            } else {
                console.log(`❌ ${result.name} dashboard yüklenemedi`);
            }
        });
        
        console.log('\n🌐 Public Modülleri:');
        publicLoadResults.forEach(result => {
            if (result.loaded) {
                console.log(`✅ ${result.config.displayName || result.name} public (${result.config.version || '1.0.0'})`);
            } else {
                console.log(`❌ ${result.name} public yüklenemedi`);
            }
        });
        
        // Routes'ları app'e ekle
        app.use('/dashboard', dashboardRoutes);
        app.use('/', publicRoutes);
        
        // Global 404 handler - EN SONDA OLMALI
        const { render404Page } = require('../core/theme');
        app.use(async (req, res, next) => {
            try {
                const html = await render404Page();
                res.status(404).send(html);
            } catch (error) {
                console.error('404 handler error:', error);
                res.status(404).send('Sayfa Bulunamadı');
            }
        });
        
        console.log('🎉 Modüler Dashboard başarıyla yüklendi!');
        console.log(`📊 Toplam ${dashboardLoadResults.length} modül tarandı`);
        
        // Global olarak moduleLoader'ı erişilebilir yap
        app.locals.moduleLoader = moduleLoader;
        
    } catch (error) {
        console.error('❌ Dashboard modülü yüklenirken hata:', error);
        throw error;
    }
};

module.exports = setupDashboardModule;