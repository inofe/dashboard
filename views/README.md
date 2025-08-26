# Views Directory

## 📋 Genel Bakış

`views/` klasörü, uygulamanın EJS template dosyalarını organize eder. Bu dizin, dashboard admin paneli için kullanılan view'ları içerir ve tema sisteminden bağımsız olarak çalışır. Public-facing sayfalar için tema sistemi (`themes/` dizini) kullanılır.

## 📁 Dizin Yapısı

```
views/
├── core/                    # Dashboard core template'leri
│   ├── 404.ejs             # Dashboard 404 sayfası (kullanılmıyor)
│   ├── change-password.ejs  # Şifre değiştirme sayfası
│   ├── index.ejs           # Dashboard ana sayfası
│   ├── login.ejs           # Login formu
│   └── settings.ejs        # Sistem ayarları sayfası
├── partials/               # Yeniden kullanılabilir template parçaları
│   └── dashboard-header.ejs # Dashboard navigation header
└── public/                 # Public template'leri (DEPRECATED)
    ├── proposal-inactive.ejs
    ├── proposal-verify.ejs
    └── proposal.ejs
```

## 🏗️ Template Kategorileri

### 1. Core Templates (`core/`)

Dashboard yönetim paneli için kullanılan ana template'ler.

#### `index.ejs` - Dashboard Ana Sayfası

**Amaç:** Admin kullanıcısının giriş yaptığında karşılaştığı ana sayfa

**Özellikler:**
- 📊 **System Overview** - Sistem durumu göstergeleri
- 🎯 **Quick Actions** - Hızlı erişim butonları
- 📈 **Statistics** - Temel istatistikler
- 🔗 **Module Navigation** - Aktif modüllere hızlı erişim

**Data Context:**
```javascript
{
    user: req.session.user,        // Giriş yapmış kullanıcı
    enabledModules: [],            // Aktif modül listesi  
    error: null,                   // Hata mesajı (varsa)
    faviconHTML: '<link...>'       // Favicon HTML
}
```

**Template Özellikleri:**
```html
<!DOCTYPE html>
<html lang="tr" class="h-full bg-gray-50">
<head>
    <title>Dashboard | BizebiApp</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <%- faviconHTML %>
</head>
<body>
    <%- include('../partials/dashboard-header', { 
        currentPage: 'dashboard', 
        user: user 
    }) %>
    <!-- Dashboard content -->
</body>
</html>
```

#### `login.ejs` - Login Sayfası

**Amaç:** Kullanıcı kimlik doğrulama formu

**Özellikler:**
- 🔐 **Secure Login Form** - Username/password girişi
- 🛡️ **CSRF Protection** - Session-based güvenlik
- ⚠️ **Error Display** - Login hatalarını gösterim
- 📱 **Responsive Design** - Mobil uyumlu

**Data Context:**
```javascript
{
    error: null,                   // Login hata mesajı
    faviconHTML: '<link...>'       // Favicon HTML
}
```

**Security Features:**
```html
<form method="POST" action="/dashboard/login">
    <input type="text" name="username" required>
    <input type="password" name="password" required>
    <button type="submit">Giriş Yap</button>
</form>
```

#### `settings.ejs` - Sistem Ayarları

**Amaç:** Sistem yapılandırması ve modül yönetimi

**Özellikler:**
- ⚙️ **Tabbed Interface** - Genel, Modüller, Tema sekmeleri
- 📤 **Multi-file Upload** - Logo ve favicon yükleme
- 🎨 **Theme Management** - Tema seçimi ve önizlemesi
- 📦 **Module Control** - Modül aktifleştirme/deaktifleştirme
- 💾 **Live Preview** - Değişiklikleri canlı gösterme

**Data Context:**
```javascript
{
    user: req.session.user,
    settings: {},                  // General settings object
    allSettings: {},               // All categorized settings
    enabledModules: [],            // Active module list
    moduleMenuItems: [],           // Module menu structure  
    moduleStatus: {},              // Module status info
    message: null,                 // Success/error message
    success: false,                // Message type flag
    faviconHTML: '<link...>'       // Favicon HTML
}
```

**Advanced Features:**
- 🔄 **Real-time Theme Switching** - AJAX tema değişimi
- 📊 **Module Status Indicators** - Aktif/Pasif durumu gösterimi
- 🖼️ **Image Preview** - Yüklenen logo/favicon önizlemesi
- 📝 **Form Validation** - Client-side ve server-side doğrulama

#### `change-password.ejs` - Şifre Değiştirme

**Amaç:** Admin kullanıcısının şifresini değiştirmesi

