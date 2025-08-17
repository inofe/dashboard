# 🚀 Modüler Admin Dashboard Sistemi

## 📋 Proje Özeti

Bu proje, **iş teklifleri** ve **içerik yönetimi** için geliştirilmiş modern bir dashboard sistemidir. Modüler yapısı sayesinde kolayca genişletilebilir ve farklı temalarla özelleştirilebilir.

## 🎯 Ana Özellikler

### 💼 Teklif Yönetimi (Proposals)
- Müşteri teklifleri oluşturma ve düzenleme
- Müşteri yanıt takibi ve geri bildirim sistemi
- Tekliflerin public link ile paylaşımı
- Aktif/pasif teklif durumu yönetimi

### 📝 İçerik Yönetimi (CMS)
- **Blog sistemi**: Yazı oluşturma, düzenleme, yayınlama
- **Sayfa yönetimi**: Statik sayfalar (Hakkımızda, İletişim vb.)
- **Medya kütüphanesi**: Dosya yükleme ve yönetimi
- **SEO desteği**: Meta taglar ve arama motoru optimizasyonu

### 🎨 Tema Sistemi
- **2 hazır tema**: Default (Tailwind CSS) ve Modern (Bootstrap 5)
- **Dashboard üzerinden tema değiştirme**
- **Responsive tasarım** - mobil uyumlu
- **Yeni tema geliştirme** desteği

### 🔧 Sistem Yönetimi
- **Modüler yapı**: Yeni modüller eklenebilir
- **Güvenlik**: Rate limiting, CSP, bcrypt şifreleme
- **Ayarlar**: Kategorize edilmiş sistem ayarları
- **Dosya yönetimi**: Güvenli upload sistemi

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

## 📁 Proje Yapısı

```
dashboard/
├── core/                 # Temel sistem
│   ├── auth.js          # Kimlik doğrulama
│   ├── database.js      # Veritabanı işlemleri
│   ├── theme.js         # Tema sistemi
│   └── security.js      # Güvenlik katmanı
├── modules/             # Modüller
│   ├── proposals/       # Teklif modülü
│   └── cms/            # İçerik modülü
├── themes/             # Tema dosyaları
│   ├── default/        # Tailwind tema
│   └── modern/         # Bootstrap tema
├── routes/             # Yönlendirmeler
├── views/              # Ana şablonlar
└── uploads/            # Yüklenen dosyalar
```

## 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Sunucuyu başlat
npm start
# veya
node server.js
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

## 🔒 Güvenlik Özellikleri

- **Şifre şifreleme** (bcrypt)
- **Oturum yönetimi** (express-session)
- **Rate limiting** - DDoS koruması
- **Dosya doğrulama** - Güvenli upload
- **CSP başlıkları** - XSS koruması
- **Input sanitization** - SQL injection koruması

## 🎨 Tema Geliştirme

Yeni tema oluşturmak için:

1. `themes/yeni-tema/` klasörü oluştur
2. Gerekli template dosyalarını ekle (home.ejs, blog.ejs vb.)
3. `themes/README.md` dosyasındaki rehberi takip et
4. Dashboard > Ayarlar > Tema sekmesinden aktifleştir

## 📈 Genişletme

### Yeni Modül Ekleme:
1. `modules/yeni-modul/` klasörü oluştur
2. `module.json` config dosyası ekle
3. `routes.js` ve view dosyalarını oluştur
4. Dashboard'dan modülü aktifleştir

### Desteklenen Modül Özellikleri:
- Otomatik route kayıt
- Menu entegrasyonu  
- Settings sistemi
- Enable/disable durumu

## 🔧 Teknik Detaylar

- **Veritabanı**: SQLite (geliştirme), PostgreSQL/MySQL (production)
- **Session**: File store (geliştirme), Redis (production)
- **Uploads**: Local filesystem (geliştirme), S3/CDN (production)
- **Logging**: File-based system
- **Caching**: In-memory cache sistem

## 🌟 Gelecek Özellikler

Bu sistem mevcut haliyle production-ready olup, ihtiyaç halinde şu özellikler eklenebilir:

- **Email bildirim sistemi**
- **Çoklu kullanıcı desteği**
- **API endpoints** (REST/GraphQL)
- **Dashboard analytics**
- **Backup/restore sistemi**
- **Multi-language support**

---

**Not**: Bu proje modüler yapısı sayesinde kolayca genişletilebilir ve özelleştirilebilir. Her modül bağımsız çalışır ve sistem bütünlüğünü bozmadan eklenip çıkarılabilir.