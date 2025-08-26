# 🎨 Tema Sistemi Kullanım Kılavuzu

## 📖 Genel Bakış

Bu klasör dashboard'un tema sistemini içerir. Farklı temalar oluşturarak blog ve CMS sayfalarınızın görünümünü özelleştirebilirsiniz.

## 📁 Klasör Yapısı

```
themes/
├── README.md              # Bu dosya
├── default/               # Varsayılan tema (Tailwind CSS)
│   ├── home.ejs
│   ├── blog.ejs
│   ├── blog-post.ejs
│   ├── page.ejs
│   └── ...
└── modern/                # Modern tema (Bootstrap 5)
    ├── home.ejs
    ├── blog.ejs
    ├── blog-post.ejs
    ├── page.ejs
    └── partials/
        └── public-header.ejs
```

## 🆕 Yeni Tema Oluşturma

### 1. Tema Klasörü Oluştur

```bash
mkdir themes/mytheme
```

### 2. Template Dosyaları Oluştur

Her tema için şu dosyalar gerekli:

#### `home.ejs` - Ana Sayfa
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= siteName %></title>
    <!-- CSS Framework'ünüzü buraya ekleyin -->
    <link href="CSS_FRAMEWORK_LINK" rel="stylesheet">
</head>
<body>
    <!-- Header Include -->
    <%- include('partials/public-header', { 
        currentPage: 'home', 
        siteName: siteName, 
        pages: pages 
    }) %>

    <!-- Ana İçerik -->
    <main>
        <h1><%= siteName %></h1>
        <p><%= siteDescription %></p>
        
        <!-- Son Blog Yazıları -->
        <% if (recentPosts && recentPosts.length > 0) { %>
            <section>
                <h2>Son Blog Yazıları</h2>
                <% recentPosts.slice(0, 3).forEach(post => { %>
                    <article>
                        <h3><%= post.title %></h3>
                        <p><%= post.excerpt || post.content.substring(0, 150) + '...' %></p>
                        <a href="/blog/<%= post.slug %>">Devamını Oku</a>
                    </article>
                <% }); %>
            </section>
        <% } %>
        
        <!-- Sayfalar -->
        <% if (pages && pages.length > 0) { %>
            <section>
                <h2>Sayfalarımız</h2>
                <% pages.slice(0, 4).forEach(page => { %>
                    <a href="/page/<%= page.slug %>"><%= page.title %></a>
                <% }); %>
            </section>
        <% } %>
    </main>
</body>
</html>
```

#### `blog.ejs` - Blog Listesi
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog | <%= siteName %></title>
    <!-- CSS Framework -->
</head>
<body>
    <%- include('partials/public-header', { 
        currentPage: 'blog', 
        siteName: siteName, 
        pages: pages 
    }) %>

    <main>
        <h1>Blog</h1>
        
        <% if (posts && posts.length > 0) { %>
            <% posts.forEach(post => { %>
                <article>
                    <h2><%= post.title %></h2>
                    <p><%= post.excerpt || post.content.substring(0, 150) + '...' %></p>
                    <small><%= new Date(post.created_at).toLocaleDateString('tr-TR') %></small>
                    <a href="/blog/<%= post.slug %>">Devamını Oku</a>
                </article>
            <% }); %>
        <% } else { %>
            <p>Henüz blog yazısı yok.</p>
        <% } %>
    </main>
</body>
</html>
```

#### `blog-post.ejs` - Blog Yazısı Detay
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= post.title %> | <%= siteName %></title>
    <!-- CSS Framework -->
</head>
<body>
    <%- include('partials/public-header', { 
        currentPage: 'blog', 
        siteName: siteName, 
        pages: pages 
    }) %>

    <main>
        <article>
            <h1><%= post.title %></h1>
            <small><%= new Date(post.created_at).toLocaleDateString('tr-TR') %></small>
            
            <% if (post.image) { %>
                <img src="<%= post.image %>" alt="<%= post.title %>">
            <% } %>
            
            <div>
                <%- post.content %>
            </div>
        </article>
        
        <a href="/blog">← Blog'a Dön</a>
        <button onclick="window.print()">Yazdır</button>
    </main>
