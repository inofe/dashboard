# Core Directory

## 📋 Genel Bakış

`core/` klasörü, uygulamanın temel sistem bileşenlerini barındırır. Bu dizindeki dosyalar, sistemin temel işlevselliğini sağlar ve diğer tüm bileşenler tarafından kullanılır.

## 📁 Dosya Yapısı

```
core/
├── auth.js              # Kimlik doğrulama sistemi
├── cache.js             # Önbellek yönetimi
├── database.js          # Veritabanı operasyonları
├── logger.js            # Loglama sistemi
├── module-loader.js     # Dinamik modül yükleme
├── security.js          # Güvenlik middleware'leri
├── settings.js          # Sistem ayarları API
├── setup.js             # İlk kurulum ve migration
├── theme.js             # Tema sistemi
├── uploads/             # Core upload dosyaları
├── utils.js             # Yardımcı fonksiyonlar
```

## 🔧 Ana Dosyalar

### auth.js - Kimlik Doğrulama

**Amaç:** Kullanıcı kimlik doğrulama ve yetkilendirme

**Temel Fonksiyonlar:**
```javascript
// Login işlemi
login(username, password) → Promise<{success, user, message}>

// Middleware
requireAuth(req, res, next) → void

// Password hash
hashPassword(password) → Promise<string>
```

**Güvenlik Özellikleri:**
- 🔐 bcryptjs ile şifre hashleme
- 🛡️ Session-based authentication
- ⏱️ Rate limiting desteği
- 🚫 Brute force koruması

### database.js - Veritabanı Yönetimi

**Amaç:** SQLite veritabanı operasyonları

**Core Tablolar:**
```sql
users           -- Kullanıcı hesapları
settings        -- Sistem ayarları (key-value)
posts           -- Blog yazıları
pages           -- Statik sayfalar
proposals       -- İş teklifleri
proposal_responses -- Teklif yanıtları
```

**Ana API:**
```javascript
// Generic CRUD
create(table, data) → Promise<id>
read(table, conditions) → Promise<rows>
update(table, data, conditions) → Promise<changes>
delete(table, conditions) → Promise<changes>

// Specialized functions
getAllPosts() → Promise<posts[]>
getSettingNew(category, key, default) → Promise<value>
```

### theme.js - Tema Sistemi

**Amaç:** Çoklu tema desteği ve render sistemi

**Tema Desteği:**
- 🎨 **Default** - Tailwind CSS tabanlı
- 🔥 **Modern** - Bootstrap 5 tabanlı  
- 🎯 **Custom** - Özel tema desteği

**Core Fonksiyonlar:**
```javascript
// Tema render
renderWithTheme(viewName, data) → Promise<html>

// 404 handling
render404Page(data) → Promise<html>

// Favicon
getFaviconHTML() → Promise<html>

// Tema yönetimi
getActiveTheme() → Promise<string>
getAvailableThemes() → Array<string>
```

### module-loader.js - Modül Sistemi

**Amaç:** Dinamik modül yükleme ve yönetimi

**Modül Yaşam Döngüsü:**
1. 📦 **Scan** - modules/ dizinini tara
2. 🔍 **Discover** - module.json dosyalarını oku  
3. ✅ **Validate** - Konfigürasyonu doğrula
4. 🚀 **Load** - Route'ları kaydet
5. 📊 **Status** - Durumu raporla

**API:**
```javascript
// Modül yükleme
loadEnabledModules(router) → Promise<results[]>

// Durum sorgulama  
getModuleStatus() → Promise<object>

// Menu entegrasyonu
getModuleMenuItems() → Promise<items[]>
```

### security.js - Güvenlik Katmanı

**Amaç:** Web güvenliği ve koruma

**Güvenlik Özellikleri:**
- 🛡️ **Helmet** - Security headers
- 🚫 **Rate Limiting** - DDoS koruması
- 📝 **Request Logging** - Erişim logları
- ⚠️ **Error Handling** - Güvenli hata mesajları
- 🔒 **CSP** - Content Security Policy
- 🧼 **DOMPurify** - HTML sanitization ve XSS koruması
- 📋 **Input Validation** - Kullanıcı girdisi kontrolü

**Middleware'ler:**
```javascript
securityHeaders     // Güvenlik başlıkları
requestLogger      // İstek loglama
errorHandler       // Hata yakalama
createRateLimiter  // Rate limiting
sanitizeInput      // Girdi temizleme
sanitizeBody       // Request body sanitization
```

**Yeni Güvenlik Katmanları (v1.1):**
- ✨ **Server-side sanitize-html**: Gelişmiş HTML temizleme (DOMPurify → sanitize-html)
- 🛡️ **XSS Prevention**: Script injection engellemeleri
- 📋 **CSS Style Validation**: Regex-based CSS property whitelist
- 📁 **File Security**: MIME type, uzantı, boyut kontrolleri
- 🎨 **TinyMCE Integration**: Rich text editor formatlamayı koruma

## 🧼 HTML Sanitization System (v1.1)

**Merkezi HTML Sanitization:** `core/sanitization-config.js`

Proje genelinde güvenli HTML işleme için merkezi konfigürasyon sistemi.

### Kullanım Örnekleri

