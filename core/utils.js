/**
 * Utility fonksiyonları
 */

/**
 * Başlıktan SEO dostu slug oluştur
 * @param {string} title - Dönüştürülecek başlık
 * @returns {string} - SEO dostu slug
 */
const generateSlug = (title) => {
    if (!title || typeof title !== 'string') return '';
    
    return title
        .toLowerCase()
        .trim()
        // Türkçe karakterleri değiştir
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ğ/g, 'g')
        .replace(/Ü/g, 'u')
        .replace(/Ş/g, 's')
        .replace(/İ/g, 'i')
        .replace(/Ö/g, 'o')
        .replace(/Ç/g, 'c')
        // Özel karakterleri kaldır
        .replace(/[^a-z0-9\s-]/g, '')
        // Çoklu boşlukları tek tire ile değiştir
        .replace(/\s+/g, '-')
        // Çoklu tireleri tek tire yap
        .replace(/-+/g, '-')
        // Başta ve sonda tire varsa kaldır
        .replace(/^-+|-+$/g, '');
};

/**
 * Benzersiz slug oluştur (database kontrolü ile)
 * @param {string} title - Başlık
 * @param {string} table - Tablo adı ('cms_pages' veya 'cms_posts')  
 * @param {number|null} excludeId - Güncelleme durumunda hariç tutulacak ID
 * @returns {Promise<string>} - Benzersiz slug
 */
const generateUniqueSlug = async (title, table, excludeId = null) => {
    const baseSlug = generateSlug(title);
    if (!baseSlug) return 'untitled';
    
    const { checkSlugExists } = require('./database');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Slug'ın benzersiz olup olmadığını kontrol et
    while (await checkSlugExists(table, slug, excludeId)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

/**
 * Metin özetini oluştur
 * @param {string} content - İçerik metni
 * @param {number} length - Özet uzunluğu (karakter)
 * @returns {string} - Özet
 */
const generateExcerpt = (content, length = 160) => {
    if (!content || typeof content !== 'string') return '';
    
    // HTML taglarını kaldır
    const plainText = content.replace(/<[^>]*>/g, '');
    
    if (plainText.length <= length) return plainText;
    
    // Kelime sınırında kes
    const truncated = plainText.substr(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
        return truncated.substr(0, lastSpace) + '...';
    }
    
    return truncated + '...';
};

/**
 * Dosya adından güvenli dosya adı oluştur
 * @param {string} filename - Orijinal dosya adı
 * @returns {string} - Güvenli dosya adı
 */
const sanitizeFilename = (filename) => {
    if (!filename || typeof filename !== 'string') return 'file';
    
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const extension = filename.substring(filename.lastIndexOf('.')) || '';
    
    const safeName = nameWithoutExt
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    return safeName + extension;
};

/**
 * Date formatı oluştur
 * @param {Date|string} date - Tarih
 * @param {string} locale - Dil kodu (default: 'tr-TR')
 * @returns {string} - Formatlanmış tarih
 */
const formatDate = (date, locale = 'tr-TR') => {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * String'i truncate et
 * @param {string} str - String
 * @param {number} length - Max uzunluk
 * @returns {string} - Truncated string
 */
const truncate = (str, length = 50) => {
    if (!str || typeof str !== 'string') return '';
    
    if (str.length <= length) return str;
    
    return str.substring(0, length) + '...';
};

module.exports = {
    generateSlug,
    generateUniqueSlug,
    generateExcerpt,
    sanitizeFilename,
    formatDate,
    truncate
};