const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cache = require('./cache');
const logger = require('./logger');

// Data directory ENV'den al, yoksa varsayılan kullan
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, '..', 'data');

// Data klasörü yoksa oluştur
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dashboard.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const initDB = () => {
    return new Promise((resolve, reject) => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Proposals table
            db.run(`
                CREATE TABLE IF NOT EXISTS proposals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    price REAL,
                    duration TEXT,
                    customer_name TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    customer_phone TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err2) => {
                if (err2) {
                    reject(err2);
                    return;
                }
                
                // Proposal responses table
                db.run(`
                    CREATE TABLE IF NOT EXISTS proposal_responses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        proposal_id INTEGER NOT NULL,
                        response_type TEXT NOT NULL,
                        message TEXT,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (proposal_id) REFERENCES proposals (id)
                    )
                `, (err3) => {
                    if (err3) {
                        reject(err3);
                        return;
                    }
                    
                    // Settings table (genişletilmiş)
                    db.run(`
                        CREATE TABLE IF NOT EXISTS settings (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            category TEXT NOT NULL DEFAULT 'general',
                            setting_key TEXT NOT NULL,
                            setting_value TEXT,
                            type TEXT DEFAULT 'string',
                            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                            UNIQUE(category, setting_key)
                        )
                    `, (err4) => {
                        if (err4) {
                            reject(err4);
                            return;
                        }
                        
                        // CMS Pages table
                        db.run(`
                            CREATE TABLE IF NOT EXISTS cms_pages (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                title TEXT NOT NULL,
                                slug TEXT UNIQUE NOT NULL,
                                content TEXT,
                                meta_title TEXT,
                                meta_description TEXT,
                                status TEXT DEFAULT 'draft',
                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                            )
                        `, (err5) => {
                            if (err5) {
                                reject(err5);
                                return;
                            }
                            
                            // CMS Posts table
                            db.run(`
                                CREATE TABLE IF NOT EXISTS cms_posts (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    title TEXT NOT NULL,
                                    slug TEXT UNIQUE NOT NULL,
                                    content TEXT,
                                    excerpt TEXT,
                                    meta_title TEXT,
                                    meta_description TEXT,
                                    tags TEXT,
                                    status TEXT DEFAULT 'draft',
                                    published_at DATETIME,
                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                                )
                            `, (err6) => {
                                if (err6) {
                                    reject(err6);
                                    return;
                                }
                                
                                // CMS Media table
                                db.run(`
                                    CREATE TABLE IF NOT EXISTS cms_media (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        filename TEXT NOT NULL,
                                        original_name TEXT NOT NULL,
                                        mime_type TEXT,
                                        size INTEGER,
                                        path TEXT NOT NULL,
                                        alt_text TEXT,
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                                    )
                                `, (err7) => {
                                    if (err7) reject(err7);
                                    else resolve();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

// Kullanıcı bulma
const findUser = (username) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Kullanıcı oluşturma
const createUser = (username, hashedPassword) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
               [username, hashedPassword], 
               function(err) {
                   if (err) reject(err);
                   else resolve(this.lastID);
               });
    });
};

// Kullanıcı şifre güncelleme
const updateUserPassword = (userId, hashedPassword) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE users SET password = ? WHERE id = ?', 
               [hashedPassword, userId], 
               function(err) {
                   if (err) reject(err);
                   else resolve(this.changes);
               });
    });
};

// Teklif oluşturma
const createProposal = (proposalData) => {
    return new Promise((resolve, reject) => {
        const { title, description, price, duration, customer_name, customer_email, customer_phone } = proposalData;
        db.run(
            'INSERT INTO proposals (title, description, price, duration, customer_name, customer_email, customer_phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, duration, customer_name, customer_email, customer_phone],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

// Tüm teklifleri getirme (son yanıt ile birlikte)
const getAllProposals = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                p.*,
                pr.response_type as last_response_type,
                pr.created_at as last_response_date
            FROM proposals p
            LEFT JOIN proposal_responses pr ON p.id = pr.proposal_id 
                AND pr.id = (
                    SELECT id FROM proposal_responses 
                    WHERE proposal_id = p.id 
                    ORDER BY created_at DESC 
                    LIMIT 1
                )
            ORDER BY p.created_at DESC
        `;
        
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Teklif detayını getirme
const getProposalById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM proposals WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Teklif aktif/pasif durumunu değiştirme
const updateProposalStatus = (id, isActive) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE proposals SET is_active = ? WHERE id = ?', [isActive, id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Teklif yanıtı ekleme
const addProposalResponse = (proposalId, responseType, message) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO proposal_responses (proposal_id, response_type, message) VALUES (?, ?, ?)',
            [proposalId, responseType, message],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

// Teklif yanıtlarını getirme
const getProposalResponses = (proposalId) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM proposal_responses WHERE proposal_id = ? ORDER BY created_at DESC',
            [proposalId],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
};

// Teklif silme
const deleteProposal = (id) => {
    return new Promise((resolve, reject) => {
        // First delete all responses
        db.run('DELETE FROM proposal_responses WHERE proposal_id = ?', [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            // Then delete the proposal
            db.run('DELETE FROM proposals WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    });
};

// Teklif güncelleme (yanıtları da temizler)
const updateProposal = (id, proposalData) => {
    return new Promise((resolve, reject) => {
        const { title, description, price, duration, customer_name, customer_email, customer_phone } = proposalData;
        
        // First clear all responses
        db.run('DELETE FROM proposal_responses WHERE proposal_id = ?', [id], (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Then update the proposal
            db.run(
                'UPDATE proposals SET title = ?, description = ?, price = ?, duration = ?, customer_name = ?, customer_email = ?, customer_phone = ? WHERE id = ?',
                [title, description, price, duration, customer_name, customer_email, customer_phone, id],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    });
};

// Settings fonksiyonları
// Legacy settings functions (backward compatibility)
const getSetting = (key) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT setting_value FROM settings WHERE category = ? AND setting_key = ?', ['general', key], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.setting_value : null);
        });
    });
};

const setSetting = (key, value) => {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT OR REPLACE INTO settings (category, setting_key, setting_value, type, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
            ['general', key, value, 'string'],
            function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
};

const getAllSettings = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT category, setting_key, setting_value FROM settings WHERE category = ?', ['general'], (err, rows) => {
            if (err) reject(err);
            else {
                // Convert to object (backward compatibility)
                const settings = {};
                rows.forEach(row => {
                    settings[row.setting_key] = row.setting_value;
                });
                resolve(settings);
            }
        });
    });
};

