const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection (database.js'den import edilecek)
let db;

const initSettingsDB = (database) => {
    db = database;
};

// Temel settings CRUD operasyonları
const getSetting = (category, key, defaultValue = null) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT setting_value, type FROM settings WHERE category = ? AND setting_key = ?',
            [category, key],
            (err, row) => {
                if (err) {
                    reject(err);
                } else if (row) {
                    // Type'a göre değeri parse et
                    let value = row.setting_value;
                    if (row.type === 'boolean') {
                        value = value === 'true';
                    } else if (row.type === 'json') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = {};
                        }
                    }
                    resolve(value);
                } else {
                    resolve(defaultValue);
                }
            }
        );
    });
};

const setSetting = (category, key, value, type = 'string') => {
    return new Promise((resolve, reject) => {
        // Type'a göre değeri string'e çevir
        let stringValue = value;
        if (type === 'boolean') {
            stringValue = value ? 'true' : 'false';
        } else if (type === 'json') {
            stringValue = JSON.stringify(value);
        } else {
            stringValue = String(value);
        }

        db.run(
            `INSERT OR REPLACE INTO settings (category, setting_key, setting_value, type, updated_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [category, key, stringValue, type],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
};

// Kategori bazlı settings alma
const getCategorySettings = (category) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT setting_key, setting_value, type FROM settings WHERE category = ?',
            [category],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const settings = {};
                    rows.forEach(row => {
                        let value = row.setting_value;
                        if (row.type === 'boolean') {
                            value = value === 'true';
                        } else if (row.type === 'json') {
                            try {
                                value = JSON.parse(value);
                            } catch (e) {
                                value = {};
                            }
                        }
                        settings[row.setting_key] = value;
                    });
                    resolve(settings);
                }
            }
        );
    });
};

// Tüm ayarları al (kategori bazlı gruplandırılmış)
const getAllSettings = () => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT category, setting_key, setting_value, type FROM settings ORDER BY category, setting_key',
            [],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const settings = {};
                    rows.forEach(row => {
                        if (!settings[row.category]) {
                            settings[row.category] = {};
                        }
                        
                        let value = row.setting_value;
                        if (row.type === 'boolean') {
                            value = value === 'true';
                        } else if (row.type === 'json') {
                            try {
                                value = JSON.parse(value);
                            } catch (e) {
                                value = {};
                            }
                        }
                        settings[row.category][row.setting_key] = value;
                    });
                    resolve(settings);
                }
            }
        );
    });
};

// Modül sistemi için özel fonksiyonlar
const getEnabledModules = async () => {
    const modules = await getSetting('modules', 'enabled_modules', ['proposals']);
    return Array.isArray(modules) ? modules : ['proposals'];
};

const enableModule = async (moduleName) => {
    const modules = await getEnabledModules();
    if (!modules.includes(moduleName)) {
        modules.push(moduleName);
        await setSetting('modules', 'enabled_modules', modules, 'json');
    }
    return modules;
};

const disableModule = async (moduleName) => {
    // Core modüller devre dışı bırakılamaz
    if (moduleName === 'proposals' || moduleName === 'dashboard') {
        throw new Error(`${moduleName} core modül olduğu için devre dışı bırakılamaz`);
    }
    
    const modules = await getEnabledModules();
    const filtered = modules.filter(m => m !== moduleName);
    await setSetting('modules', 'enabled_modules', filtered, 'json');
    return filtered;
};

const getModuleSettings = async (moduleName) => {
    return await getCategorySettings(moduleName);
};

// Backward compatibility için eski API
const getSettingLegacy = (key) => {
    return getSetting('general', key);
};

const setSettingLegacy = (key, value) => {
    return setSetting('general', key, value, 'string');
};

module.exports = {
    initSettingsDB,
    getSetting,
    setSetting,
    getCategorySettings,
    getAllSettings,
    getEnabledModules,
    enableModule,
    disableModule,
    getModuleSettings,
    // Backward compatibility
    getSettingLegacy,
    setSettingLegacy
};