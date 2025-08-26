# 🚀 Modüler Admin Dashboard Sistemi

## 📋 Proje Özeti

Bu proje, **iş teklifleri** ve **içerik yönetimi** için geliştirilmiş modern bir dashboard sistemidir. Modüler yapısı, dinamik tema sistemi ve kapsamlı güvenlik özellikleriyle production-ready bir platform sunar.

## 🎯 Ana Özellikler

### 💼 Teklif Yönetimi (Proposals)
- Müşteri teklifleri oluşturma ve düzenleme
- Müşteri yanıt takibi ve geri bildirim sistemi
- Tekliflerin public link ile paylaşımı
- Aktif/pasif teklif durumu yönetimi

### 📝 İçerik Yönetimi (CMS)
- **Blog sistemi**: ✨ TinyMCE WYSIWYG editör ile yazı oluşturma, düzenleme, yayınlama
- **Sayfa yönetimi**: Rich text editör ile statik sayfalar (Hakkımızda, İletişim vb.)
- **Medya kütüphanesi**: 🎥 Çoklu medya desteği (resim, video, ses, döküman, 50MB)
- **Güvenlik**: DOMPurify ile HTML sanitization, XSS koruması
- **SEO desteği**: Meta taglar ve arama motoru optimizasyonu

### 🎨 Tema Sistemi
- **Çoklu tema desteği**: Default (Tailwind), Modern (Bootstrap 5), özel temalar
- **Runtime tema değişimi**: Dashboard'dan canlı tema seçimi
- **Favicon sistemi**: Otomatik favicon entegrasyonu
- **404 sayfaları**: Tema-uyumlu hata sayfaları
- **SEO optimizasyonu**: Meta tags, structured data, performans

### 🔧 Sistem Yönetimi
- **Dinamik modül sistemi**: Hot-load/unload, dependency management
- **Kapsamlı güvenlik**: CSP, rate limiting, input validation, CSRF
- **Gelişmiş ayarlar**: Kategorize settings, module control
- **Upload sistemi**: Multi-file, validation, favicon/logo desteği

## 🏗️ Teknoloji Yapısı

### Backend
- **Node.js** + Express.js
- **SQLite** veritabanı
- **EJS** template engine
- **Güvenlik**: Helmet, bcrypt, rate limiting

### Frontend
- **Bootstrap 5** (Modern tema)
- **Tailwind CSS** (Default tema)
- **Vanilla JavaScript** + AJAX
- **Font Awesome** iconlar

## 🏗️ Sistem Mimarisi ve Klasör İlişkileri

### 📁 Ana Yapı ve Bağımlılık Akışı

```
dashboard/
├── app/                 # Bootstrap sistemi → core/* → modules/* → routes/*
├── core/                # Temel sistem katmanı → tüm diğer katmanlar
├── modules/             # İş mantığı katmanı → core/* ↔ routes/* ↔ views/*
├── routes/              # HTTP katmanı → core/* → modules/* → views/*
├── themes/              # Görsel katman → core/theme.js ↔ routes/public.js
├── views/               # Template katmanı → routes/dashboard.js
├── data/                # Veri katmanı → core/database.js
└── uploads/             # Dosya katmanı → routes/* → core/security.js
```

### 🔄 Sistem Akış Zincirleri

#### 1. **Başlangıç Akışı**
```
server.js → app/bootstrap.js → core/setup.js → core/database.js → core/module-loader.js
```

#### 2. **HTTP Request Akışı**  
```
routes/* → core/auth.js → core/security.js → modules/* → themes/* → response
```

#### 3. **Modül Yaşam Döngüsü**
```
core/module-loader.js ↔ core/settings.js ↔ modules/*/routes.js ↔ routes/dashboard.js
```

#### 4. **Tema Render Akışı**
```
routes/public.js → core/theme.js → themes/*/template.ejs → response
```

### 📊 Katmanlar Arası İletişim

