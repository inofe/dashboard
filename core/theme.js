const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const { getSettingNew } = require('./database');

/**
 * Aktif temayı döndürür
 * @returns {Promise<string>} tema adı ('default' veya 'modern')
 */
const getActiveTheme = async () => {
    try {
        const useModern = await getSettingNew('general', 'use_modern_theme', 'false');
        return useModern === 'true' ? 'modern' : 'default';
    } catch (error) {
        console.error('Theme setting error:', error);
        return 'default'; // Safe fallback
    }
};

/**
 * Tema ile render yapar, hata durumunda fallback kullanır
 * @param {string} viewName - Template adı (örn: 'blog', 'home')
 * @param {object} data - Template'e gönderilecek data
 * @returns {Promise<string>} Render edilen HTML
 */
const renderWithTheme = async (viewName, data = {}) => {
    try {
        const theme = await getActiveTheme();
        
        // Tema template yolu
        const themePath = path.join(__dirname, '../themes', theme, `${viewName}.ejs`);
        
        // Fallback yolu (orijinal template)
        const fallbackPath = path.join(__dirname, '../views/public', `${viewName}.ejs`);
        
        // EJS için views dizinini set et
        const ejsOptions = {
            views: [
                path.join(__dirname, '../views'), // Ana views klasörü
                path.join(__dirname, '../themes', theme), // Aktif tema klasörü
                path.join(__dirname, '../themes/default'), // Default tema klasörü
                path.join(__dirname, '../themes', theme, 'partials'), // Tema partials klasörü
                path.join(__dirname, '../themes/default/partials') // Default tema partials klasörü
            ]
        };
        
        // Önce tema template'ini dene
        if (fs.existsSync(themePath)) {
            return await ejs.renderFile(themePath, data, ejsOptions);
        }
        
        // Tema template yoksa orijinal template'i kullan
        if (fs.existsSync(fallbackPath)) {
            return await ejs.renderFile(fallbackPath, data, ejsOptions);
        }
        
        throw new Error(`Template not found: ${viewName}`);
        
    } catch (error) {
        console.error(`Theme render error for ${viewName}:`, error);
        
        // Son çare: orijinal template'i dene
        try {
            const fallbackPath = path.join(__dirname, '../views/public', `${viewName}.ejs`);
            const ejsOptions = {
                views: [
                    path.join(__dirname, '../views'),
                    path.join(__dirname, '../themes/default/partials')
                ]
            };
            return await ejs.renderFile(fallbackPath, data, ejsOptions);
        } catch (fallbackError) {
            console.error('Fallback render error:', fallbackError);
            throw fallbackError;
        }
    }
};

module.exports = {
    getActiveTheme,
    renderWithTheme
};