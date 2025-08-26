# Modules Directory

## 📋 Genel Bakış

`modules/` klasörü, sistemin modüler yapısının kalbidir. Her modül bağımsız bir özellik seti sağlar ve dinamik olarak yüklenip kaldırılabilir. Bu yaklaşım, sistemin genişletilebilirliğini ve bakımını kolaylaştırır.

## 📁 Dizin Yapısı

```
modules/
├── cms/                 # İçerik Yönetim Sistemi
│   ├── module.json      # Modül konfigürasyonu
│   ├── routes.js        # HTTP route tanımları
│   └── views/           # EJS template dosyaları
│       ├── dashboard.ejs
│       ├── media.ejs
│       ├── page-create.ejs
│       ├── pages.ejs
│       ├── post-create.ejs
│       └── posts.ejs
└── proposals/           # Teklif Yönetim Sistemi
    ├── module.json      # Modül konfigürasyonu
    ├── routes.js        # HTTP route tanımları
    └── views/           # EJS template dosyaları
        ├── create-proposal.ejs
        ├── edit-proposal.ejs
        ├── proposal-detail.ejs
        └── proposals.ejs
```

## 🏗️ Modül Mimarisi

### Temel Yapı

Her modül aşağıdaki standart yapıya sahiptir:

```
module_name/
├── module.json          # ✅ ZORUNLU - Modül tanım dosyası
├── routes.js           # ✅ ZORUNLU - Route handler'ları
├── views/              # ✅ ZORUNLU - EJS template'leri
├── assets/             # ⚠️  İSTEĞE BAĞLI - Static dosyalar
├── middleware/         # ⚠️  İSTEĞE BAĞLI - Özel middleware'ler
└── utils/              # ⚠️  İSTEĞE BAĞLI - Modül-özel yardımcılar
```

### module.json Konfigürasyonu

```json
{
    "name": "module_name",
    "displayName": "Kullanıcı Dostu İsim",
    "description": "Modül açıklaması",
    "version": "1.0.0",
    "core": true,
    "category": "content",
    "routes": {
        "/endpoint": {
            "method": "GET",
            "handler": "handlerFunction",
            "middleware": ["auth"],
            "public": false
        }
    },
    "database": {
        "tables": ["table1", "table2"],
        "migrations": []
    },
    "settings": {
        "setting_key": {
            "type": "boolean",
            "default": true,
            "description": "Setting açıklaması"
        }
    },
    "menuItems": [
        {
            "name": "Menu İsmi",
            "url": "/dashboard/module",
            "icon": "fas fa-icon",
            "order": 10
        }
    ],
    "permissions": {
        "view": ["admin"],
        "create": ["admin"],
        "edit": ["admin"],
        "delete": ["admin"]
    },
    "dependencies": {
        "core": ["database", "auth"],
        "modules": []
    },
    "enabled": true
}
```

## 📦 Mevcut Modüller

### 1. CMS (Content Management System)

**Amaç:** Blog ve sayfa yönetimi

**Özellikler:**
- 📝 **Blog Yazı Yönetimi**
  - ✨ **TinyMCE Rich Text Editor** - WYSIWYG editör
  - Oluşturma, düzenleme, silme
  - Slug otomatik oluşturma
  - Status yönetimi (draft/published)
  - Meta bilgiler (SEO)
  - Otomatik özet oluşturma

- 📄 **Sayfa Yönetimi**
  - ✨ **TinyMCE Rich Text Editor** - WYSIWYG editör
  - Statik sayfa oluşturma
  - Hiyerarşik yapı desteği
  - Custom URL'ler
  - HTML içerik güvenlik kontrolü