</body>
</html>
```

#### `page.ejs` - Sayfa Detay
```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= page.title %> | <%= siteName %></title>
    <!-- CSS Framework -->
</head>
<body>
    <%- include('partials/public-header', { 
        currentPage: 'page-' + page.slug, 
        siteName: siteName, 
        pages: pages 
    }) %>

    <main>
        <article>
            <h1><%= page.title %></h1>
            
            <% if (page.image) { %>
                <img src="<%= page.image %>" alt="<%= page.title %>">
            <% } %>
            
            <div>
                <%- page.content %>
            </div>
        </article>
        
        <a href="/">← Anasayfa</a>
    </main>
</body>
</html>
```

### 3. Header Partial Oluştur (Opsiyonel)

Tema-spesifik header için:

```bash
mkdir themes/mytheme/partials
```

#### `partials/public-header.ejs`
```html
<nav>
    <a href="/"><%= siteName %></a>
    
    <ul>
        <li><a href="/" class="<%= currentPage === 'home' ? 'active' : '' %>">Ana Sayfa</a></li>
        <li><a href="/blog" class="<%= currentPage === 'blog' ? 'active' : '' %>">Blog</a></li>
        
        <% if (typeof pages !== 'undefined' && pages.length > 0) { %>
            <% pages.forEach(page => { %>
                <li>
                    <a href="/page/<%= page.slug %>" 
                       class="<%= currentPage === 'page-' + page.slug ? 'active' : '' %>">
                        <%= page.title %>
                    </a>
                </li>
            <% }); %>
        <% } %>
    </ul>
</nav>
```

## 📊 Kullanılabilir Değişkenler

### Ana Sayfa (`home.ejs`)
- `siteName` - Site adı
- `siteDescription` - Site açıklaması
- `recentPosts` - Son blog yazıları (array)
- `pages` - Yayınlanan sayfalar (array)

### Blog (`blog.ejs`)
- `siteName` - Site adı
- `posts` - Tüm blog yazıları (array)
- `pages` - Yayınlanan sayfalar (array)

### Blog Yazısı (`blog-post.ejs`)
- `siteName` - Site adı
- `post` - Blog yazısı objesi
  - `post.title` - Başlık
  - `post.content` - İçerik (HTML)
  - `post.created_at` - Oluşturulma tarihi
  - `post.image` - Görsel URL'i
  - `post.slug` - URL slug'ı
- `pages` - Yayınlanan sayfalar (array)

### Sayfa (`page.ejs`)
- `siteName` - Site adı
- `page` - Sayfa objesi
  - `page.title` - Başlık
  - `page.content` - İçerik (HTML)
  - `page.slug` - URL slug'ı
  - `page.image` - Görsel URL'i
  - `page.updated_at` - Son güncelleme tarihi
- `pages` - Diğer sayfalar (array)

## 🎯 CSS Framework Örnekleri

### Tailwind CSS (Default tema)
```html
<link href="https://cdn.tailwindcss.com" rel="stylesheet">
<div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-800 mb-6"><%= siteName %></h1>
</div>
```

### Bootstrap 5 (Modern tema)
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<div class="container py-5">
    <h1 class="display-4 fw-bold mb-4"><%= siteName %></h1>
</div>
```

### Bulma
```html
<link href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css" rel="stylesheet">
<div class="container">
    <h1 class="title is-1"><%= siteName %></h1>
</div>
```

## 🔧 Tema Aktivasyonu

1. Tema dosyalarını oluşturduktan sonra
2. Dashboard'a giriş yap: `/dashboard/login`
3. Ayarlar'a git: `/dashboard/settings`
4. **Tema** sekmesini aç
5. Yeni temanızı seçin ve kaydedin