**Özellikler:**
- 🔐 **Secure Password Form** - Yeni şifre girişi
- ✅ **Validation Feedback** - Şifre güvenlik kontrolü
- 📱 **Responsive Layout** - Mobil uyumlu tasarım

**Data Context:**
```javascript
{
    user: req.session.user,
    enabledModules: [],
    message: null,                 // Success/error message
    success: false,                // Operation result
    faviconHTML: '<link...>'
}
```

### 2. Partials (`partials/`)

Yeniden kullanılabilir template parçaları.

#### `dashboard-header.ejs` - Dashboard Navigation

**Amaç:** Dashboard sayfalarında ortak navigation header

**Özellikler:**
- 🧭 **Main Navigation** - Temel dashboard linkleri
- 👤 **User Info** - Giriş yapmış kullanıcı bilgileri
- 📦 **Dynamic Module Menu** - Aktif modüllere göre menu
- 🎨 **Active State** - Mevcut sayfa vurgulaması

**Template Usage:**
```html
<%- include('../partials/dashboard-header', { 
    currentPage: 'settings', 
    user: user 
}) %>
```

**Menu Structure:**
```html
<nav class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <!-- Logo/Brand -->
            <div class="flex items-center">
                <h1 class="text-xl font-semibold">Dashboard</h1>
            </div>
            
            <!-- Navigation Menu -->
            <div class="ml-10 flex items-baseline space-x-4">
                <a href="/dashboard" class="nav-link">Ana Sayfa</a>
                <a href="/dashboard/settings" class="nav-link">Ayarlar</a>
                <!-- Dynamic module links -->
            </div>
            
            <!-- User Menu -->
            <div class="flex items-center">
                <span>Hoş geldin, <strong><%= user.username %></strong></span>
                <form method="POST" action="/dashboard/logout">
                    <button type="submit" class="logout-btn">Çıkış</button>
                </form>
            </div>
        </div>
    </div>
</nav>
```

### 3. Module Template Integration (v1.1 Update)

**TinyMCE Rich Text Editor Integration**

Modül view'larında (CMS pages/posts) TinyMCE entegrasyonu için güvenlik konfigürasyonu.

**Önemli Güncelleme:** TinyMCE `valid_elements` konfigürasyonu style attribute desteği ile güncellenmiştir.

#### CMS Module Templates

**`modules/cms/views/page-create.ejs` & `post-create.ejs`:**

```javascript
// TinyMCE Konfigürasyon - Merkezi sistem kullanımı
tinymce.init({
    selector: '.tinymce-editor',
    height: 400,
    menubar: false,
    plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap'...],
    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify...',
    
    // ✅ Merkezi konfigürasyondan valid_elements kullanır
    valid_elements: /* core/sanitization-config.js TINYMCE_VALID_ELEMENTS */,
    
    // Güvenlik filtreleri
    invalid_elements: 'script,object,embed,applet,iframe,form,input,textarea,button,select,option',
    convert_urls: false,
    relative_urls: false,
    document_base_url: window.location.origin
});
```

📋 **Merkezi konfigürasyon:** [`core/sanitization-config.js`](../../core/sanitization-config.js)

**Önceki Durum (❌):**
```javascript
// Style attribute YOK - formatlamalar kayboluyor
valid_elements: 'p,div,br,strong,em,u,s,a[href|target]...'
```

**Yeni Durum (✅):**
```javascript  
// Style attribute VAR - formatlamalar korunuyor
valid_elements: 'p[style],div[style],strong[style],em[style]...'
```

**Sonuç:** 
- ✅ Admin panelinde TinyMCE renk/hizalama ayarları korunur
- ✅ Public sayfada formatlamalar görüntülenir
- ✅ Güvenlik korumasını sürdürür (XSS prevention)

### 4. Public Templates (`public/`) - DEPRECATED

⚠️ **Dikkat**: `public/` dizindeki template'ler artık kullanılmamaktadır. Public sayfalar için tema sistemi (`themes/` dizini) kullanılır.

**Neden Deprecated?**
- 🎨 **Tema Sistemi**: Daha esnek tema desteği için
- 🔄 **Dynamic Theming**: Runtime'da tema değişimi
- 🎯 **Better Organization**: Tema ve admin template'lerin ayrılması

**Migration Path:**
```
views/public/page.ejs → themes/default/page.ejs
views/public/blog.ejs → themes/default/blog.ejs
```

## 🔧 Template Development

### EJS Template Syntax