// CMS Functions
// Create a new page
const createPage = (pageData) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, meta_title, meta_description, status } = pageData;
        const finalSlug = slug || title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
            .replace(/-+/g, '-').replace(/^-|-$/g, '');
            
        db.run(
            'INSERT INTO cms_pages (title, slug, content, meta_title, meta_description, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title, finalSlug, content, meta_title, meta_description, status || 'draft'],
            function(err) {
                if (err) {
                    logger.error('createPage database error', err);
                    reject(err);
                } else {
                    // Cache invalidation
                    cache.deletePattern('pages:');
                    logger.debug('Page created, cache invalidated', { id: this.lastID, slug: finalSlug });
                    resolve(this.lastID);
                }
            }
        );
    });
};

// Get all pages (with cache)
const getAllPages = () => {
    return new Promise((resolve, reject) => {
        const cacheKey = 'pages:all';
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return resolve(cached);
        }
        
        db.all('SELECT * FROM cms_pages ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                logger.error('getAllPages database error', err);
                reject(err);
            } else {
                const result = rows || [];
                cache.set(cacheKey, result, 2 * 60 * 1000); // 2 dakika cache
                resolve(result);
            }
        });
    });
};

// Get page by ID
const getPageById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cms_pages WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Update page
const updatePage = (id, pageData) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, meta_title, meta_description, status } = pageData;
        db.run(
            'UPDATE cms_pages SET title = ?, slug = ?, content = ?, meta_title = ?, meta_description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, slug, content, meta_title, meta_description, status, id],
            function(err) {
                if (err) {
                    logger.error('updatePage database error', err);
                    reject(err);
                } else {
                    cache.deletePattern('pages:');
                    logger.debug('Page updated, cache invalidated', { id });
                    resolve(this.changes);
                }
            }
        );
    });
};

// Delete page
const deletePage = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM cms_pages WHERE id = ?', [id], function(err) {
            if (err) {
                logger.error('deletePage database error', err);
                reject(err);
            } else {
                cache.deletePattern('pages:');
                logger.debug('Page deleted, cache invalidated', { id });
                resolve(this.changes);
            }
        });
    });
};