## ⚠️ Önemli Notlar

1. **Include Path**: `partials/public-header` şeklinde kullanın
2. **Değişken Kontrolleri**: `typeof` ile kontrol edin:
   ```html
   <% if (typeof pages !== 'undefined' && pages.length > 0) { %>
   ```
3. **Print Desteği**: Print CSS'i eklemeyi unutmayın:
   ```html
   <style media="print">
       nav, .btn { display: none !important; }
       body { margin: 0; padding: 20px; }
   </style>
   ```
4. **CSP Uyumluluğu**: Yeni CDN eklerken `core/security.js`'de CSP güncelleyin

## 🔒 Content Security Policy (CSP) Uyumluluğu

### ⚠️ Geliştirici Notu - Inline Event Handler Yasağı

Bu sistem **Content Security Policy (CSP)** ile güvenlik altındadır. Bu nedenle:

**❌ YAPMAYIN:**
```html
<button onclick="myFunction()">Click me</button>
<div onmouseover="doSomething()">Hover me</div>
```

**✅ YAPIN:**
```html
<button id="myButton">Click me</button>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', function() {
            myFunction();
        });
    }
});
</script>
```

### CSP Kuralları:
- `script-src-attr 'none'` - Inline event handlerlar yasaklanmıştır
- Tüm JavaScript eventleri `addEventListener` ile yazılmalıdır
- Script tagları içindeki kodlar güvenlidir
- External CDN'ler security.js'de tanımlanmalıdır

### Örnek Doğru Kullanım:
```html
<!-- ❌ Yanlış -->
<button onclick="printPage()">Yazdır</button>

<!-- ✅ Doğru -->
<button id="printBtn">Yazdır</button>
<script>
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('printBtn')?.addEventListener('click', () => {
        window.print();
    });
});
</script>
```

## 🎨 Örnek Temalar

- **default**: Tailwind CSS ile minimal tema
- **modern**: Bootstrap 5 ile gradient'lı modern tema

Yeni tema oluştururken bu örnekleri referans alabilirsiniz.

## 🔗 Yararlı Linkler