#### Data Binding
```html
<!-- Basit değişken -->
<h1><%= siteName %></h1>

<!-- HTML içeriği (unescaped) -->
<div><%- htmlContent %></div>

<!-- Condition -->
<% if (user) { %>
    <p>Hoş geldin, <%= user.username %></p>
<% } else { %>
    <p>Giriş yapın</p>
<% } %>

<!-- Loop -->
<% posts.forEach(post => { %>
    <article>
        <h2><%= post.title %></h2>
    </article>
<% }); %>
```

#### Include Partials
```html
<!-- Header include -->
<%- include('partials/dashboard-header', { 
    currentPage: 'settings',
    user: user 
}) %>

<!-- Footer include -->
<%- include('partials/footer', {
    year: new Date().getFullYear()
}) %>
```

### Data Context Patterns

#### Standard Dashboard Context
```javascript
const standardContext = {
    user: req.session.user,           // Always required for auth
    enabledModules: await getEnabledModules(),
    faviconHTML: await getFaviconHTML(),
    message: null,                    // Success/error messages
    success: false                    // Message type indicator
};
```

#### Form Handling Context
```javascript
const formContext = {
    ...standardContext,
    formData: req.body,              // Form submission data
    errors: validationErrors,         // Validation error array
    csrfToken: req.csrfToken()       // CSRF protection
};
```

### Security Considerations

#### XSS Prevention
```html
<!-- ✅ Safe - Escaped output -->
<h1><%= userInput %></h1>

<!-- ⚠️ Dangerous - Use only for trusted HTML -->
<div><%- trustedHtmlContent %></div>

<!-- ✅ Safe - Conditional rendering -->
<% if (typeof variable !== 'undefined' && variable) { %>
    <p><%= variable %></p>
<% } %>
```

#### CSRF Protection
```html
<form method="POST" action="/dashboard/action">
    <input type="hidden" name="_csrf" value="<%= csrfToken %>">
    <!-- Form fields -->
</form>
```

#### Input Validation
```html
<!-- Client-side validation -->
<input type="email" 
       name="email" 
       required 
       pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
       title="Geçerli bir email adresi girin">

<!-- Server-side validation display -->
<% if (errors && errors.email) { %>
    <div class="error"><%= errors.email %></div>
<% } %>
```

## 🎨 Styling Guidelines

### CSS Framework Integration

**Tailwind CSS (Current):**
```html
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>

<!-- Usage -->
<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="bg-white shadow rounded-lg p-6">
        <!-- Content -->
    </div>
</div>
```

**Component Classes:**
```html
<!-- Button styles -->
<button class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
    Primary Button
</button>

<!-- Form styles -->
<input class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">

<!-- Alert styles -->
<div class="bg-green-50 border-green-200 border rounded-md p-4 mb-6">
    Success message
</div>
```

### Responsive Design

**Mobile-First Approach:**
```html
<!-- Mobile: Full width, Desktop: Fixed width -->
<div class="w-full lg:max-w-4xl mx-auto">
    <!-- Content -->
</div>

<!-- Mobile: Stack, Desktop: Grid -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div>Column 1</div>
    <div>Column 2</div>
</div>
```

### Accessibility

**ARIA Labels:**
```html
<button aria-label="Menüyü aç" class="menu-button">
    <i class="fas fa-bars" aria-hidden="true"></i>
</button>

<input type="text" 
       aria-describedby="email-help"
       aria-required="true">
<div id="email-help">Email adresinizi girin</div>
```

**Semantic HTML:**
```html
<main role="main">
    <section aria-labelledby="settings-title">
        <h2 id="settings-title">Sistem Ayarları</h2>
        <!-- Content -->
    </section>
</main>
```

## 🚀 Performance Optimization

### Template Caching

```javascript
// EJS cache configuration
app.set('view cache', process.env.NODE_ENV === 'production');

// Custom cache implementation
const templateCache = new Map();

const renderCached = async (template, data, options = {}) => {
    const cacheKey = `${template}-${JSON.stringify(data)}`;
    
    if (templateCache.has(cacheKey) && process.env.NODE_ENV === 'production') {
        return templateCache.get(cacheKey);
    }
    
    const rendered = await ejs.renderFile(template, data, options);
    templateCache.set(cacheKey, rendered);
    
    return rendered;
};
```

### Lazy Loading Assets

```html
<!-- Critical CSS inline -->
<style>
    .critical-css { /* Above fold styles */ }
</style>

<!-- Non-critical CSS lazy loaded -->
<link rel="preload" 
      href="https://cdn.tailwindcss.com" 
      as="style" 
      onload="this.onload=null;this.rel='stylesheet'">

<!-- JavaScript lazy loading -->
<script>
window.addEventListener('load', function() {
    // Load non-critical JavaScript
});
</script>
```