| Katman | Bağımlı Olduğu | Bağımlı Olan | Ana İşlev |
|--------|----------------|--------------|-----------|
| **app/** | core/* | server.js | Sistem başlatma ve orkestrasyon |
| **core/** | - | tüm katmanlar | Temel sistem servisleri |
| **modules/** | core/* | routes/*, views/* | İş mantığı ve özellikler |
| **routes/** | core/*, modules/* | views/*, themes/* | HTTP endpoint yönetimi |
| **themes/** | core/theme.js | routes/public.js | Public görünüm katmanı |
| **views/** | core/* | routes/dashboard.js | Admin template katmanı |

## 🚀 Kurulum ve Çalıştırma

### Native Installation
```bash
# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm start
# veya
node server.js
```

### Docker Installation
```bash
# .env dosyasını oluştur
cp .env.example .env

# Docker ile başlat
docker-compose up --build

# Farklı portta çalıştır
PORT=8080 EXTERNAL_PORT=8080 docker-compose up -d
```

**Erişim adresleri:**
- Dashboard: http://localhost:3000/dashboard/login
- Public site: http://localhost:3000

**Varsayılan admin:** admin / admin123

## 📊 Kullanım Alanları

✅ **Hizmet sağlayıcıları** - Müşteri teklifleri ve takibi
✅ **Ajanslar** - Proje yönetimi ve müşteri iletişimi  
✅ **Blog yazarları** - İçerik üretimi ve yayınlama
✅ **Küçük işletmeler** - Kurumsal web sitesi yönetimi
✅ **Freelancerlar** - Portföy ve teklif sunumu

## 🔒 Güvenlik ve Performans

### Güvenlik Katmanları (core/security.js)
- **Multi-layered Authentication**: bcrypt + session management
- **Request Protection**: Rate limiting, CSRF tokens, input validation
- **Content Security**: CSP headers, DOMPurify HTML sanitization, XSS prevention
- **File Security**: MIME type validation, uzantı kontrolü, boyut sınırı
- **Database Security**: Prepared statements, SQL injection prevention

### Performance Optimizations
- **Template Caching**: EJS cache + custom cache layer
- **Asset Optimization**: CDN integration, compression, lazy loading
- **Database Performance**: Query optimization, connection pooling
- **Module System**: Dynamic loading, memory management

## 🛠️ Geliştirme Rehberleri

### 🎨 Tema Geliştirme (themes/README.md)
- **Çoklu CSS Framework**: Tailwind, Bootstrap, Bulma, custom
- **Advanced Features**: Dark mode, responsive, SEO, analytics
- **Development Tools**: Live reload, debugging, testing
- **Template System**: EJS, partials, favicon injection, 404 pages

### 📦 Modül Geliştirme (modules/README.md) 
- **Modular Architecture**: Independent, hot-loadable modules
- **Configuration**: module.json, route definitions, permissions
- **Lifecycle Management**: Discovery, loading, runtime, unloading
- **Integration**: Menu items, settings, database tables

### 🔧 Sistem Entegrasyonu
- **Core Services** (core/README.md): Auth, database, theme, security
- **Route Management** (routes/README.md): Dashboard, public, file uploads
- **Template System** (views/README.md): EJS patterns, partials, optimization
- **Bootstrap System** (app/README.md): Startup, middleware, error handling

## 🔧 Teknik Detaylar

- **Veritabanı**: SQLite (geliştirme), PostgreSQL/MySQL (production)
- **Session**: File store (geliştirme), Redis (production)
- **Uploads**: Local filesystem (geliştirme), S3/CDN (production)
- **Logging**: File-based system
- **Caching**: In-memory cache sistem
- **Containerization**: Docker + docker-compose
- **Port Management**: Dynamic ENV-based port configuration

## 🐳 Docker Özellikler

- **Dinamik Port**: PORT ve EXTERNAL_PORT ENV variables
- **Volume Persistence**: data, uploads, logs klasörleri
- **Health Checks**: Container sağlık durumu izleme
- **Auto Restart**: Container otomatik yeniden başlatma
- **Multi-Environment**: development/production desteği

## 📚 Dokümantasyon Sistemi

### README Organizasyonu
- **CLAUDE.md** (bu dosya): Ana proje yönetimi, sistem ilişkileri, genel rehber
- **Klasör-spesifik README'ler**: Detaylı teknik dokümantasyon, kod örnekleri
- **Cross-reference**: Her README birbirine atıfta bulunur
- **.claude/**: AI assistance workflow talimatları ve proje-özel system prompt'lar

### Dokümantasyon Katmanları
1. **Yönetim Katmanı**: CLAUDE.md → sistem overview, ilişkiler
2. **Teknik Katman**: */README.md → implementation details, API docs  
3. **Kullanıcı Katmanı**: Dashboard UI → kullanıcı rehberleri
4. **AI Assistance Katmanı**: .claude/* → development workflow, standards

## 🚀 Roadmap ve Genişletme

### Mevcut Durum (v1.0)
- ✅ **Full-stack Dashboard**: Production-ready
- ✅ **Module System**: Dynamic loading
- ✅ **Theme System**: Multi-theme support  
- ✅ **Security**: Enterprise-grade
- ✅ **Documentation**: Comprehensive

### Gelecek Hedefler
- 📧 **Notification System**: Email, SMS, push notifications
- 👥 **Multi-user**: Role-based access control
- 🔌 **API Layer**: REST/GraphQL endpoints
- 📊 **Analytics**: Dashboard metrics, user tracking
- 🌍 **Internationalization**: Multi-language support

---

## 🤖 Yeni Konuşma - Proje Tanıma Rehberi

### **📚 Öncelik Sıralaması:**

#### 1. **🎯 CLAUDE.md** (İLK ÖNCE - BU DOSYA)
- ✅ Ana proje özeti ve genel bakış
- ✅ Sistem mimarisi ve klasörler arası ilişkiler  
- ✅ Teknoloji stack'i ve temel özellikler

#### 2. **🤖 .claude/system-prompt.md** (İKİNCİ)
- ✅ Çalışma akışı kuralları (4 aşama)
- ✅ Dokümantasyon yaklaşımı
- ✅ Proje-özel standartlar

#### 3. **📁 İlgili Klasör README'leri** (GÖREV BAZINDA)
- **core/README.md** → Temel sistem komponenleri
- **modules/README.md** → Modül geliştirme
- **themes/README.md** → Tema sistemi
- **routes/README.md** → HTTP endpoint'leri
- **views/README.md** → Template sistemi
- **app/README.md** → Bootstrap sistemi

### **🔄 Okuma Stratejisi:**

#### **Genel Proje Anlayışı için:**
```
1. CLAUDE.md (bu dosya) → Proje nedir, nasıl çalışır?
2. .claude/system-prompt.md → Nasıl çalışmalıyım?
3. İlgili README → Spesifik detaylar
```

#### **Spesifik Task için:**
```
1. .claude/system-prompt.md → Çalışma akışını hatırla
2. CLAUDE.md → Sistem ilişkilerini kontrol et
3. İlgili klasör README → Teknik detayları öğren
```

---

## ⚡ Kullanıcı Hızlı Başlangıç

1. **Sistem Kurulumu**: `npm install && npm start`
2. **Admin Girişi**: http://localhost:3000/dashboard/login (admin/admin123)
3. **Tema Yönetimi**: Dashboard > Ayarlar > Tema
4. **Modül Kontrolü**: Dashboard > Ayarlar > Modüller  
5. **İçerik Yönetimi**: Dashboard > İçerik Yönetimi