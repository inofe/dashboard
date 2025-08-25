const express = require('express');
const path = require('path');
const ejs = require('ejs');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../core/auth');
const moduleLoader = require('../core/module-loader');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'favicon' ? 'favicon' : 'logo';
        cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: parseInt(process.env.FILE_UPLOAD_LIMIT) || 2 * 1024 * 1024 }, // ENV'den limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
        }
    }
});

// Dashboard için custom render fonksiyonu
const renderDashboard = async (viewName, data = {}) => {
    try {
        const { getFaviconHTML } = require('../core/theme');
        const faviconHTML = await getFaviconHTML();
        
        const enhancedData = {
            ...data,
            faviconHTML
        };
        
        return new Promise((resolve, reject) => {
            const viewPath = path.join(__dirname, '../views', 'core', `${viewName}.ejs`);
            ejs.renderFile(viewPath, enhancedData, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });
    } catch (error) {
        console.error('Dashboard render error:', error);
        return new Promise((resolve, reject) => {
            const viewPath = path.join(__dirname, '../views', 'core', `${viewName}.ejs`);
            ejs.renderFile(viewPath, data, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });
    }
};

// Dashboard ana sayfası
router.get('/', requireAuth, async (req, res) => {
    try {
        const { getEnabledModules } = require('../core/database');
        const enabledModules = await getEnabledModules();
        
        // Modül deaktif error handling
        let errorMessage = null;
        if (req.query.error === 'module_disabled' && req.query.module) {
            const config = moduleLoader.moduleConfigs.get(req.query.module);
            errorMessage = `${config?.displayName || req.query.module} modülü şu anda devre dışı.`;
        }
        
        const html = await renderDashboard('index', { 
            user: req.session.user, 
            enabledModules: enabledModules,
            error: errorMessage
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Dashboard render hatası');
    }
});

// Login sayfası
router.get('/login', async (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    try {
        const html = await renderDashboard('login', { error: null });
        res.send(html);
    } catch (error) {
        console.error('Login render error:', error);
        res.status(500).send('Login sayfası render hatası: ' + error.message);
    }
});

// Login işlemi
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const { login } = require('../core/auth');
        const result = await login(username, password);
        
        if (result.success) {
            req.session.user = result.user;
            return res.redirect('/dashboard');
        } else {
            const html = await renderDashboard('login', { error: result.message });
            return res.send(html);
        }
    } catch (error) {
        const html = await renderDashboard('login', { error: 'Sistem hatası' });
        return res.send(html);
    }
});

// Şifre değiştirme sayfası
router.get('/change-password', requireAuth, async (req, res) => {
    try {
        const { getEnabledModules } = require('../core/database');
        const enabledModules = await getEnabledModules();
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
            enabledModules: enabledModules,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Sayfa render hatası');
    }
});

// Şifre değiştirme işlemi
router.post('/change-password', requireAuth, async (req, res) => {
    const { new_password } = req.body;
    
    try {
        if (!new_password || new_password.length < 6) {
            const { getEnabledModules } = require('../core/database');
            const enabledModules = await getEnabledModules();
            const html = await renderDashboard('change-password', { 
                user: req.session.user,
                enabledModules: enabledModules,
                message: 'Şifre en az 6 karakter olmalıdır',
                success: false
            });
            return res.send(html);
        }

        const bcrypt = require('bcryptjs');
        const { updateUserPassword } = require('../core/database');
        
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);
        await updateUserPassword(req.session.user.id, hashedPassword);
        
        const { getEnabledModules } = require('../core/database');
        const enabledModules = await getEnabledModules();
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
            enabledModules: enabledModules,
            message: 'Şifre başarıyla güncellendi',
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const { getEnabledModules } = require('../core/database');
        const enabledModules = await getEnabledModules();
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
            enabledModules: enabledModules,
            message: 'Şifre güncellenirken hata oluştu',
            success: false
        });
        res.send(html);
    }
});

// Modüller artık otomatik yükleniyor (module-loader tarafından)