#### CMS Modülleri
```javascript
// modules/cms/routes.js
const { sanitizeRichTextContent } = require('../../core/sanitization-config');

if (content) {
    content = sanitizeRichTextContent(content);
}
```

#### Public Routes  
```javascript
// routes/public.js
const { sanitizeRichTextContent } = require('../core/sanitization-config');

const sanitizedPage = {
    ...page,
    content: sanitizeRichTextContent(page.content)
};
```

#### TinyMCE Integration
```javascript
// modules/cms/views/*.ejs
const { TINYMCE_VALID_ELEMENTS } = require('../../../../core/sanitization-config');

tinymce.init({
    valid_elements: TINYMCE_VALID_ELEMENTS
});
```

### API Functions

- `sanitizeRichTextContent(content)` - Rich text sanitization
- `sanitizeSimpleText(text)` - Simple text cleaning
- `RICH_TEXT_SANITIZE_OPTIONS` - Sanitization config object
- `TINYMCE_VALID_ELEMENTS` - TinyMCE valid elements string

**Cross-References:**
- 📦 **Modules:** [`modules/README.md#tinymce-sanitization`](../modules/README.md#tinymce-sanitization)
- 🌐 **Routes:** [`routes/README.md#html-content-sanitization`](../routes/README.md#html-content-sanitization)
- 🎨 **Views:** [`views/README.md#tinymce-integration`](../views/README.md#tinymce-integration)

### settings.js - Ayar Yönetimi

**Amaç:** Kategorize edilmiş sistem ayarları

**Kategori Yapısı:**
```javascript
general: {
  company_name,
  company_logo,
  favicon,
  contact_email,
  contact_phone,
  website,
  active_theme
}

modules: {
  enabled_modules: ['cms', 'proposals']
}
```

**API:**
```javascript
// CRUD operations
getSetting(category, key, default) → Promise<value>
setSetting(category, key, value, type) → Promise<void>
getCategorySettings(category) → Promise<object>
getAllSettings() → Promise<object>

// Modül yönetimi
getEnabledModules() → Promise<string[]>
enableModule(name) → Promise<void>
disableModule(name) → Promise<void>
```

### utils.js - Yardımcı Fonksiyonlar

**Amaç:** Ortak kullanım fonksiyonları

**Slug Sistemi:**
```javascript
// Slug oluşturma
generateSlug(text) → string
createUniqueSlug(text, table, column) → Promise<string>

// Türkçe karakter desteği
"Müşteri Hizmetleri" → "musteri-hizmetleri"
```

## 🔄 Sistem Akışı

### 1. Başlatma Sırası
```
setup.js → database.js → auth.js → theme.js → module-loader.js
```

### 2. Request Lifecycle
```
security.js → auth.js → theme.js → routes → response
```

### 3. Modül Entegrasyonu
```
module-loader.js ↔ settings.js ↔ database.js
```

## 🛠️ Geliştirme Rehberi

### Yeni Core Özellik Ekleme

1. **Dosya Oluştur:** `core/new-feature.js`
2. **Export Et:** `module.exports = { functions }`
3. **Test Et:** Unit testler yazın
4. **Dokümante Et:** README güncelle

### Database Migration

```javascript
// setup.js içinde
db.run(`CREATE TABLE IF NOT EXISTS new_table (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

### Yeni Setting Kategorisi

```javascript
// settings.js içinde yeni kategori
const newCategorySettings = await getCategorySettings('new_category');
```

### Custom Theme Oluşturma

1. `themes/custom/` klasörü oluştur
2. Template dosyaları ekle (home.ejs, blog.ejs, vb.)
3. `getAvailableThemes()` otomatik keşfeder

## 🔒 Güvenlik Best Practices

### 1. Database Güvenliği
- ✅ Prepared statements kullan
- ✅ Input validation yap
- ✅ SQL injection koruması

### 2. Authentication
- ✅ Strong password policy
- ✅ Session security
- ✅ Rate limiting

### 3. File Operations
- ✅ Path traversal koruması
- ✅ File type validation
- ✅ Size limits

## 📊 Performance Optimizasyonları

### 1. Caching
```javascript
// cache.js kullanımı
const cached = cache.get('key');
if (!cached) {
    cache.set('key', data, ttl);
}
```

### 2. Database Pooling
- Connection pooling
- Query optimization
- Index kullanımı

### 3. Static File Serving
- CDN entegrasyonu
- Gzip compression
- Browser caching

## 🚨 Hata Yönetimi

### Logging Seviyeleri
```javascript
logger.error('Kritik hata', error);
logger.warn('Uyarı mesajı');
logger.info('Bilgi mesajı');
logger.debug('Debug mesajı');
```

### Error Handling Pattern
```javascript
try {
    const result = await riskyOperation();
    return { success: true, data: result };
} catch (error) {
    logger.error('Operation failed', error);
    return { success: false, error: error.message };
}
```

## 🔗 Bağımlılıklar

**Core Dependencies:**
- `sqlite3` - Database
- `bcryptjs` - Password hashing  
- `express-session` - Session management
- `multer` - File uploads
- `helmet` - Security headers
- `ejs` - Template engine

## 📝 Migration Guide

### v1.0 → v1.1
- [ ] Database schema güncellemeleri
- [ ] Yeni security headers
- [ ] Theme system v2 migration

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.0.0  
**Maintainer:** Core Team