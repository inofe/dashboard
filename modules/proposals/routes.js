const express = require('express');
const path = require('path');
const ejs = require('ejs');
const dashboardRouter = express.Router();
const publicRouter = express.Router();
const { requireAuth } = require('../../core/auth');

// Proposals için custom render fonksiyonu
const renderProposalsView = (viewName, data = {}) => {
    return new Promise((resolve, reject) => {
        const viewPath = path.join(__dirname, 'views', `${viewName}.ejs`);
        ejs.renderFile(viewPath, data, (err, html) => {
            if (err) reject(err);
            else resolve(html);
        });
    });
};

// Teklifler listesi
dashboardRouter.get('/proposals', requireAuth, async (req, res) => {
    try {
        const { getAllProposals } = require('../../core/database');
        const proposals = await getAllProposals();
        
        const html = await renderProposalsView('proposals', { 
            user: req.session.user,
            proposals: proposals
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Teklifler yüklenirken hata oluştu');
    }
});

// Yeni teklif oluşturma sayfası
dashboardRouter.get('/create-proposal', requireAuth, async (req, res) => {
    try {
        const html = await renderProposalsView('create-proposal', { 
            user: req.session.user,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Sayfa render hatası');
    }
});

// Yeni teklif oluşturma işlemi
dashboardRouter.post('/create-proposal', requireAuth, async (req, res) => {
    try {
        const { title, description, price, duration, customer_name, customer_email, customer_phone } = req.body;
        
        // Validasyon
        if (!title || !customer_name || !customer_email) {
            const html = await renderProposalsView('create-proposal', { 
                user: req.session.user,
                message: 'Başlık, müşteri adı ve e-posta alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        const { createProposal } = require('../../core/database');
        const proposalId = await createProposal({
            title,
            description,
            price: price ? parseFloat(price) : null,
            duration,
            customer_name,
            customer_email,
            customer_phone
        });
        
        const html = await renderProposalsView('create-proposal', { 
            user: req.session.user,
            message: `Teklif başarıyla oluşturuldu! ID: ${proposalId}`,
            success: true
        });
        res.send(html);
        
    } catch (error) {
        const html = await renderProposalsView('create-proposal', { 
            user: req.session.user,
            message: 'Teklif oluşturulurken hata oluştu',
            success: false
        });
        res.send(html);
    }
});

// Teklif detay sayfası
dashboardRouter.get('/proposal/:id', requireAuth, async (req, res) => {
    try {
        const { getProposalById, getProposalResponses } = require('../../core/database');
        const proposalId = req.params.id;
        
        const proposal = await getProposalById(proposalId);
        if (!proposal) {
            return res.status(404).send('Teklif bulunamadı');
        }
        
        const responses = await getProposalResponses(proposalId);
        
        const html = await renderProposalsView('proposal-detail', { 
            user: req.session.user,
            proposal: proposal,
            responses: responses,
            baseUrl: `${req.protocol}://${req.get('host')}`
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Teklif detayı yüklenirken hata oluştu');
    }
});

// Teklif durumu toggle
dashboardRouter.post('/toggle-proposal/:id', requireAuth, async (req, res) => {
    try {
        const { updateProposalStatus, getProposalById } = require('../../core/database');
        const proposalId = req.params.id;
        
        const proposal = await getProposalById(proposalId);
        if (!proposal) {
            return res.status(404).send('Teklif bulunamadı');
        }
        
        const newStatus = proposal.is_active ? 0 : 1;
        await updateProposalStatus(proposalId, newStatus);
        
        // Eğer detay sayfasından geliyorsa detay sayfasına yönlendir
        const referer = req.get('referer');
        if (referer && referer.includes(`/dashboard/proposal/${proposalId}`)) {
            res.redirect(`/dashboard/proposal/${proposalId}`);
        } else {
            res.redirect('/dashboard/proposals');
        }
    } catch (error) {
        res.status(500).send('Teklif durumu güncellenirken hata oluştu');
    }
});

// Teklif silme
dashboardRouter.post('/delete-proposal/:id', requireAuth, async (req, res) => {
    try {
        const { deleteProposal } = require('../../core/database');
        const proposalId = req.params.id;
        
        const deleted = await deleteProposal(proposalId);
        if (deleted > 0) {
            res.redirect('/dashboard/proposals?deleted=1');
        } else {
            res.redirect('/dashboard/proposals?error=not_found');
        }
    } catch (error) {
        res.redirect('/dashboard/proposals?error=delete_failed');
    }
});

// Teklif düzenleme sayfası
dashboardRouter.get('/edit-proposal/:id', requireAuth, async (req, res) => {
    try {
        const { getProposalById } = require('../../core/database');
        const proposal = await getProposalById(req.params.id);
        
        if (!proposal) {
            return res.status(404).send('Teklif bulunamadı');
        }
        
        const html = await renderProposalsView('edit-proposal', { 
            user: req.session.user,
            proposal: proposal,
            message: null,
            success: false
        });
        res.send(html);
    } catch (error) {
        res.status(500).send('Teklif düzenleme sayfası yüklenirken hata oluştu');
    }
});

// Teklif güncelleme işlemi
dashboardRouter.post('/edit-proposal/:id', requireAuth, async (req, res) => {
    try {
        const { updateProposal, getProposalById } = require('../../core/database');
        const proposalId = req.params.id;
        const { title, description, price, duration, customer_name, customer_email, customer_phone } = req.body;
        
        // Validasyon
        if (!title || !customer_name || !customer_email) {
            const proposal = await getProposalById(proposalId);
            const html = await renderProposalsView('edit-proposal', { 
                user: req.session.user,
                proposal: proposal,
                message: 'Başlık, müşteri adı ve e-posta alanları zorunludur',
                success: false
            });
            return res.send(html);
        }

        await updateProposal(proposalId, {
            title,
            description,
            price: price ? parseFloat(price) : null,
            duration,
            customer_name,
            customer_email,
            customer_phone
        });
        
        res.redirect(`/dashboard/proposal/${proposalId}?updated=1`);
        
    } catch (error) {
        const proposal = await getProposalById(req.params.id);
        const html = await renderProposalsView('edit-proposal', { 
            user: req.session.user,
            proposal: proposal,
            message: 'Teklif güncellenirken hata oluştu',
            success: false
        });
        res.send(html);
    }
});


// Public route'ları ekle (routes/public.js'den taşınacak)
const { getProposalById, getProposalResponses, getAllSettings, addProposalResponse } = require('../../core/database');
const { renderWithTheme, render404Page, getFaviconHTML } = require('../../core/theme');

// Public frontend için render fonksiyonu - TEMA DESTEKLI
const renderPublicView = async (viewName, data = {}) => {
    try {
        // Favicon HTML'i tüm sayfalara ekle
        const faviconHTML = await getFaviconHTML();
        const enhancedData = {
            ...data,
            faviconHTML
        };

        return await renderWithTheme(viewName, enhancedData);
    } catch (error) {
        console.error(`Theme render error for ${viewName}:`, error);
        // Fallback to original method
        const viewPath = path.join(__dirname, '../views', 'public', `${viewName}.ejs`);
        const faviconHTML = await getFaviconHTML();
        return await ejs.renderFile(viewPath, { ...data, faviconHTML });
    }
};

// ===== PUBLIC ROUTES =====

// Public teklif görüntüleme
publicRouter.get('/proposal/:id', async (req, res) => {
    try {
        const proposal = await getProposalById(req.params.id);

        if (!proposal) {
            const html = await render404Page();
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
publicRouter.post('/proposal/:id/verify', async (req, res) => {
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
publicRouter.post('/proposal/:id/response', async (req, res) => {
    try {
        const { response_type, message } = req.body;
        const proposalId = req.params.id;

        const proposal = await getProposalById(proposalId);
        if (!proposal || !proposal.is_active) {
            const html = await render404Page();
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

module.exports = { dashboardRouter, publicRouter };