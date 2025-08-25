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
        
        // Modül sistemi - Dinamik modül yükleme
        console.log('📦 Modüller yükleniyor...');
        const loadResults = await moduleLoader.loadEnabledModules(dashboardRoutes);
        
        // Yükleme sonuçlarını rapor et
        loadResults.forEach(result => {
            if (result.loaded) {
                console.log(`✅ ${result.config.displayName || result.name} (${result.config.version || '1.0.0'})`);
            } else {
                console.log(`❌ ${result.name} yüklenemedi`);
            }
        });
        
        // Dashboard routes'ları app'e ekle
        app.use('/dashboard', dashboardRoutes);
        
        // Public proposal route'ları
        const publicRoutes = require('../routes/public');
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
        console.log(`📊 Toplam ${loadResults.length} modül tarandı`);
        
        // Global olarak moduleLoader'ı erişilebilir yap
        app.locals.moduleLoader = moduleLoader;
        
    } catch (error) {
        console.error('❌ Dashboard modülü yüklenirken hata:', error);
        throw error;
    }
};

module.exports = setupDashboardModule;