const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();
const { getProposalById, getProposalResponses, getAllSettings, addProposalResponse, getAllPosts, getAllPages, getSettingNew } = require('../core/database');
const { renderWithTheme } = require('../core/theme');

// Public frontend için render fonksiyonu - TEMA DESTEKLI
const renderPublicView = async (viewName, data = {}) => {
    try {
        return await renderWithTheme(viewName, data);
    } catch (error) {
        console.error(`Theme render error for ${viewName}:`, error);
        // Fallback to original method
        const viewPath = path.join(__dirname, '../views', 'public', `${viewName}.ejs`);
        return await ejs.renderFile(viewPath, data);
    }
};

// Ana sayfa - Son blog yazıları ve sayfalar
router.get('/', async (req, res) => {
    try {
        // Yayınlanmış içerikleri al
        const allPosts = await getAllPosts();
        const allPages = await getAllPages();
        
        const publishedPosts = allPosts.filter(post => post.status === 'published').slice(0, 6);
        const publishedPages = allPages.filter(page => page.status === 'published');
        
        // Site ayarları
        const siteName = await getSettingNew('general', 'company_name', 'Website');
        const siteDescription = await getSettingNew('general', 'site_description', 'Hoş geldiniz');
        
        const html = await renderPublicView('home', {
            siteName,
            siteDescription,
            recentPosts: publishedPosts,
            pages: publishedPages
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Ana sayfa yüklenirken hata oluştu');
    }
});

// Blog ana sayfası
router.get('/blog', async (req, res) => {
    try {
        const allPosts = await getAllPosts();
        const publishedPosts = allPosts.filter(post => post.status === 'published');
        
        const siteName = await getSettingNew('general', 'company_name', 'Website');
        const allPages = await getAllPages();
        const publishedPages = allPages.filter(page => page.status === 'published');
        
        const html = await renderPublicView('blog', {
            siteName,
            posts: publishedPosts,
            pages: publishedPages
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Blog sayfası yüklenirken hata oluştu');
    }
});

// Blog yazısı detay
router.get('/blog/:slug', async (req, res) => {
    try {
        const allPosts = await getAllPosts();
        const post = allPosts.find(p => p.slug === req.params.slug && p.status === 'published');
        
        if (!post) {
            return res.status(404).send('Blog yazısı bulunamadı');
        }
        
        const siteName = await getSettingNew('general', 'company_name', 'Website');
        const allPages = await getAllPages();
        const publishedPages = allPages.filter(page => page.status === 'published');
        
        const html = await renderPublicView('blog-post', {
            siteName,
            post,
            pages: publishedPages
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Blog yazısı yüklenirken hata oluştu');
    }
});

// Sayfa detay
router.get('/page/:slug', async (req, res) => {
    try {
        const allPages = await getAllPages();
        const page = allPages.find(p => p.slug === req.params.slug && p.status === 'published');
        
        if (!page) {
            return res.status(404).send('Sayfa bulunamadı');
        }
        
        const siteName = await getSettingNew('general', 'company_name', 'Website');
        const publishedPages = allPages.filter(p => p.status === 'published');
        
        const html = await renderPublicView('page', {
            siteName,
            page,
            pages: publishedPages
        });
        res.send(html);
    } catch (error) {
        console.error('Page route error:', error);
        res.status(500).send('Sayfa yüklenirken hata oluştu: ' + error.message);
    }
});

// Public teklif görüntüleme
router.get('/proposal/:id', async (req, res) => {
    try {
        const proposal = await getProposalById(req.params.id);
        
        if (!proposal) {
            const html = await renderPublicView('404');
            return res.status(404).send(html);
        }
        
        if (!proposal.is_active) {
            const html = await renderPublicView('proposal-inactive');
            return res.send(html);
        }

        // Check if email is verified in session
        const verifiedEmails = req.session.verifiedEmails || {};
        const isEmailVerified = verifiedEmails[req.params.id] === proposal.customer_email;
        
        if (!isEmailVerified) {
            // Show email verification form
            const html = await renderPublicView('proposal-verify', { 
                proposal: proposal,
                message: null,
                error: false
            });
            return res.send(html);
        }
        
        // Email verified, show proposal
        // Check if customer has already responded
        const responses = await getProposalResponses(req.params.id);
        const hasResponded = responses.length > 0;
        
        // Get company settings
        const settings = await getAllSettings();
        
        const html = await renderPublicView('proposal', { 
            proposal: proposal,
            hasResponded: hasResponded,
            settings: settings,
            message: null,
            success: false
        });
        res.send(html);
        
    } catch (error) {
        console.error('Teklif yükleme hatası:', error);
        res.status(500).send('Teklif yüklenirken hata oluştu: ' + error.message);
    }
});

// Email doğrulama
router.post('/proposal/:id/verify', async (req, res) => {
    try {
        const { email } = req.body;
        const proposal = await getProposalById(req.params.id);
        
        if (!proposal) {
            return res.status(404).send('Teklif bulunamadı');
        }
        
        if (!proposal.is_active) {
            const html = await renderPublicView('proposal-inactive');
            return res.send(html);
        }
        
        // Email kontrolü (büyük/küçük harf duyarsız)
        if (email.toLowerCase().trim() !== proposal.customer_email.toLowerCase().trim()) {
            const html = await renderPublicView('proposal-verify', { 
                proposal: proposal,
                message: 'E-posta adresi eşleşmiyor. Lütfen teklif için kayıtlı e-posta adresini girin.',
                error: true
            });
            return res.send(html);
        }
        
        // Email doğru, session'a kaydet
        if (!req.session.verifiedEmails) {
            req.session.verifiedEmails = {};
        }
        req.session.verifiedEmails[req.params.id] = proposal.customer_email;
        
        // Proposal sayfasına yönlendir
        res.redirect(`/proposal/${req.params.id}`);
        
    } catch (error) {
        console.error('Email doğrulama hatası:', error);
        res.status(500).send('Doğrulama yapılırken hata oluştu');
    }
});

// Public teklif yanıtlama
router.post('/proposal/:id/response', async (req, res) => {
    try {
        const { response_type, message } = req.body;
        const proposalId = req.params.id;
        
        const proposal = await getProposalById(proposalId);
        if (!proposal || !proposal.is_active) {
            const html = await renderPublicView('404');
            return res.status(404).send(html);
        }
        
        // Get company settings
        const settings = await getAllSettings();
        
        // Check if already responded
        const existingResponses = await getProposalResponses(proposalId);
        if (existingResponses.length > 0) {
            const html = await renderPublicView('proposal', { 
                proposal: proposal,
                hasResponded: true,
                settings: settings,
                message: 'Bu teklif için zaten geri bildirim gönderilmiş',
                success: false
            });
            return res.send(html);
        }
        
        if (!response_type) {
            const html = await renderPublicView('proposal', { 
                proposal: proposal,
                hasResponded: false,
                settings: settings,
                message: 'Lütfen bir seçenek belirtin',
                success: false
            });
            return res.send(html);
        }
        
        await addProposalResponse(proposalId, response_type, message || '');
        
        const html = await renderPublicView('proposal', { 
            proposal: proposal,
            hasResponded: true,
            settings: settings,
            message: 'Geri bildiriminiz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
            success: true
        });
        res.send(html);
        
    } catch (error) {
        res.status(500).send('Geri bildirim gönderilirken hata oluştu');
    }
});

module.exports = router;