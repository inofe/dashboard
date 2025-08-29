const express = require('express');
const path = require('path');
const ejs = require('ejs');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
const { getProposalById, getProposalResponses, getAllSettings, addProposalResponse, getAllPosts, getAllPages, getSettingNew } = require('../core/database');
const { renderWithTheme, render404Page, getFaviconHTML } = require('../core/theme');

// sanitize-html konfigürasyonu

// İçerik güvenlik fonksiyonu
const sanitizeContentForDisplay = (content) => {
    if (!content) return '';

    const result = sanitizeHtml(content, {
        allowedTags: [
            'p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'blockquote',
            'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'span'
        ],
        allowedAttributes: {
            '*': ['style', 'class'],
            'a': ['href', 'target'],
            'img': ['src', 'alt', 'width', 'height'],
            'table': ['border', 'cellpadding', 'cellspacing'],
            'td': ['colspan', 'rowspan'],
            'th': ['colspan', 'rowspan']
        },
        allowedStyles: {
            '*': {
                'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
                'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
                'font-weight': [/^bold$/, /^normal$/, /^\d+$/],
                'font-style': [/^italic$/, /^normal$/],
                'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
                'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
            }
        },
        disallowedTagsMode: 'discard',
        allowedSchemes: ['http', 'https', 'mailto'],
        allowedSchemesByTag: {
            img: ['http', 'https', 'data']
        }
    });

    return result;
};

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

// CMS route'ları modüle taşındı - buraya artık gerek yok

// Proposals route'ları modüle taşındı - buraya artık gerek yok

module.exports = router;