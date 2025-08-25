const express = require('express');
const path = require('path');
const ejs = require('ejs');
const multer = require('multer');
const router = express.Router();
const { requireAuth } = require('../../core/auth');

// Multer setup for CMS media uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/cms/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cms-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        // Allow images and documents
        if (file.mimetype.startsWith('image/') || 
            file.mimetype.includes('pdf') ||
            file.mimetype.includes('document')) {
            cb(null, true);
        } else {
            cb(new Error('Desteklenen dosya türleri: resim, PDF, döküman'), false);
        }
    }
});

// CMS için custom render fonksiyonu
const renderCMSView = (viewName, data = {}) => {
    return new Promise((resolve, reject) => {
        const viewPath = path.join(__dirname, 'views', `${viewName}.ejs`);
        ejs.renderFile(viewPath, data, (err, html) => {
            if (err) reject(err);
            else resolve(html);
        });
    });
};

// CMS Ana Sayfa
router.get('/cms', requireAuth, async (req, res) => {
    try {
        // İstatistikler al
        const { getAllPages, getAllPosts, getAllMediaFiles } = require('../../core/database');
        const pages = await getAllPages();
        const posts = await getAllPosts();
        const mediaFiles = await getAllMediaFiles();
        
        const stats = {
            pages: pages.length,
            posts: posts.length,
            media: mediaFiles.length
        };
        
        const html = await renderCMSView('dashboard', { 
            user: req.session.user,
            stats: stats
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('CMS ana sayfa yüklenirken hata oluştu');
    }
});

// Sayfalar Yönetimi
router.get('/cms/pages', requireAuth, async (req, res) => {
    try {
        // Database'den sayfaları al
        const { getAllPages } = require('../../core/database');
        const pages = await getAllPages();
        
        const html = await renderCMSView('pages', { 
            user: req.session.user,
            pages: pages,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Sayfalar yüklenirken hata oluştu');
    }
});

// Yeni Sayfa Oluşturma
router.get('/cms/pages/create', requireAuth, async (req, res) => {
    try {
        const html = await renderCMSView('page-create', { 
            user: req.session.user,
            page: null,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Sayfa oluşturma formu yüklenirken hata oluştu');
    }
});

router.post('/cms/pages/create', requireAuth, async (req, res) => {
    try {
        const { title, content, meta_title, meta_description, status } = req.body;
        let { slug } = req.body;
        
        // Validasyon
        if (!title || !content) {
            const html = await renderCMSView('page-create', { 
                user: req.session.user,
                page: req.body,
                message: 'Başlık ve içerik alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        // Slug otomatik üretimi
        const { generateUniqueSlug } = require('../../core/utils');
        if (!slug || slug.trim() === '') {
            slug = await generateUniqueSlug(title, 'cms_pages');
        } else {
            // Manuel slug varsa benzersizliğini kontrol et
            slug = await generateUniqueSlug(slug, 'cms_pages');
        }

        // Database'e kaydet
        const { createPage } = require('../../core/database');
        const pageId = await createPage({ title, slug, content, meta_title, meta_description, status });
        
        console.log('Yeni sayfa oluşturuldu:', { title, slug, id: pageId });
        
        const html = await renderCMSView('page-create', { 
            user: req.session.user,
            page: null,
            message: `Sayfa başarıyla oluşturuldu! URL: /${slug}`,
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const html = await renderCMSView('page-create', { 
            user: req.session.user,
            page: req.body,
            message: 'Sayfa oluşturulurken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});

// Blog Yazıları Yönetimi
router.get('/cms/posts', requireAuth, async (req, res) => {
    try {
        // Database'den blog yazılarını al
        const { getAllPosts } = require('../../core/database');
        const posts = await getAllPosts();
        
        const html = await renderCMSView('posts', { 
            user: req.session.user,
            posts: posts,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Blog yazıları yüklenirken hata oluştu');
    }
});

// Yeni Blog Yazısı Oluşturma
router.get('/cms/posts/create', requireAuth, async (req, res) => {
    try {
        const html = await renderCMSView('post-create', { 
            user: req.session.user,
            post: null,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Blog yazısı oluşturma formu yüklenirken hata oluştu');
    }
});

router.post('/cms/posts/create', requireAuth, async (req, res) => {
    try {
        const { title, content, meta_title, meta_description, status, tags } = req.body;
        let { slug, excerpt } = req.body;
        
        // Validasyon
        if (!title || !content) {
            const html = await renderCMSView('post-create', { 
                user: req.session.user,
                post: req.body,
                message: 'Başlık ve içerik alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        // Slug otomatik üretimi
        const { generateUniqueSlug, generateExcerpt } = require('../../core/utils');
        if (!slug || slug.trim() === '') {
            slug = await generateUniqueSlug(title, 'cms_posts');
        } else {
            // Manuel slug varsa benzersizliğini kontrol et
            slug = await generateUniqueSlug(slug, 'cms_posts');
        }

        // Excerpt otomatik üretimi (eğer boşsa)
        if (!excerpt || excerpt.trim() === '') {
            excerpt = generateExcerpt(content, 160);
        }

        // Database'e kaydet
        const { createPost } = require('../../core/database');
        const postId = await createPost({ title, slug, content, excerpt, meta_title, meta_description, tags, status });
        
        console.log('Yeni blog yazısı oluşturuldu:', { title, slug, id: postId });
        
        const html = await renderCMSView('post-create', { 
            user: req.session.user,
            post: null,
            message: `Blog yazısı başarıyla oluşturuldu! URL: /blog/${slug}`,
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const html = await renderCMSView('post-create', { 
            user: req.session.user,
            post: req.body,
            message: 'Blog yazısı oluşturulurken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});

// Medya Library
router.get('/cms/media', requireAuth, async (req, res) => {
    try {
        // Database'den medya dosyalarını al
        const { getAllMediaFiles } = require('../../core/database');
        const mediaFiles = await getAllMediaFiles();
        
        const html = await renderCMSView('media', { 
            user: req.session.user,
            mediaFiles: mediaFiles,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Medya library yüklenirken hata oluştu');
    }
});

// Medya Dosyası Yükleme
router.post('/cms/media', requireAuth, upload.single('media_file'), async (req, res) => {
    try {
        if (!req.file) {
            // Medya listesini al ve hata mesajı ile render et
            const { getAllMediaFiles } = require('../../core/database');
            const mediaFiles = await getAllMediaFiles();
            const html = await renderCMSView('media', { 
                user: req.session.user,
                mediaFiles: mediaFiles,
                message: 'Lütfen bir dosya seçin',
                success: false
            });
            return res.send(html);
        }

        // Database'e medya bilgisini kaydet
        const { saveMediaFile } = require('../../core/database');
        const mediaInfo = {
            filename: req.file.filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            size: req.file.size,
            path: `/dashboard/uploads/cms/${req.file.filename}`
        };
        
        const mediaId = await saveMediaFile(mediaInfo);
        console.log('Yeni medya dosyası yüklendi:', { ...mediaInfo, id: mediaId });
        
        const html = await renderCMSView('media', { 
            user: req.session.user,
            mediaFiles: [mediaInfo], // Yeni dosyayı listede göster
            message: 'Dosya başarıyla yüklendi!',
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const html = await renderCMSView('media', { 
            user: req.session.user,
            mediaFiles: [],
            message: 'Dosya yüklenirken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});

// Sayfa Düzenleme
router.get('/cms/pages/edit/:id', requireAuth, async (req, res) => {
    try {
        const { getPageById } = require('../../core/database');
        const page = await getPageById(req.params.id);
        
        if (!page) {
            return res.status(404).send('Sayfa bulunamadı');
        }
        
        const html = await renderCMSView('page-create', { 
            user: req.session.user,
            page: page,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Sayfa düzenleme formu yüklenirken hata oluştu');
    }
});

router.post('/cms/pages/edit/:id', requireAuth, async (req, res) => {
    try {
        const { title, content, meta_title, meta_description, status } = req.body;
        let { slug } = req.body;
        const pageId = req.params.id;
        
        // Validasyon
        if (!title || !content) {
            const { getPageById } = require('../../core/database');
            const page = await getPageById(pageId);
            const html = await renderCMSView('page-create', { 
                user: req.session.user,
                page: { ...page, ...req.body },
                message: 'Başlık ve içerik alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        // Slug güncelleme/üretimi
        const { generateUniqueSlug } = require('../../core/utils');
        if (!slug || slug.trim() === '') {
            slug = await generateUniqueSlug(title, 'cms_pages', pageId);
        } else {
            // Manuel slug varsa benzersizliğini kontrol et (kendi ID'si hariç)
            slug = await generateUniqueSlug(slug, 'cms_pages', pageId);
        }

        // Database'de güncelle
        const { updatePage } = require('../../core/database');
        await updatePage(pageId, { title, slug, content, meta_title, meta_description, status });
        
        console.log('Sayfa güncellendi:', { title, slug, id: pageId });
        
        // Başarılı güncelleme sonrası sayfa listesine yönlendir
        res.redirect('/dashboard/cms/pages');
        
    } catch (error) {
        const { getPageById } = require('../../core/database');
        const page = await getPageById(req.params.id);
        const html = await renderCMSView('page-create', { 
            user: req.session.user,
            page: { ...page, ...req.body },
            message: 'Sayfa güncellenirken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});


// Sayfa Status Değiştirme
router.post('/cms/pages/toggle-status/:id', requireAuth, async (req, res) => {
    try {
        const { getPageById, updatePage } = require('../../core/database');
        const page = await getPageById(req.params.id);
        
        if (!page) {
            return res.status(404).json({ success: false, message: 'Sayfa bulunamadı' });
        }

        // Status'u değiştir: draft ↔ published
        const newStatus = page.status === 'published' ? 'draft' : 'published';
        const updateData = { 
            ...page,
            status: newStatus
        };
        
        await updatePage(req.params.id, updateData);
        
        const statusText = newStatus === 'published' ? 'Yayınlandı' : 'Taslak';
        
        // JSON response for AJAX
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ 
                success: true, 
                message: `Sayfa ${statusText} olarak işaretlendi`,
                status: newStatus,
                statusText: statusText
            });
        }
        
        // Regular form submission redirect
        res.redirect('/dashboard/cms/pages');
        
    } catch (error) {
        console.error('Status değiştirme hatası:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false, 
                message: 'Status değiştirilirken hata oluştu: ' + error.message 
            });
        }
        
        res.status(500).send('Status değiştirilirken hata oluştu');
    }
});

// Sayfa Silme
router.post('/cms/pages/delete/:id', requireAuth, async (req, res) => {
    try {
        const { deletePage } = require('../../core/database');
        await deletePage(req.params.id);
        res.redirect('/dashboard/cms/pages');
    } catch (error) {
        res.status(500).send('Sayfa silinirken hata oluştu');
    }
});

// Blog Yazısı Düzenleme
router.get('/cms/posts/edit/:id', requireAuth, async (req, res) => {
    try {
        const { getPostById } = require('../../core/database');
        const post = await getPostById(req.params.id);
        
        if (!post) {
            return res.status(404).send('Blog yazısı bulunamadı');
        }
        
        const html = await renderCMSView('post-create', { 
            user: req.session.user,
            post: post,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Blog yazısı düzenleme formu yüklenirken hata oluştu');
    }
});

router.post('/cms/posts/edit/:id', requireAuth, async (req, res) => {
    try {
        const { title, content, meta_title, meta_description, tags, status } = req.body;
        let { slug, excerpt } = req.body;
        const postId = req.params.id;
        
        // Validasyon
        if (!title || !content) {
            const { getPostById } = require('../../core/database');
            const post = await getPostById(postId);
            const html = await renderCMSView('post-create', { 
                user: req.session.user,
                post: { ...post, ...req.body },
                message: 'Başlık ve içerik alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        // Slug güncelleme/üretimi
        const { generateUniqueSlug, generateExcerpt } = require('../../core/utils');
        if (!slug || slug.trim() === '') {
            slug = await generateUniqueSlug(title, 'cms_posts', postId);
        } else {
            // Manuel slug varsa benzersizliğini kontrol et (kendi ID'si hariç)
            slug = await generateUniqueSlug(slug, 'cms_posts', postId);
        }

        // Excerpt güncelleme/üretimi
        if (!excerpt || excerpt.trim() === '') {
            excerpt = generateExcerpt(content, 160);
        }

        // Database'de güncelle
        const { updatePost } = require('../../core/database');
        await updatePost(postId, { title, slug, content, excerpt, meta_title, meta_description, tags, status });
        
        console.log('Blog yazısı güncellendi:', { title, slug, id: postId });
        
        // Başarılı güncelleme sonrası blog listesine yönlendir
        res.redirect('/dashboard/cms/posts');
        
    } catch (error) {
        const { getPostById } = require('../../core/database');
        const post = await getPostById(req.params.id);
        const html = await renderCMSView('post-create', { 
            user: req.session.user,
            post: { ...post, ...req.body },
            message: 'Blog yazısı güncellenirken hata oluştu: ' + error.message,
            success: false
        });
        res.send(html);
    }
});


// Blog Yazısı Status Değiştirme
router.post('/cms/posts/toggle-status/:id', requireAuth, async (req, res) => {
    try {
        const { getPostById, updatePost } = require('../../core/database');
        const post = await getPostById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ success: false, message: 'Blog yazısı bulunamadı' });
        }

        // Status'u değiştir: draft ↔ published
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        const updateData = { 
            ...post,
            status: newStatus,
            published_at: newStatus === 'published' ? new Date().toISOString() : null
        };
        
        await updatePost(req.params.id, updateData);
        
        const statusText = newStatus === 'published' ? 'Yayınlandı' : 'Taslak';
        
        // JSON response for AJAX
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json({ 
                success: true, 
                message: `Blog yazısı ${statusText} olarak işaretlendi`,
                status: newStatus,
                statusText: statusText
            });
        }
        
        // Regular form submission redirect
        res.redirect('/dashboard/cms/posts');
        
    } catch (error) {
        console.error('Status değiştirme hatası:', error);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ 
                success: false, 
                message: 'Status değiştirilirken hata oluştu: ' + error.message 
            });
        }
        
        res.status(500).send('Status değiştirilirken hata oluştu');
    }
});

// Blog Yazısı Silme
router.post('/cms/posts/delete/:id', requireAuth, async (req, res) => {
    try {
        const { deletePost } = require('../../core/database');
        await deletePost(req.params.id);
        res.redirect('/dashboard/cms/posts');
    } catch (error) {
        res.status(500).send('Blog yazısı silinirken hata oluştu');
    }
});

// Medya Dosyası Silme
router.post('/cms/media/delete/:id', requireAuth, async (req, res) => {
    try {
        const { deleteMediaFile, getMediaFileById } = require('../../core/database');
        const mediaFile = await getMediaFileById(req.params.id);
        
        if (mediaFile) {
            // Dosyayı fiziksel olarak sil
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '../..', mediaFile.path.replace('/dashboard', ''));
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Database'den sil
            await deleteMediaFile(req.params.id);
        }
        
        res.redirect('/dashboard/cms/media');
    } catch (error) {
        res.status(500).send('Medya dosyası silinirken hata oluştu');
    }
});

module.exports = router;