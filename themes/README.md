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

---

**Not**: Tema sistemi otomatik fallback desteği ile güvenli çalışır. Herhangi bir template bulunamazsa default tema kullanılır.