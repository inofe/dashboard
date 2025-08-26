# App Directory

## 📋 Genel Bakış

`app/` klasörü, uygulamanın bootstrap (başlangıç) süreçlerini yöneten dosyaları içerir. Bu dizin, sistemin merkezi başlatma mantığını barındırır.

## 📁 Dosya Yapısı

```
app/
└── bootstrap.js         # Ana uygulama başlatıcı
```

## 🔧 Ana Dosyalar

### bootstrap.js

**Amaç:** Modüler dashboard sisteminin merkezi başlatıcısı

**Temel İşlevler:**
- 🗄️ **Database Kurulumu** - Otomatik veritabanı başlatma
- 📦 **Modül Yükleme** - Dinamik modül keşfi ve yükleme
- 🌐 **Route Kayıt** - Dashboard ve public route'ları kaydetme
- 🚫 **404 Handling** - Global 404 hata yönetimi
- ⚡ **Middleware Chain** - Güvenlik, upload, static file servisi

**Çalışma Sırası:**
1. Veritabanı kurulumu (`core/setup.js`)
2. Static file servisleri (`/dashboard/uploads`)
3. Core dashboard routes yükleme
4. Modül tarama ve dinamik yükleme
5. Public routes ekleme
6. Global 404 handler ekleme

## 🔄 Modül Yükleme Süreci

```javascript
// Modül keşfi
await moduleLoader.loadEnabledModules(dashboardRoutes);

// Yükleme raporu
loadResults.forEach(result => {
    if (result.loaded) {
        console.log(`✅ ${result.config.displayName}`);
    } else {
        console.log(`❌ ${result.name} yüklenemedi`);
    }
});
```

## 🎯 Kullanım

Bootstrap sistemi otomatik çalışır, manuel müdahale gerekmez:

```javascript
// server.js içinde
const setupModule = require('./app/bootstrap');
await setupModule(app);
```

## ⚙️ Konfigürasyon

Environment değişkenleri ile yapılandırılabilir:
- `NODE_ENV` - Ortam ayarı (development/production)
- `PORT` - Sunucu portu
- `HOST` - Bind adresi

## 🔧 Geliştirici Notları

### Yeni Özellik Ekleme

1. **Route Ekleme:** Routes dizinine yeni route dosyası ekleyin
2. **Middleware Ekleme:** Bootstrap.js içinde middleware chain'e ekleyin
3. **Modül Entegrasyonu:** Module-loader sistemi otomatik keşfeder

### Hata Ayıklama

```javascript
// Debug modunda çalıştırma
DEBUG=* npm start

// Modül yükleme logları
console.log('📦 Modüller yükleniyor...');
```

### Performans İyileştirme

- Modül yükleme sırası önemlidir
- Static file cache yapılandırması
- Database bağlantı havuzu ayarları

## 🚨 Dikkat Edilmesi Gerekenler

1. **Sıralama Kritik:** Middleware ve route kayıt sırası önemli
2. **Error Handling:** Bootstrap hatalarında sistem durur
3. **Memory Management:** Modül yükleme sırasında bellek kullanımı
4. **Security:** Upload ve static file güvenlik kontrolleri

## 🔗 İlişkili Dosyalar

- `server.js` - Ana sunucu entry point
- `core/module-loader.js` - Modül yükleme sistemi
- `core/setup.js` - Database kurulum
- `routes/` - Route tanımları
- `modules/` - Dinamik modüller

## 📝 TODO

- [ ] Health check endpoint ekleme
- [ ] Graceful shutdown handling
- [ ] Module hot-reload özelliği
- [ ] Startup metrics toplama

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.0.0