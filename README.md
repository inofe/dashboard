# 🚀 Modüler Admin Dashboard Sistemi

Modern, güvenli ve genişletilebilir admin dashboard sistemi. İş teklifleri, içerik yönetimi ve tema sistemi ile eksiksiz bir web yönetim deneyimi sunar.

## ⭐ Ana Özellikler

### 💼 Teklif Yönetimi (Proposals)
- ✅ Müşteri teklifleri oluşturma ve düzenleme
- ✅ Public teklif linklerini paylaşma
- ✅ Müşteri yanıt takibi ve geri bildirim sistemi
- ✅ Teklif durumu yönetimi (aktif/pasif)
- ✅ Email doğrulama sistemi

### 📝 İçerik Yönetimi Sistemi (CMS)
- ✅ **Blog sistemi** - Yazı oluşturma, düzenleme, yayınlama
- ✅ **Sayfa yönetimi** - Statik sayfalar (Hakkımızda, İletişim vb.)
- ✅ **Medya kütüphanesi** - Dosya yükleme ve yönetimi
- ✅ **SEO optimizasyonu** - Meta taglar ve URL yapılandırması

### 🎨 Gelişmiş Tema Sistemi
- ✅ **2 hazır tema**: Default (Tailwind CSS) ve Modern (Bootstrap 5)
- ✅ **Dashboard tema kontrolü** - Tek tıkla tema değiştirme
- ✅ **Responsive tasarım** - Tüm cihazlarda mükemmel görünüm
- ✅ **Tema geliştirme desteği** - Yeni temalar kolayca eklenebilir

### 🧩 Modüler Sistem
- ✅ **Plugin mimarisi** - Yeni modüller kolayca eklenebilir
- ✅ **Bağımsız modüller** - Her modül ayrı ayrı çalışır
- ✅ **Dinamik menü sistemi** - Modüller otomatik menüye eklenir
- ✅ **Modül ayarları** - Her modülün kendi ayar paneli

### 🔒 Güvenlik ve Performans
- ✅ **Çoklu güvenlik katmanı** - Rate limiting, CSP, bcrypt
- ✅ **File upload güvenliği** - Dosya tipi ve boyut kontrolü
- ✅ **Session yönetimi** - Güvenli oturum sistemi
- ✅ **Logging sistemi** - Detaylı sistem kayıtları

## 🛠️ Hızlı Başlangıç

### 1. Projeyi İndirin
```bash
git clone [repository-url]
cd dashboard
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Sistemi Başlatın
```bash
npm start
# veya
node server.js
```

**🎉 Bu kadar!** Sistem otomatik olarak:
- ✅ Veritabanını oluşturur
- ✅ Admin kullanıcısını hazırlar  
- ✅ Gerekli klasörleri kurar
- ✅ Modülleri yükler

### 3. Environment Değişkenlerini Ayarlayın

`.env` dosyası oluşturun (`.env.example`'dan kopyalayabilirsiniz):

```env
# Port Configuration
PORT=3000
EXTERNAL_PORT=3000
HOST=0.0.0.0

# Security Configuration
SESSION_SECRET=your_secure_random_secret_here

# Dashboard Configuration
DEFAULT_ADMIN_PASSWORD=admin123
ENABLE_COMPRESSION=false
ENABLE_RATE_LIMITING=false
FILE_UPLOAD_LIMIT=2097152
DATA_DIR=data
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW=20000
RATE_LIMIT_MAX=1

# Node Environment
NODE_ENV=development
```

### 4. Kurulum

#### Otomatik Kurulum (Önerilen)
```bash
# Dashboard klasöründe bağımlılıkları yükle
cd dashboard/
npm install

# Veritabanı ve admin kullanıcısını oluştur
npm run setup