// Ayarlar sayfası
router.get('/settings', requireAuth, async (req, res) => {
    try {
        const { getAllSettingsNew, getEnabledModules } = require('../core/database');
        
        const allSettings = await getAllSettingsNew();
        const enabledModules = await getEnabledModules();
        const moduleMenuItems = await moduleLoader.getModuleMenuItems();
        const moduleStatus = await moduleLoader.getModuleStatus();
        
        const html = await renderDashboard('settings', { 
            user: req.session.user,
            settings: allSettings.general || {},
            allSettings: allSettings,
            enabledModules: enabledModules,
            moduleMenuItems: moduleMenuItems,
            moduleStatus: moduleStatus,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Ayarlar sayfası yüklenirken hata oluştu');
    }
});

// Ayarları kaydetme
router.post('/settings', requireAuth, upload.fields([
    { name: 'company_logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
    try {
        const { setSettingNew, getAllSettingsNew, getEnabledModules, enableModule, disableModule } = require('../core/database');
        const { company_name, contact_email, contact_phone, website, enabled_modules } = req.body;
        
        // Save general settings
        if (company_name) await setSettingNew('general', 'company_name', company_name);
        if (contact_email) await setSettingNew('general', 'contact_email', contact_email);
        if (contact_phone) await setSettingNew('general', 'contact_phone', contact_phone);
        if (website) await setSettingNew('general', 'website', website);
        
        // Save logo if uploaded
        if (req.files && req.files['company_logo'] && req.files['company_logo'][0]) {
            const logoFile = req.files['company_logo'][0];
            const logoPath = `/dashboard/uploads/${logoFile.filename}`;
            await setSettingNew('general', 'company_logo', logoPath);
        }
        
        // Save favicon if uploaded
        if (req.files && req.files['favicon'] && req.files['favicon'][0]) {
            const faviconFile = req.files['favicon'][0];
            const faviconPath = `/dashboard/uploads/${faviconFile.filename}`;
            await setSettingNew('general', 'favicon', faviconPath);
        }
        
        // Handle module enable/disable
        await moduleLoader.scanModules();
        const moduleConfigs = moduleLoader.moduleConfigs;
        const availableModules = Array.from(moduleConfigs.keys());
        
        const requestedModules = enabled_modules ? 
            (Array.isArray(enabled_modules) ? enabled_modules : [enabled_modules]) : [];
        const currentModules = await getEnabledModules();
        
        // Modül değişikliklerini takip et
        const enabledModuleNames = [];
        const disabledModuleNames = [];
        
        // Enable requested modules
        for (const moduleName of requestedModules) {
            if (availableModules.includes(moduleName) && !currentModules.includes(moduleName)) {
                try {
                    await enableModule(moduleName);
                    const config = moduleLoader.moduleConfigs.get(moduleName);
                    enabledModuleNames.push(config?.displayName || moduleName);
                } catch (err) {
                    console.log(`Enable hatası: ${moduleName} - ${err.message}`);
                }
            }
        }
        
        // Disable unchecked modules (protected modules are handled by disableModule)
        for (const moduleName of currentModules) {
            if (!requestedModules.includes(moduleName)) {
                try {
                    await disableModule(moduleName);
                    const config = moduleLoader.moduleConfigs.get(moduleName);
                    disabledModuleNames.push(config?.displayName || moduleName);
                } catch (err) {
                    console.log(`Disable hatası: ${moduleName} - ${err.message}`);
                }
            }
        }
        
        // Başarı mesajını oluştur
        let moduleMessage = '';
        if (enabledModuleNames.length > 0) {
            moduleMessage += `✅ Aktif edilen: ${enabledModuleNames.join(', ')}`;
        }
        if (disabledModuleNames.length > 0) {
            if (moduleMessage) moduleMessage += '<br>';
            moduleMessage += `❌ Devre dışı: ${disabledModuleNames.join(', ')}`;
        }
        
        const allSettings = await getAllSettingsNew();
        const enabledModulesUpdated = await getEnabledModules();
        const moduleMenuItems = await moduleLoader.getModuleMenuItems();
        const moduleStatus = await moduleLoader.getModuleStatus();
        
        const html = await renderDashboard('settings', { 
            user: req.session.user,
            settings: allSettings.general || {},
            allSettings: allSettings,
            enabledModules: enabledModulesUpdated,
            moduleMenuItems: moduleMenuItems,
            moduleStatus: moduleStatus,
            message: moduleMessage ? `Ayarlar kaydedildi!<br>${moduleMessage}` : 'Ayarlar başarıyla kaydedildi',
            success: true,
            moduleChanged: enabledModuleNames.length > 0 || disabledModuleNames.length > 0
        });
        res.send(html);
        
    } catch (error) {
        const { getAllSettingsNew, getEnabledModules } = require('../core/database');
        const allSettings = await getAllSettingsNew();
        const enabledModules = await getEnabledModules();
        const moduleMenuItems = await moduleLoader.getModuleMenuItems();
        const moduleStatus = await moduleLoader.getModuleStatus();
        
        const html = await renderDashboard('settings', { 
            user: req.session.user,
            settings: allSettings.general || {},
            allSettings: allSettings,
            enabledModules: enabledModules,
            moduleMenuItems: moduleMenuItems,
            moduleStatus: moduleStatus,
            message: 'Ayarlar kaydedilirken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});

// Tema değiştirme API
router.post('/theme/change', requireAuth, async (req, res) => {
    try {
        const { theme } = req.body;
        const { setSettingNew } = require('../core/database');
        const { getAvailableThemes } = require('../core/theme');
        
        // Tema mevcut mu kontrol et
        const availableThemes = getAvailableThemes();
        if (!availableThemes.includes(theme)) {
            return res.status(400).json({ success: false, error: 'Geçersiz tema seçimi' });
        }
        
        await setSettingNew('general', 'active_theme', theme);
        res.json({ success: true, message: 'Tema başarıyla değiştirildi' });
        
    } catch (error) {
        console.error('Theme change error:', error);
        res.status(500).json({ success: false, error: 'Tema kaydedilirken hata oluştu' });
    }
});

// Mevcut temaları listele API
router.get('/themes', requireAuth, async (req, res) => {
    try {
        const { getAvailableThemes, getActiveTheme } = require('../core/theme');
        
        const availableThemes = getAvailableThemes();
        const activeTheme = await getActiveTheme();
        
        res.json({ 
            success: true, 
            themes: availableThemes,
            activeTheme: activeTheme
        });
        
    } catch (error) {
        console.error('Themes list error:', error);
        res.status(500).json({ success: false, error: 'Temalar listelenemedi' });
    }
});

// Aktif tema bilgisi API
router.get('/api/current-theme', requireAuth, async (req, res) => {
    try {
        const { getActiveTheme } = require('../core/theme');
        const theme = await getActiveTheme();
        res.json({ theme: theme });
        
    } catch (error) {
        console.error('Current theme error:', error);
        res.json({ theme: 'default' }); // Safe fallback
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/dashboard/login');
});

module.exports = router;