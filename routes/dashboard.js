const express = require('express');
const path = require('path');
const ejs = require('ejs');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../core/auth');

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
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
const renderDashboard = (viewName, data = {}) => {
    return new Promise((resolve, reject) => {
        const viewPath = path.join(__dirname, '../views', 'core', `${viewName}.ejs`);
        ejs.renderFile(viewPath, data, (err, html) => {
            if (err) reject(err);
            else resolve(html);
        });
    });
};

// Dashboard ana sayfası
router.get('/', requireAuth, async (req, res) => {
    try {
        const html = await renderDashboard('index', { user: req.session.user });
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
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
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
            const html = await renderDashboard('change-password', { 
                user: req.session.user,
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
        
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
            message: 'Şifre başarıyla güncellendi',
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const html = await renderDashboard('change-password', { 
            user: req.session.user,
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
        const moduleLoader = require('../core/module-loader');
        
        const allSettings = await getAllSettingsNew();
        const enabledModules = await getEnabledModules();
        const moduleMenuItems = moduleLoader.getModuleMenuItems();
        const moduleStatus = moduleLoader.getModuleStatus();
        
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
router.post('/settings', requireAuth, upload.single('company_logo'), async (req, res) => {
    try {
        const { setSettingNew, getAllSettingsNew, getEnabledModules, enableModule, disableModule } = require('../core/database');
        const { company_name, contact_email, contact_phone, website, enabled_modules } = req.body;
        
        // Save general settings
        if (company_name) await setSettingNew('general', 'company_name', company_name);
        if (contact_email) await setSettingNew('general', 'contact_email', contact_email);
        if (contact_phone) await setSettingNew('general', 'contact_phone', contact_phone);
        if (website) await setSettingNew('general', 'website', website);
        
        // Save logo if uploaded
        if (req.file) {
            const logoPath = `/dashboard/uploads/${req.file.filename}`;
            await setSettingNew('general', 'company_logo', logoPath);
        }
        
        // Handle module enable/disable
        if (enabled_modules) {
            const requestedModules = Array.isArray(enabled_modules) ? enabled_modules : [enabled_modules];
            const currentModules = await getEnabledModules();
            
            // Available modules (burası sonra dinamik yapılacak)
            const availableModules = ['proposals', 'cms', 'analytics', 'notifications'];
            
            // Enable requested modules
            for (const moduleName of requestedModules) {
                if (availableModules.includes(moduleName) && !currentModules.includes(moduleName)) {
                    try {
                        await enableModule(moduleName);
                    } catch (err) {
                        // Core modül hatası vs, ignore
                    }
                }
            }
            
            // Disable unchecked modules (core modules protected)
            for (const moduleName of currentModules) {
                if (!requestedModules.includes(moduleName)) {
                    try {
                        await disableModule(moduleName);
                    } catch (err) {
                        // Core modül hatası, ignore
                    }
                }
            }
        }
        
        const allSettings = await getAllSettingsNew();
        const enabledModulesUpdated = await getEnabledModules();
        const moduleLoader = require('../core/module-loader');
        const moduleMenuItems = moduleLoader.getModuleMenuItems();
        const moduleStatus = moduleLoader.getModuleStatus();
        
        const html = await renderDashboard('settings', { 
            user: req.session.user,
            settings: allSettings.general || {},
            allSettings: allSettings,
            enabledModules: enabledModulesUpdated,
            moduleMenuItems: moduleMenuItems,
            moduleStatus: moduleStatus,
            message: 'Ayarlar başarıyla kaydedildi',
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const { getAllSettingsNew, getEnabledModules } = require('../core/database');
        const moduleLoader = require('../core/module-loader');
        const allSettings = await getAllSettingsNew();
        const enabledModules = await getEnabledModules();
        const moduleMenuItems = moduleLoader.getModuleMenuItems();
        const moduleStatus = moduleLoader.getModuleStatus();
        
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

// Tema toggle API
router.post('/theme/toggle', requireAuth, async (req, res) => {
    try {
        const { useModern } = req.body;
        const { setSettingNew } = require('../core/database');
        
        await setSettingNew('general', 'use_modern_theme', useModern.toString());
        res.json({ success: true, message: 'Tema başarıyla değiştirildi' });
        
    } catch (error) {
        console.error('Theme toggle error:', error);
        res.status(500).json({ success: false, error: 'Tema kaydedilirken hata oluştu' });
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