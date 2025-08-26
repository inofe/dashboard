# Routes Directory

## 📋 Genel Bakış

`routes/` klasörü, uygulamanın HTTP route tanımlarını barındırır. Bu dizin, URL endpoint'lerini ve bunlara karşılık gelen handler fonksiyonlarını organize eder. Route sistemi, modüler yapı ile tamamlayıcı olarak çalışır.

## 📁 Dizin Yapısı

```
routes/
├── dashboard.js         # Dashboard (admin panel) route'ları
└── public.js           # Public (ziyaretçi) route'ları
```

## 🌐 Route Kategorileri

### 1. Dashboard Routes (`dashboard.js`)

**Base URL:** `/dashboard`
**Amaç:** Admin panel ve yönetim işlevleri

**Ana Endpoint'ler:**
```
GET  /dashboard                    # Ana dashboard sayfası
GET  /dashboard/login              # Login sayfası  
POST /dashboard/login              # Login işlemi
POST /dashboard/logout             # Çıkış yapma
GET  /dashboard/settings           # Sistem ayarları
POST /dashboard/settings           # Ayarları kaydetme
GET  /dashboard/change-password    # Şifre değiştirme sayfası
POST /dashboard/change-password    # Şifre değiştirme işlemi
```

**Tema API'leri:**
```
POST /dashboard/theme/change       # Tema değiştirme
GET  /dashboard/themes             # Mevcut temaları listeleme
GET  /dashboard/api/current-theme  # Aktif tema bilgisi
```

**Özellikler:**
- 🔐 **Authentication:** `requireAuth` middleware ile korunur
- 📤 **File Upload:** Multer ile logo/favicon yükleme
- ⚙️ **Settings Management:** Kategorize edilmiş ayar sistemi
- 🎨 **Theme Management:** Dinamik tema değiştirme
- 📊 **Module Management:** Modül aktifleştirme/deaktifleştirme

### 2. Public Routes (`public.js`)

**Base URL:** `/` (root)
**Amaç:** Public web sitesi ve ziyaretçi erişimi

**Ana Endpoint'ler:**
```
GET  /                             # Ana sayfa
GET  /blog                         # Blog ana sayfası
GET  /blog/:slug                   # Blog yazısı detayı
GET  /page/:slug                   # Sayfa detayı
GET  /proposal/:id                 # Teklif görüntüleme
POST /proposal/:id/verify          # Email doğrulama
POST /proposal/:id/response        # Teklif yanıtlama
```

**Özellikler:**
- 🎨 **Theme Support:** Aktif tema ile rendering
- 📱 **Responsive:** Mobil uyumlu tasarım
- 🔒 **Email Verification:** Teklif erişimi için email doğrulama
- 🌐 **SEO Friendly:** Meta tag desteği
- 📄 **Content Management:** Published içerik filtreleme
- 🛡️ **HTML Sanitization (v1.1):** sanitize-html ile XSS koruması ve style preservation

## 🔧 Route Handler Yapısı

### Dashboard Route Pattern

```javascript
router.get('/endpoint', requireAuth, async (req, res) => {
    try {
        // 1. Data fetching
        const data = await getData();
        
        // 2. Template rendering
        const html = await renderDashboard('template', {
            user: req.session.user,
            data: data
        });
        
        // 3. Response
        res.send(html);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).send('Hata oluştu');
    }
});
```

### Public Route Pattern

```javascript
router.get('/endpoint', async (req, res) => {
    try {
        // 1. Data fetching
        const data = await getPublicData();
        
        // 2. Theme-based rendering
        const html = await renderPublicView('template', {
            siteName: await getSettingNew('general', 'company_name'),
            faviconHTML: await getFaviconHTML(),
            data: data
        });
        
        // 3. Response with proper headers
        res.send(html);
    } catch (error) {
        console.error('Public route error:', error);
        const html = await render404Page();
        res.status(404).send(html);
    }
});
```

## 🛠️ File Upload Sistemi

### Multer Konfigürasyonu

```javascript
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
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
        }
    }
});
```

### Multi-file Upload

```javascript
// Logo ve favicon aynı anda yükleme
router.post('/settings', requireAuth, upload.fields([
    { name: 'company_logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
    // Logo handling
    if (req.files && req.files['company_logo']) {
        const logoPath = `/dashboard/uploads/${req.files['company_logo'][0].filename}`;
        await setSettingNew('general', 'company_logo', logoPath);
    }
    
    // Favicon handling
    if (req.files && req.files['favicon']) {
        const faviconPath = `/dashboard/uploads/${req.files['favicon'][0].filename}`;
        await setSettingNew('general', 'favicon', faviconPath);
    }
});
```

## 🎨 Theme Integration

### Public Route Rendering

```javascript
const renderPublicView = async (viewName, data = {}) => {
    try {
        // Favicon HTML'i tüm sayfalara ekle
        const faviconHTML = await getFaviconHTML();
        const enhancedData = {
            ...data,
            faviconHTML
        };
        
        return await renderWithTheme(viewName, enhancedData);
    } catch (error) {
        // Fallback rendering
        const viewPath = path.join(__dirname, '../views', 'public', `${viewName}.ejs`);
        const faviconHTML = await getFaviconHTML();
        return await ejs.renderFile(viewPath, { ...data, faviconHTML });
    }
};
```

### Dashboard Rendering

```javascript
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
        // Fallback without favicon
    }
};
```

## 🔒 Authentication & Security

### Auth Middleware

```javascript
const requireAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.redirect('/dashboard/login');
    }
};
```

### Session Management

```javascript
// Login success
req.session.user = result.user;
req.session.save(() => {
    res.redirect('/dashboard');
});

// Logout
req.session.destroy((err) => {
    if (err) {
        console.error('Session destroy error:', err);
    }
    res.redirect('/dashboard/login');
});
```