// Create a new post
const createPost = (postData) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, excerpt, meta_title, meta_description, tags, status } = postData;
        const finalSlug = slug || title.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
            .replace(/-+/g, '-').replace(/^-|-$/g, '');
            
        const published_at = status === 'published' ? new Date().toISOString() : null;
            
        db.run(
            'INSERT INTO cms_posts (title, slug, content, excerpt, meta_title, meta_description, tags, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, finalSlug, content, excerpt, meta_title, meta_description, tags, status || 'draft', published_at],
            function(err) {
                if (err) {
                    logger.error('createPost database error', err);
                    reject(err);
                } else {
                    cache.deletePattern('posts:');
                    logger.debug('Post created, cache invalidated', { id: this.lastID, slug: finalSlug });
                    resolve(this.lastID);
                }
            }
        );
    });
};

// Get all posts (with cache)
const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        const cacheKey = 'posts:all';
        const cached = cache.get(cacheKey);
        
        if (cached) {
            return resolve(cached);
        }
        
        db.all('SELECT * FROM cms_posts ORDER BY created_at DESC', (err, rows) => {
            if (err) {
                logger.error('getAllPosts database error', err);
                reject(err);
            } else {
                const result = rows || [];
                cache.set(cacheKey, result, 2 * 60 * 1000); // 2 dakika cache
                resolve(result);
            }
        });
    });
};

// Get post by ID
const getPostById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cms_posts WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Update post
const updatePost = (id, postData) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, excerpt, meta_title, meta_description, tags, status } = postData;
        const published_at = status === 'published' ? new Date().toISOString() : null;
        
        db.run(
            'UPDATE cms_posts SET title = ?, slug = ?, content = ?, excerpt = ?, meta_title = ?, meta_description = ?, tags = ?, status = ?, published_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, slug, content, excerpt, meta_title, meta_description, tags, status, published_at, id],
            function(err) {
                if (err) {
                    logger.error('updatePost database error', err);
                    reject(err);
                } else {
                    cache.deletePattern('posts:');
                    logger.debug('Post updated, cache invalidated', { id });
                    resolve(this.changes);
                }
            }
        );
    });
};

// Delete post
const deletePost = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM cms_posts WHERE id = ?', [id], function(err) {
            if (err) {
                logger.error('deletePost database error', err);
                reject(err);
            } else {
                cache.deletePattern('posts:');
                logger.debug('Post deleted, cache invalidated', { id });
                resolve(this.changes);
            }
        });
    });
};

// Save media file info
const saveMediaFile = (mediaData) => {
    return new Promise((resolve, reject) => {
        const { filename, original_name, mime_type, size, path, alt_text } = mediaData;
        db.run(
            'INSERT INTO cms_media (filename, original_name, mime_type, size, path, alt_text) VALUES (?, ?, ?, ?, ?, ?)',
            [filename, original_name, mime_type, size, path, alt_text || ''],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
};

// Get all media files
const getAllMediaFiles = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM cms_media ORDER BY created_at DESC', (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

// Get media file by ID
const getMediaFileById = (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM cms_media WHERE id = ?', [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

// Delete media file
const deleteMediaFile = (id) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM cms_media WHERE id = ?', [id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

// Initialize new settings system
const settingsAPI = require('./settings');
settingsAPI.initSettingsDB(db);

module.exports = {
    initDB,
    findUser,
    createUser,
    updateUserPassword,
    createProposal,
    getAllProposals,
    getProposalById,
    updateProposalStatus,
    addProposalResponse,
    getProposalResponses,
    deleteProposal,
    updateProposal,
    // Legacy settings (backward compatibility)
    getSetting,
    setSetting,
    getAllSettings,
    // New settings system
    settingsAPI,
    // Direct access to new settings functions
    getSettingNew: settingsAPI.getSetting,
    setSettingNew: settingsAPI.setSetting,
    getCategorySettings: settingsAPI.getCategorySettings,
    getAllSettingsNew: settingsAPI.getAllSettings,
    getEnabledModules: settingsAPI.getEnabledModules,
    enableModule: settingsAPI.enableModule,
    disableModule: settingsAPI.disableModule,
    getModuleSettings: settingsAPI.getModuleSettings,
    // CMS functions
    createPage,
    getAllPages,
    getPageById,
    updatePage,
    deletePage,
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    saveMediaFile,
    getAllMediaFiles,
    getMediaFileById,
    deleteMediaFile
};