- [EJS Template Engine](https://ejs.co/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Bootstrap 5](https://getbootstrap.com/)
- [Font Awesome Icons](https://fontawesome.com/)

## 🌟 Gelişmiş Özellikler

### Favicon Desteği

Tüm temalarda otomatik favicon desteği mevcuttur:

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= siteName %></title>
    <link href="CSS_FRAMEWORK" rel="stylesheet">
    <%- faviconHTML %>  <!-- Otomatik favicon injection -->
</head>
```

### 404 Sayfa Desteği

Her tema için `404.ejs` dosyası oluşturabilirsiniz:

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>404 - Sayfa Bulunamadı</title>
    <%- faviconHTML %>
</head>
<body>
    <div class="error-container">
        <h1>404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa mevcut değil.</p>
        <a href="/">Ana Sayfa</a>
        <button id="back-button">Geri Dön</button>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('back-button')?.addEventListener('click', () => {
            history.back();
        });
    });
    </script>
</body>
</html>
```

### Tema Konfigürasyon Dosyası (Opsiyonel)

`theme.json` dosyası ile tema metadatası ekleyebilirsiniz:

```json
{
    "name": "mytheme",
    "displayName": "Benim Temam",
    "description": "Özel tasarım teması",
    "version": "1.0.0",
    "author": "Geliştirici Adı",
    "framework": "Bootstrap 5",
    "features": [
        "responsive",
        "dark-mode",
        "animation"
    ],
    "preview": "screenshot.png"
}
```

## 🔧 Tema Geliştirme Araçları

### Tema Analiz Fonksiyonu

```javascript
// Tema bilgilerini kontrol etmek için
const { getAvailableThemes, getActiveTheme } = require('../core/theme');

const themes = getAvailableThemes();
const active = await getActiveTheme();

console.log('Mevcut temalar:', themes);
console.log('Aktif tema:', active);
```

### Tema Test Endpoint'i

Geliştirme sırasında tema test etmek için:

```
GET /test-theme?theme=mytheme&page=home
```

### Live Reload Desteği

Geliştirme modunda tema değişikliklerini canlı görmek için:

```bash
# Tema dosyalarını izle
nodemon --watch themes/ --ext ejs,css,js server.js
```

## 📱 Responsive Design Rehberi

### Breakpoint Standartları

```css
/* Mobile First Approach */
/* Default: Mobile (0px+) */

/* Tablet (768px+) */
@media (min-width: 768px) {
    .container { max-width: 750px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
    .container { max-width: 1200px; }
}

/* Large Desktop (1200px+) */
@media (min-width: 1200px) {
    .container { max-width: 1400px; }
}
```

### Framework-Specific Responsive

**Tailwind CSS:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Mobile: 1 sütun, Tablet: 2 sütun, Desktop: 3 sütun -->
</div>
```

**Bootstrap 5:**
```html
<div class="row">
    <div class="col-12 col-md-6 col-lg-4">
        <!-- Mobile: 12 sütun, Tablet: 6 sütun, Desktop: 4 sütun -->
    </div>
</div>
```

## 🎯 SEO Optimizasyonu

### Meta Tags Template

```html
<head>
    <!-- Temel meta tags -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Sayfa-specific meta tags -->
    <% if (typeof page !== 'undefined' && page.meta_title) { %>
        <title><%= page.meta_title %></title>
        <meta name="description" content="<%= page.meta_description || '' %>">
    <% } else if (typeof post !== 'undefined' && post.meta_title) { %>
        <title><%= post.meta_title %></title>
        <meta name="description" content="<%= post.meta_description || '' %>">
    <% } else { %>
        <title><%= siteName %></title>
        <meta name="description" content="<%= siteDescription || '' %>">
    <% } %>
    
    <!-- Open Graph (Facebook) -->
    <meta property="og:title" content="<%= title || siteName %>">
    <meta property="og:description" content="<%= description || siteDescription %>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<%= req.protocol %>://<%= req.get('host') %><%= req.originalUrl %>">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<%= title || siteName %>">
    <meta name="twitter:description" content="<%= description || siteDescription %>">
    
    <!-- Favicon -->
    <%- faviconHTML %>
</head>
```

### Structured Data (JSON-LD)

```html
<!-- Blog yazısı için structured data -->
<% if (typeof post !== 'undefined') { %>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "<%= post.title %>",
    "datePublished": "<%= post.created_at %>",
    "dateModified": "<%= post.updated_at || post.created_at %>",
    "author": {
        "@type": "Organization",
        "name": "<%= siteName %>"
    },
    "publisher": {
        "@type": "Organization",
        "name": "<%= siteName %>"
    }
}
</script>
<% } %>
```

## 🔍 Tema Debugging

### Template Değişkenlerini Gösterme

```html
<!-- Development modunda değişkenleri görmek için -->
<% if (process.env.NODE_ENV === 'development') { %>
<div style="position: fixed; bottom: 0; right: 0; background: #000; color: #fff; padding: 10px; font-size: 12px; max-width: 300px; max-height: 200px; overflow: auto;">
    <h4>Debug Info:</h4>
    <pre><%= JSON.stringify({siteName, currentPage}, null, 2) %></pre>
</div>
<% } %>
```

### Console Logging

```html
<script>
<% if (process.env.NODE_ENV === 'development') { %>
    console.log('Theme Debug Info:', {
        siteName: '<%= siteName %>',
        currentPage: '<%= currentPage %>',
        posts: <%= JSON.stringify(posts || []) %>,
        pages: <%= JSON.stringify(pages || []) %>
    });
<% } %>
</script>
```

## 🚀 Performance Optimizasyonu

### CSS Minification

```html
<% if (process.env.NODE_ENV === 'production') { %>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<% } else { %>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.css" rel="stylesheet">
<% } %>
```

### Critical CSS

```html
<style>
/* Critical CSS - Above the fold content */
body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.header { background: #fff; padding: 1rem 0; }
</style>

<!-- Non-critical CSS loaded asynchronously -->
<link rel="preload" href="CSS_FRAMEWORK" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

### Lazy Loading Images

```html
<% if (post.image) { %>
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" 
         data-src="<%= post.image %>" 
         alt="<%= post.title %>"
         loading="lazy"
         class="lazy-image">
<% } %>

<script>
// Intersection Observer for lazy loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-image');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
</script>
```

## 📊 Tema Analytics

### Google Analytics Integration

```html
<!-- Google Analytics -->
<% if (typeof googleAnalyticsId !== 'undefined' && googleAnalyticsId) { %>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<%= googleAnalyticsId %>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '<%= googleAnalyticsId %>');
</script>
<% } %>
```

### Custom Event Tracking

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Track blog post reading time
    <% if (typeof post !== 'undefined') { %>
    const startTime = Date.now();
    window.addEventListener('beforeunload', function() {
        const readingTime = Math.round((Date.now() - startTime) / 1000);
        if (typeof gtag !== 'undefined') {
            gtag('event', 'blog_reading_time', {
                'event_category': 'engagement',
                'event_label': '<%= post.slug %>',
                'value': readingTime
            });
        }
    });
    <% } %>
});
</script>
```

## 🌙 Dark Mode Desteği

### CSS Variables ile Dark Mode

```html
<style>
:root {
    --bg-color: #ffffff;
    --text-color: #333333;
    --accent-color: #007bff;
}

