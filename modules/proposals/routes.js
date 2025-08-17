const express = require('express');
const path = require('path');
const ejs = require('ejs');
const router = express.Router();
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
router.get('/proposals', requireAuth, async (req, res) => {
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
router.get('/create-proposal', requireAuth, async (req, res) => {
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
router.post('/create-proposal', requireAuth, async (req, res) => {
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
router.get('/proposal/:id', requireAuth, async (req, res) => {
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
router.post('/toggle-proposal/:id', requireAuth, async (req, res) => {
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
router.post('/delete-proposal/:id', requireAuth, async (req, res) => {
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
router.get('/edit-proposal/:id', requireAuth, async (req, res) => {
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
router.post('/edit-proposal/:id', requireAuth, async (req, res) => {
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


module.exports = router;