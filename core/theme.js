const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const { getSettingNew } = require('./database');

/**
 * Mevcut temaları listeler
 * @returns {Array<string>} tema adları listesi
 */
const getAvailableThemes = () => {
    try {
        const themesDir = path.join(__dirname, '../themes');
        if (!fs.existsSync(themesDir)) {
            return ['default'];
        }
        
        const themes = fs.readdirSync(themesDir).filter(item => {
            const itemPath = path.join(themesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        
        // Default tema her zaman olmalı
        if (!themes.includes('default')) {
            themes.unshift('default');
        }
        
        return themes;
    } catch (error) {
        console.error('Theme scan error:', error);
        return ['default'];
    }
};

/**
 * Aktif temayı döndürür
 * @returns {Promise<string>} tema adı
 */
const getActiveTheme = async () => {
    try {
        const activeTheme = await getSettingNew('general', 'active_theme', 'default');
        const availableThemes = getAvailableThemes();
        
        // Seçili tema mevcut mu kontrol et
        if (availableThemes.includes(activeTheme)) {
            return activeTheme;
        }
        
        return 'default'; // Safe fallback
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

/**
 * Favicon HTML tag'i oluşturur
 * @returns {Promise<string>} Favicon HTML
 */
const getFaviconHTML = async () => {
    try {
        const faviconPath = await getSettingNew('general', 'favicon', null);
        if (faviconPath) {
            // Dosya uzantısına göre type belirle
            const ext = faviconPath.toLowerCase().split('.').pop();
            let type = 'image/x-icon';
            
            if (ext === 'png') type = 'image/png';
            else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
            
            return `
    <link rel="icon" type="${type}" href="${faviconPath}">
    <link rel="shortcut icon" type="${type}" href="${faviconPath}">
    <link rel="apple-touch-icon" href="${faviconPath}">`;
        }
        return '';
    } catch (error) {
        console.error('Favicon HTML generation error:', error);
        return '';
    }
};

/**
 * 404 sayfası render eder
 * @param {object} data - Template'e gönderilecek ek data
 * @returns {Promise<string>} Render edilen HTML
 */
const render404Page = async (data = {}) => {
    try {
        const faviconHTML = await getFaviconHTML();
        const defaultData = {
            siteName: await getSettingNew('general', 'company_name', 'Website'),
            faviconHTML,
            ...data
        };
        
        return await renderWithTheme('404', defaultData);
    } catch (error) {
        console.error('404 page render error:', error);
        
        // En basit 404 sayfası fallback
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 - Sayfa Bulunamadı</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                h1 { color: #666; }
                a { color: #007bff; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>404 - Sayfa Bulunamadı</h1>
            <p>Aradığınız sayfa mevcut değil.</p>
            <a href="/">Ana Sayfaya Dön</a>
        </body>
        </html>`;
    }
};

module.exports = {
    getActiveTheme,
    renderWithTheme,
    getAvailableThemes,
    render404Page,
    getFaviconHTML
};