### Image Optimization

```html
<!-- Responsive images -->
<img src="<%= image.url %>" 
     srcset="<%= image.url %>?w=400 400w,
             <%= image.url %>?w=800 800w,
             <%= image.url %>?w=1200 1200w"
     sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
     alt="<%= image.alt %>"
     loading="lazy">

<!-- WebP support -->
<picture>
    <source srcset="<%= image.webp %>" type="image/webp">
    <img src="<%= image.jpg %>" alt="<%= image.alt %>">
</picture>
```

## 🧪 Testing Templates

### Template Unit Testing

```javascript
// tests/views.test.js
const ejs = require('ejs');
const path = require('path');

describe('Views', () => {
    describe('Login Template', () => {
        it('renders without error', async () => {
            const templatePath = path.join(__dirname, '../views/core/login.ejs');
            const data = { 
                error: null, 
                faviconHTML: '' 
            };
            
            const html = await ejs.renderFile(templatePath, data);
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('login');
        });
        
        it('displays error message', async () => {
            const templatePath = path.join(__dirname, '../views/core/login.ejs');
            const data = { 
                error: 'Invalid credentials', 
                faviconHTML: '' 
            };
            
            const html = await ejs.renderFile(templatePath, data);
            expect(html).toContain('Invalid credentials');
        });
    });
});
```

### Integration Testing

```javascript
// tests/views-integration.test.js
const request = require('supertest');
const app = require('../app');

describe('View Integration', () => {
    it('dashboard requires authentication', async () => {
        const response = await request(app)
            .get('/dashboard')
            .expect(302); // Redirect to login
    });
    
    it('login page renders correctly', async () => {
        const response = await request(app)
            .get('/dashboard/login')
            .expect(200);
            
        expect(response.text).toContain('form');
        expect(response.text).toContain('username');
    });
});
```

## 🔍 Debugging Templates

### Template Error Handling

```javascript
const renderSafe = async (template, data = {}) => {
    try {
        return await ejs.renderFile(template, data);
    } catch (error) {
        console.error('Template render error:', {
            template: template,
            error: error.message,
            data: JSON.stringify(data, null, 2)
        });
        
        // Fallback template
        return `
        <!DOCTYPE html>
        <html>
        <head><title>Template Error</title></head>
        <body>
            <h1>Template Error</h1>
            <p>An error occurred rendering the template.</p>
        </body>
        </html>`;
    }
};
```

### Development Debug Info

```html
<% if (process.env.NODE_ENV === 'development') { %>
<div id="debug-info" style="position: fixed; bottom: 0; left: 0; background: rgba(0,0,0,0.8); color: white; padding: 10px; font-size: 12px; max-width: 400px;">
    <h4>Template Debug:</h4>
    <div>Template: <%= __filename %></div>
    <div>User: <%= JSON.stringify(user || 'Not logged in') %></div>
    <div>Data Keys: <%= Object.keys(locals).join(', ') %></div>
    <button onclick="document.getElementById('debug-info').style.display='none'">Hide</button>
</div>
<% } %>
```

## 📚 Best Practices

### 1. Template Organization
```
views/
├── core/           # Admin dashboard templates
├── partials/       # Reusable components  
├── emails/         # Email templates (future)
└── errors/         # Error page templates (future)
```

### 2. Naming Conventions
- **Kebab-case** for file names: `change-password.ejs`
- **camelCase** for data variables: `enabledModules`
- **PascalCase** for component partials: `UserProfile.ejs`

### 3. Data Validation
```html
<!-- Always check data existence -->
<% if (typeof posts !== 'undefined' && posts.length > 0) { %>
    <!-- Loop through posts -->
<% } else { %>
    <!-- Empty state -->
<% } %>

<!-- Safe property access -->
<%= user && user.username ? user.username : 'Misafir' %>
```

### 4. Error Boundaries
```html
<% try { %>
    <!-- Risky template code -->
    <% complexOperation() %>
<% } catch (error) { %>
    <div class="error-fallback">
        Bir hata oluştu. Lütfen sayfayı yenileyin.
    </div>
<% } %>
```

## 🔗 İlişkili Dosyalar ve Sistemler

- `themes/` - Public sayfalar için tema sistemi
- `routes/dashboard.js` - Dashboard route handlers
- `core/theme.js` - Template rendering utilities
- `partials/` - Shared template components
- `server.js` - EJS engine configuration

---

**Son Güncelleme:** 2025-01-25  
**Versiyon:** 1.0.0  
**EJS Version:** ^3.1.0  
**Template Engine:** EJS