# Ana dizine dön
cd ..
```

#### Ana Sunucuya Entegrasyon
Dashboard zaten ana server'a entegre! Sadece tek satır:

```javascript
// server.js içinde
const setupDashboard = require('./dashboard/module');
await setupDashboard(app); // ✅ Tek satır entegrasyon!
```

**Bu kadar!** Dashboard artık:
- ✅ Admin panel (`/dashboard/*`)
- ✅ Public routes (`/proposal/*`)
- ✅ File uploads (`/dashboard/uploads/*`)
- ✅ Auto database setup
- ✅ ENV configuration

#### Docker ile Kurulum

**Hızlı Başlangıç:**
```bash
# .env dosyasını oluşturun (.env.example'dan kopyalayın)
cp .env.example .env

# Port ayarlarını düzenleyin (isteğe bağlı)
nano .env

# Docker ile başlatın
docker-compose up --build
```

**Farklı Port'ta Çalıştırma:**
```bash
# 8080 portunda çalıştır
PORT=8080 EXTERNAL_PORT=8080 docker-compose up -d

# Environment file ile
echo "PORT=8080" >> .env
echo "EXTERNAL_PORT=8080" >> .env
docker-compose up -d
```

**Prodüksiyon için:**
```bash
# Detached modda çalıştır
docker-compose up -d --build

# Logları görüntüle
docker-compose logs -f admin-panel
```

**Docker Özellikleri:**
- ✅ **Otomatik setup** - Veritabanı ve admin user oluşturulur
- ✅ **Data kalıcılığı** - Volume mapping ile veriler korunur
- ✅ **Health check** - Container sağlık durumu kontrolü
- ✅ **Auto restart** - Sistem yeniden başlatıldığında otomatik çalışır
- ✅ **Dinamik port** - ENV ile port değiştirilebilir

### 5. İlk Kurulumu Yapın
```bash
cd dashboard
node setup.js
```

Bu komut:
- Veritabanını `dashboard/data/` klasörüne oluşturur
- Gerekli tabloları kurar  
- Varsayılan admin kullanıcısını oluşturur (ENV'den `DEFAULT_ADMIN_PASSWORD`)

## 🎯 Erişim Bilgileri

### Dashboard Girişi
```
🔗 Admin Panel: http://localhost:3000/dashboard/login
🌐 Public Site: http://localhost:3000
```

**Varsayılan Admin Bilgileri:**
- 👤 Kullanıcı: `admin`
- 🔑 Şifre: `admin123`

⚠️ **İlk girişte şifrenizi değiştirmeyi unutmayın!**

## 🎨 Tema Değiştirme

1. Dashboard > **Ayarlar** > **Tema** sekmesi
2. **Default** (Tailwind) veya **Modern** (Bootstrap) seçin
3. **Temayı Kaydet** butonuna tıklayın
4. Public sayfanızda değişimi görün!

## 📝 İçerik Yönetimi

### Blog Yazısı Oluşturma
1. **CMS** > **Blog Yazıları** > **Yeni Yazı**
2. Başlık, içerik ve SEO bilgilerini girin
3. **Yayınla** veya **Taslak** olarak kaydedin

### Sayfa Oluşturma  
1. **CMS** > **Sayfalar** > **Yeni Sayfa**
2. Sayfa içeriğini oluşturun
3. Otomatik URL oluşturulur: `/page/sayfa-basligi`

### Dosya Yükleme
1. **CMS** > **Medya Kütüphanesi**
2. Fotoğraf, döküman veya diğer dosyaları yükleyin
3. İçeriklerde kullanmak için URL'leri kopyalayın

## 💼 Teklif Sistemi

### Teklif Oluşturma
1. **Teklifler** > **Yeni Teklif**
2. Müşteri bilgileri ve teklif detaylarını girin
3. **Aktif** yaparak paylaşıma hazır hale getirin

### Teklif Paylaşma
- Oluşturulan her teklif için özel link: 
- `http://localhost:3000/proposal/123`
- Müşteri email doğrulaması ile güvenli erişim

### Müşteri Yanıtları
- Müşteri **Kabul/Red** seçeneği ile yanıtlayabilir
- Ek yorumlar ekleyebilir
- Dashboard'dan tüm yanıtları görüntüleyin

## API Endpoints

### Dashboard Rotaları
```
GET  /dashboard              - Ana dashboard sayfası
GET  /dashboard/login        - Giriş sayfası
POST /dashboard/login        - Giriş işlemi
GET  /dashboard/proposals    - Teklif listesi
GET  /dashboard/create-proposal - Yeni teklif formu
POST /dashboard/create-proposal - Yeni teklif oluştur
GET  /dashboard/proposal/:id - Teklif detayı
GET  /dashboard/edit-proposal/:id - Teklif düzenleme
POST /dashboard/edit-proposal/:id - Teklif güncelleme
POST /dashboard/toggle-proposal/:id - Teklif durumu değiştir
POST /dashboard/delete-proposal/:id - Teklif sil
GET  /dashboard/settings     - Ayarlar sayfası
POST /dashboard/settings     - Ayarları kaydet
GET  /dashboard/change-password - Şifre değiştirme
POST /dashboard/change-password - Şifre güncelleme
POST /dashboard/logout       - Çıkış
```

### Public Rotalar (Ana sunucuda tanımlanmalı)
```
GET  /proposal/:id           - Teklif görüntüleme
POST /proposal/:id/response  - Teklif yanıtlama
```

## 🏗️ Teknoloji Stack

### Backend
- **Node.js** + Express.js framework
- **SQLite** veritabanı (production için PostgreSQL/MySQL)
- **EJS** template engine
- **bcryptjs** - Şifre şifreleme
- **express-session** - Oturum yönetimi
- **multer** - Dosya upload
- **helmet** - Güvenlik başlıkları

### Frontend
- **Bootstrap 5** (Modern tema)
- **Tailwind CSS** (Default tema)  
- **Vanilla JavaScript** + AJAX
- **Font Awesome** iconlar
- **Responsive design**

## 📁 Proje Yapısı

```
dashboard/
├── 📄 README.md              # Proje dokümantasyonu
├── 📄 CLAUDE.md              # Geliştirme notları
├── 📄 THEME_SYSTEM.md        # Tema sistemi dokümantasyonu
├── 📄 server.js              # Ana sunucu dosyası
├── 📄 package.json           # NPM bağımlılıkları
├── 🔧 core/                  # Temel sistem
│   ├── auth.js               # Kimlik doğrulama
│   ├── database.js           # Veritabanı işlemleri
│   ├── theme.js              # Tema sistemi motoru
│   ├── security.js           # Güvenlik katmanı
│   ├── module-loader.js      # Modül yöneticisi
│   └── settings.js           # Ayarlar API
├── 🧩 modules/               # Plugin modülller
│   ├── proposals/            # Teklif yönetimi
│   └── cms/                  # İçerik yönetimi
├── 🎨 themes/                # Tema dosyaları
│   ├── README.md             # Tema geliştirme rehberi
│   ├── default/              # Tailwind tema
│   └── modern/               # Bootstrap tema
├── 📁 routes/                # Yönlendirmeler
├── 📁 views/                 # Core template'ler
├── 📁 uploads/               # Yüklenen dosyalar
├── 📁 data/                  # Veritabanı dosyaları
└── 📁 logs/                  # Sistem kayıtları
```

## Güvenlik Özellikleri

- **Şifre Hashleme:** bcrypt kullanılarak güvenli şifre saklama
- **Session Güvenliği:** Express session ile oturum yönetimi
- **Dosya Yükleme Güvenliği:** Sadece resim dosyaları, boyut sınırı
- **Input Validation:** Form verilerinin doğrulanması
- **SQL Injection Koruması:** Prepared statements kullanımı

## Environment Değişkenleri

Dashboard modülü aşağıdaki ENV değişkenlerini destekler:

### Port Yapılandırması
- `PORT` - Container içi port (varsayılan: 3000)
- `EXTERNAL_PORT` - Dış port mapping (varsayılan: 3000)
- `HOST` - Bind adresi (varsayılan: 0.0.0.0)

### Güvenlik
- `SESSION_SECRET` - Session güvenlik anahtarı
- `DEFAULT_ADMIN_PASSWORD` - Varsayılan admin şifresi
- `BCRYPT_SALT_ROUNDS` - Şifre hash seviyesi (varsayılan: 10)

### Dosya Yükleme
- `FILE_UPLOAD_LIMIT` - Maximum dosya boyutu (byte)
- `DATA_DIR` - Database klasörü yolu

### Rate Limiting
- `ENABLE_RATE_LIMITING` - Rate limiting aktif/pasif
- `RATE_LIMIT_WINDOW` - Rate limit penceresi (ms)
- `RATE_LIMIT_MAX` - Maximum istek sayısı

### Performans
- `ENABLE_COMPRESSION` - Gzip sıkıştırma aktif/pasif
- `NODE_ENV` - Çalışma ortamı (development/production)

## 🐳 Docker Deployment

### Mevcut docker-compose.yml
```yaml
version: '3.8'

services:
  admin-panel:
    build: .
    container_name: admin-panel
    ports:
      - "${EXTERNAL_PORT:-3000}:${PORT:-3000}"
    environment:
      - NODE_ENV=production
      - HOST=0.0.0.0
      - PORT=${PORT:-3000}
    volumes:
      - ./uploads:/app/uploads     # Dosya yükleme kalıcılığı
      - ./logs:/app/logs           # Log kalıcılığı
      - ./data:/app/data           # Database kalıcılığı
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/dashboard/login', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Docker Komutları
```bash
# Projeyi başlat
docker-compose up -d

# Logları takip et
docker-compose logs -f admin-panel

# Container'a bağlan
docker-compose exec admin-panel sh

# Servisi durdur
docker-compose down

# Farklı portta çalıştır
PORT=8080 EXTERNAL_PORT=8080 docker-compose up -d

# Verileri sil (dikkat!)
docker-compose down -v
```

## Özelleştirme

### Tema ve Görünüm
- `views/` klasöründeki EJS dosyalarını düzenleyin
- CSS stilleri dashboard view'larında inline olarak tanımlı

### Veritabanı
- Yeni tablolar için `database.js` dosyasını genişletin
- Setup scriptini `setup.js` dosyasında güncelleyin

### Yetkilendirme
- Çoklu kullanıcı desteği için `auth.js` dosyasını genişletin
- Rol tabanlı yetkilendirme eklenebilir

## Sorun Giderme

### Veritabanı Sorunları
```bash
# Veritabanını sıfırla
rm dashboard/data/dashboard.db
cd dashboard && node setup.js
```

### Dosya İzinleri
```bash
# Data ve uploads klasörleri için yazma izni ver
chmod 755 dashboard/data/
chmod 755 dashboard/uploads/
```

### Session Sorunları
- `SESSION_SECRET` environment variable'ını ayarlayın
- Güvenli cookie ayarlarını HTTPS için yapılandırın

## Lisans

Bu modül MIT lisansı altında sunulmuştur.

## Geliştirici Notları

Bu modül bağımsız olarak çalışacak şekilde tasarlanmıştır ve herhangi bir Express.js projesine kolayca entegre edilebilir. Tüm bağımlılıklar modül içinde izole edilmiştir.