[data-theme="dark"] {
    --bg-color: #1a1a1a;
    --text-color: #ffffff;
    --accent-color: #66b3ff;
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    transition: background-color 0.3s, color 0.3s;
}
</style>

<script>
// Dark mode toggle
function toggleDarkMode() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Initialize theme
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
});
</script>
```

## 🔧 Tema Geliştirici Araçları

### Tema Linting

```bash
# EJS template validation
npm install -g ejs-lint

# Validate all theme templates
find themes/ -name "*.ejs" -exec ejs-lint {} \;
```

### Tema Build Script

```json
{
  "scripts": {
    "build-themes": "node scripts/build-themes.js",
    "validate-themes": "node scripts/validate-themes.js",
    "optimize-themes": "node scripts/optimize-themes.js"
  }
}
```

### Tema Test Suite

```javascript
// tests/themes.test.js
const request = require('supertest');
const app = require('../app');

describe('Theme System', () => {
    test('Default theme renders correctly', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toContain('<!DOCTYPE html>');
    });
    
    test('Theme switching works', async () => {
        await request(app)
            .post('/dashboard/theme/change')
            .send({ theme: 'modern' })
            .expect(200);
    });
});
```

## 📚 Tema Yönetimi Best Practices

### 1. Version Control
```bash
# Tema versiyonlama
themes/
├── mytheme/
│   ├── v1.0/
│   ├── v1.1/
│   └── current -> v1.1/
```

### 2. Backup Strategy
```bash
# Tema backup scripti
#!/bin/bash
tar -czf "themes-backup-$(date +%Y%m%d).tar.gz" themes/
```

### 3. Migration Guide
```javascript
// Theme migration script
const migrateTheme = (oldVersion, newVersion) => {
    // Handle breaking changes
    // Update template syntax
    // Migrate configurations
};
```

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.2.0  
**Tema API Version:** v2  

**Not**: Tema sistemi otomatik fallback desteği ile güvenli çalışır. Herhangi bir template bulunamazsa default tema kullanılır.