- 📁 **Medya Kütüphanesi**
  - 🎥 **Çoklu Medya Desteği**: Resim, Video, Ses, Döküman
  - Dosya yükleme ve yönetimi (50MB'a kadar)
  - Güvenli dosya validasyonu
  - MIME type kontrolü

**Route Yapısı:**
```
/dashboard/cms              # Ana dashboard
/dashboard/cms/posts        # Blog yazı listesi
/dashboard/cms/posts/create # Yeni yazı oluşturma
/dashboard/cms/posts/edit/:id # Yazı düzenleme
/dashboard/cms/pages        # Sayfa listesi
/dashboard/cms/pages/create # Yeni sayfa oluşturma
/dashboard/cms/media        # Medya kütüphanesi
```

**Database Tabloları:**
- `cms_posts` - Blog yazıları
- `cms_pages` - Statik sayfalar
- `cms_media` - Medya dosyaları

**Güvenlik Özellikleri:**
- 🛡️ **DOMPurify**: Server-side HTML sanitization
- 🚫 **XSS Koruması**: Zararlı script engellemeleri
- 📋 **Whitelist Tags**: Sadece güvenli HTML elementleri
- 🔒 **File Security**: MIME type, uzantı, boyut kontrolleri

### 2. Proposals (Teklif Yönetimi)

**Amaç:** İş teklifleri ve müşteri etkileşimi

**Özellikler:**
- 💼 **Teklif Oluşturma**
  - Detaylı teklif formu
  - Müşteri bilgileri
  - Proje detayları
  - Fiyatlandırma

- 🔗 **Public Link Paylaşımı**
  - Email ile doğrulama
  - Güvenli teklif görüntüleme
  - Müşteri geri bildirimleri

- 📊 **Teklif Takibi**
  - Status yönetimi
  - Yanıt takibi
  - Raporlama

**Route Yapısı:**
```
/dashboard/proposals           # Teklif listesi
/dashboard/create-proposal     # Yeni teklif
/dashboard/proposal/:id        # Teklif detayı
/dashboard/edit-proposal/:id   # Teklif düzenleme
/proposal/:id                  # Public teklif görüntüleme
```

**Database Tabloları:**
- `proposals` - Teklif bilgileri
- `proposal_responses` - Müşteri yanıtları

## 🛠️ Yeni Modül Geliştirme

### 1. Klasör Oluşturma

```bash
mkdir modules/new_module
cd modules/new_module
```

### 2. module.json Oluşturma

```json
{
    "name": "new_module",
    "displayName": "Yeni Modül",
    "description": "Modül açıklaması",
    "version": "1.0.0",
    "core": false,
    "category": "utility",
    "routes": {
        "/new-module": {
            "method": "GET",
            "handler": "dashboard",
            "middleware": ["requireAuth"],
            "public": false
        }
    },
    "menuItems": [
        {
            "name": "Yeni Modül",
            "url": "/dashboard/new-module", 
            "icon": "fas fa-cog",
            "order": 100
        }
    ],
    "enabled": true
}
```

### 3. routes.js Oluşturma

```javascript
const express = require('express');
const router = express.Router();
const path = require('path');
const ejs = require('ejs');

// Render helper
const renderView = (viewName, data = {}) => {
    return new Promise((resolve, reject) => {
        const viewPath = path.join(__dirname, 'views', `${viewName}.ejs`);
        ejs.renderFile(viewPath, data, (err, html) => {
            if (err) reject(err);
            else resolve(html);
        });
    });
};

// Dashboard ana sayfası
router.get('/new-module', async (req, res) => {
    try {
        const html = await renderView('dashboard', {
            user: req.session.user
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Render error');
    }
});

module.exports = router;
```

### 4. Views Oluşturma

```bash
mkdir views
touch views/dashboard.ejs
```

```html
<!DOCTYPE html>
<html>
<head>
    <title>Yeni Modül | Dashboard</title>
    <!-- CSS includes -->
</head>
<body>
    <h1>Yeni Modül Dashboard</h1>
    <!-- İçerik -->
</body>
</html>
```

## 🔄 Modül Yaşam Döngüsü

### 1. Discovery (Keşif)
- `module-loader.js` modül dizinlerini tarar
- `module.json` dosyalarını okur
- Konfigürasyonu validate eder

### 2. Loading (Yükleme)
- Route'ları Express router'a kaydetder
- Database tablolarını oluşturur
- Menu öğelerini kaydetder

### 3. Runtime (Çalışma)
- HTTP isteklerini handler'lara yönlendirir
- Database operasyonlarını gerçekleştirir
- View'ları render eder

### 4. Unloading (Kaldırma)
- Route'ları kaldırır (hot-reload için)
- Geçici kaynakları temizler

## ⚙️ Modül Ayarları

### Modül Aktifleştirme/Deaktifleştirme

```javascript
// Dashboard settings üzerinden
const { enableModule, disableModule } = require('../core/settings');

await enableModule('module_name');
await disableModule('module_name');
```

### Modül Durumu Sorgulama

```javascript
const moduleStatus = await moduleLoader.getModuleStatus();
console.log(moduleStatus['module_name']); // {enabled, loaded, config}
```

## 🎯 Best Practices

### 1. Kod Yapısı
```javascript
// ✅ İyi
const handler = async (req, res) => {
    try {
        const data = await getData();
        res.json({success: true, data});
    } catch (error) {
        res.status(500).json({success: false, error: error.message});
    }
};

// ❌ Kötü
const handler = (req, res) => {
    getData().then(data => res.json(data)).catch(err => res.send(err));
};
```

### 2. Error Handling
```javascript
// Her route'da try-catch kullanın
router.get('/endpoint', async (req, res) => {
    try {
        // İşlemler
    } catch (error) {
        console.error('Module error:', error);
        res.status(500).send('Bir hata oluştu');
    }
});
```

### 3. Database Operations
```javascript
// Core database fonksiyonlarını kullanın
const { create, read, update, delete: del } = require('../../core/database');

const posts = await read('posts', {status: 'published'});
```

### 4. View Rendering
```javascript
// Consistent error handling
const renderView = async (viewName, data = {}) => {
    try {
        const viewPath = path.join(__dirname, 'views', `${viewName}.ejs`);
        return await ejs.renderFile(viewPath, data);
    } catch (error) {
        console.error('View render error:', error);
        throw error;
    }
};
```

## 🔒 Güvenlik Considerations

### 1. Authentication
```javascript
// Auth middleware kullanın
const { requireAuth } = require('../../core/auth');
router.get('/protected', requireAuth, handler);
```

### 2. Input Validation
```javascript
// Girdi doğrulama
const { body, validationResult } = require('express-validator');

router.post('/create',
    [
        body('title').notEmpty().withMessage('Başlık gerekli'),
        body('content').isLength({min: 10}).withMessage('İçerik çok kısa')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        // İşlem devam eder
    }
);
```

### 2.1. TinyMCE Rich Text Sanitization (v1.1 Update)

**CMS Modülü Güvenlik Güncellemesi:** TinyMCE editörü içeriği için gelişmiş HTML sanitization

```javascript
// modules/cms/routes.js
const { sanitizeRichTextContent } = require('../../core/sanitization-config');

// Merkezi konfigürasyon kullanımı
if (content) {
    content = sanitizeRichTextContent(content);
}
```

**Özellikler:**
- ✅ **Merkezi Konfigürasyon:** `core/sanitization-config.js` kullanır
- ✅ **XSS Koruması:** Script injection engellemeleri
- ✅ **Style Preservation:** Renk ve hizalama korunumu  
- ✅ **Format Persistence:** Admin panelinde formatlar korunur

📋 **Detaylı konfigürasyon için:** [`core/README.md#html-sanitization`](../core/README.md#html-sanitization)  
🎨 **TinyMCE ayarları için:** [`views/README.md#tinymce-integration`](../views/README.md#tinymce-integration)

### 3. File Upload Security
```javascript
// Güvenli dosya yükleme
const multer = require('multer');
const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları'), false);
        }
    }
});
```

## 📊 Testing

### Unit Test Örneği
```javascript
// test/modules/cms.test.js
const request = require('supertest');
const app = require('../../app');

describe('CMS Module', () => {
    it('should list posts', async () => {
        const response = await request(app)
            .get('/dashboard/cms/posts')
            .expect(200);
        
        expect(response.text).toContain('Blog Yazıları');
    });
});
```

## 🚀 Deployment

### Production Checklist
- [ ] Module.json validation
- [ ] Database migrations tested
- [ ] Error handling complete
- [ ] Performance optimizations
- [ ] Security review
- [ ] Documentation updated

## 📝 Module Development Roadmap

### Phase 1: Foundation
- [x] Core module system
- [x] CMS module
- [x] Proposals module
- [x] Dynamic loading

### Phase 2: Enhancement
- [ ] Hot-reload support
- [ ] Module marketplace
- [ ] API versioning
- [ ] Advanced permissions

### Phase 3: Scaling
- [ ] Microservice architecture
- [ ] Module dependencies
- [ ] Plugin system
- [ ] Third-party integrations

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.0.0  
**Modül API Version:** v1