### HTML Content Sanitization (v1.1 Update)

**Public Routes Güvenlik:** Merkezi sanitization sistemi ile güvenli içerik görünümü

```javascript
// routes/public.js
const { sanitizeRichTextContent } = require('../core/sanitization-config');

// Blog ve sayfa içeriği sanitization
const sanitizedPage = {
    ...page,
    content: sanitizeRichTextContent(page.content)
};
```

**Avantajları:**
- ✅ **Merkezi Yönetim:** Tek konfigürasyon dosyası
- ✅ **XSS Koruması:** Script injection engellemeleri
- ✅ **Style Korunumu:** TinyMCE formatlamalarını korur

📋 **Sanitization konfigürasyonu:** [`core/sanitization-config.js`](../core/sanitization-config.js)
```

### Rate Limiting

```javascript
// Security middleware'den rate limiting
app.use(createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100 // maksimum 100 istek
}));
```

## 📊 Module Route Integration

### Dynamic Module Loading

```javascript
// app/bootstrap.js içinde
const moduleRoutes = await moduleLoader.loadEnabledModules(dashboardRoutes);
app.use('/dashboard', dashboardRoutes);
```

### Module Route Protection

```javascript
// Module guard middleware
const createModuleGuard = (moduleName) => {
    return async (req, res, next) => {
        const enabledModules = await getEnabledModules();
        if (enabledModules.includes(moduleName)) {
            next();
        } else {
            const config = moduleLoader.moduleConfigs.get(moduleName);
            res.redirect(`/dashboard?error=module_disabled&module=${moduleName}`);
        }
    };
};
```

## 📝 API Response Patterns

### Success Response

```javascript
// JSON API response
res.json({
    success: true,
    data: result,
    message: 'İşlem başarılı'
});

// HTML response
const html = await renderView('template', data);
res.send(html);
```

### Error Response

```javascript
// JSON error
res.status(400).json({
    success: false,
    error: 'Validation error',
    details: validationErrors
});

// HTML error
res.status(500).send('Bir hata oluştu');

// 404 with themed page
const html = await render404Page();
res.status(404).send(html);
```

## 🔄 Request Lifecycle

### Dashboard Request Flow

```
1. HTTP Request → Express Router
2. Security Middleware (helmet, rate limiting)
3. Session Middleware (express-session)  
4. Authentication Middleware (requireAuth)
5. Module Guard Middleware (if applicable)
6. Route Handler
   ├── Data Fetching (database operations)
   ├── Business Logic
   └── Template Rendering
7. HTTP Response
```

### Public Request Flow

```
1. HTTP Request → Express Router
2. Security Middleware
3. Route Handler
   ├── Content Filtering (published only)
   ├── Theme Resolution
   └── Template Rendering with Theme
4. HTTP Response with proper headers
```

## 🚀 Performance Optimizations

### Caching Strategies

```javascript
// Template caching
const templateCache = new Map();

const renderCached = async (template, data) => {
    const cacheKey = `${template}-${JSON.stringify(data)}`;
    if (templateCache.has(cacheKey)) {
        return templateCache.get(cacheKey);
    }
    
    const html = await renderTemplate(template, data);
    templateCache.set(cacheKey, html);
    return html;
};
```

### Database Query Optimization

```javascript
// Pagination for large datasets
router.get('/posts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    
    const posts = await db.all(
        'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
});
```

## 🧪 Testing Routes

### Integration Test Example

```javascript
const request = require('supertest');
const app = require('../app');

describe('Dashboard Routes', () => {
    describe('GET /dashboard/login', () => {
        it('should return login page', async () => {
            const response = await request(app)
                .get('/dashboard/login')
                .expect(200);
            
            expect(response.text).toContain('Giriş');
        });
    });
    
    describe('POST /dashboard/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/dashboard/login')
                .send({
                    username: 'admin',
                    password: 'admin123'
                })
                .expect(302); // Redirect after login
        });
    });
});
```

## 📊 Route Monitoring

### Request Logging

```javascript
// Custom request logger
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    
    next();
};
```

### Error Tracking

```javascript
// Error middleware
const errorHandler = (err, req, res, next) => {
    logger.error('Route error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });
    
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
};
```

## 📝 Development Guidelines

### 1. Route Naming Convention
```javascript
// ✅ İyi
GET  /dashboard/users           # Liste
GET  /dashboard/users/:id       # Detay  
POST /dashboard/users           # Oluşturma
PUT  /dashboard/users/:id       # Güncelleme
DELETE /dashboard/users/:id     # Silme

// ❌ Kötü
GET  /dashboard/getUserList
POST /dashboard/createNewUser
```

### 2. Error Handling
```javascript
// ✅ Her route'da try-catch
router.get('/endpoint', async (req, res) => {
    try {
        const result = await operation();
        res.json({success: true, data: result});
    } catch (error) {
        console.error('Operation failed:', error);
        res.status(500).json({success: false, error: error.message});
    }
});
```

### 3. Validation
```javascript
// ✅ Input validation
const { body, validationResult } = require('express-validator');

router.post('/create', [
    body('title').notEmpty().withMessage('Başlık gerekli'),
    body('email').isEmail().withMessage('Geçerli email girin')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    // İşlem devam eder
});
```

## 🔗 İlişkili Dosyalar

- `app/bootstrap.js` - Route kayıt sistemi
- `core/auth.js` - Authentication middleware
- `core/theme.js` - Theme rendering functions
- `modules/*/routes.js` - Module-specific routes
- `views/` - Template dosyaları

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.0.0  
**Express Version:** ^4.18.0