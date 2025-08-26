/**
 * Merkezi HTML Sanitization Konfigürasyonu
 * 
 * Bu dosya, proje genelinde kullanılan HTML sanitization ayarlarını
 * merkezi olarak yönetir. TinyMCE rich text editörü ve public
 * content display için optimize edilmiştir.
 * 
 * @version 1.1.0
 * @requires sanitize-html
 */

const sanitizeHtml = require('sanitize-html');

/**
 * TinyMCE Rich Text Content için güvenli HTML sanitization
 * CMS modülü ve public routes tarafından kullanılır
 */
const RICH_TEXT_SANITIZE_OPTIONS = {
    allowedTags: [
        // Block elements
        'p', 'div', 'br', 'blockquote', 'pre',
        // Inline elements  
        'strong', 'b', 'em', 'i', 'u', 's', 'span',
        // Lists
        'ul', 'ol', 'li',
        // Headings
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // Links and media
        'a', 'img',
        // Code
        'code',
        // Tables
        'table', 'thead', 'tbody', 'tr', 'td', 'th'
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
            // Colors (hex and rgb)
            'color': [
                /^#(0x)?[0-9a-f]+$/i, 
                /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
            ],
            'background-color': [
                /^#(0x)?[0-9a-f]+$/i, 
                /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
            ],
            // Text alignment
            'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
            // Font properties
            'font-weight': [/^bold$/, /^normal$/, /^\d+$/],
            'font-style': [/^italic$/, /^normal$/],
            'text-decoration': [/^underline$/, /^line-through$/, /^none$/]
        }
    },
    disallowedTagsMode: 'discard',
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
        img: ['http', 'https', 'data']
    }
};

/**
 * TinyMCE Editor için valid_elements konfigürasyonu
 * Style attribute'larını destekler
 */
const TINYMCE_VALID_ELEMENTS = [
    'p[style]', 'div[style]', 'br', 'blockquote[style]', 'pre[style]',
    'strong[style]', 'b[style]', 'em[style]', 'i[style]', 'u[style]', 's[style]', 'span[style]',
    'ul[style]', 'ol[style]', 'li[style]',
    'h1[style]', 'h2[style]', 'h3[style]', 'h4[style]', 'h5[style]', 'h6[style]',
    'a[href|target|style]', 'img[src|alt|width|height|style]',
    'code[style]',
    'table[style]', 'thead[style]', 'tbody[style]', 'tr[style]', 'td[style]', 'th[style]'
].join(',');

/**
 * Güvenli HTML sanitization fonksiyonu
 * @param {string} content - Temizlenecek HTML içeriği
 * @returns {string} - Temizlenmiş HTML içeriği
 */
const sanitizeRichTextContent = (content) => {
    if (!content) return '';
    return sanitizeHtml(content, RICH_TEXT_SANITIZE_OPTIONS);
};

/**
 * Basit metin sanitization (başlık, açıklama vb. için)
 * @param {string} text - Temizlenecek metin
 * @returns {string} - Temizlenmiş metin
 */
const sanitizeSimpleText = (text) => {
    if (!text) return '';
    return sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {}
    });
};

module.exports = {
    RICH_TEXT_SANITIZE_OPTIONS,
    TINYMCE_VALID_ELEMENTS,
    sanitizeRichTextContent,
    sanitizeSimpleText
};