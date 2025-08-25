const bcrypt = require('bcryptjs');
const { initDB, createUser, findUser } = require('./database');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        console.log('Database başlatılıyor...');
        await initDB();
        console.log('Database tabloları oluşturuldu.');

        // uploads klasörlerini oluştur
        const uploadsPath = path.join(__dirname, '..', 'uploads');
        const cmsUploadsPath = path.join(uploadsPath, 'cms');
        
        if (!fs.existsSync(uploadsPath)) {
            fs.mkdirSync(uploadsPath, { recursive: true });
            console.log('uploads klasörü oluşturuldu:', uploadsPath);
        } else {
            console.log('uploads klasörü zaten mevcut.');
        }
        
        if (!fs.existsSync(cmsUploadsPath)) {
            fs.mkdirSync(cmsUploadsPath, { recursive: true });
            console.log('uploads/cms klasörü oluşturuldu:', cmsUploadsPath);
        } else {
            console.log('uploads/cms klasörü zaten mevcut.');
        }

        // Varsayılan admin kullanıcısı kontrol et - ENV'den şifre al
        const existingAdmin = await findUser('admin');
        if (!existingAdmin) {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
            const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
            
            const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
            await createUser('admin', hashedPassword);
            console.log(`Varsayılan admin kullanıcısı oluşturuldu (username: admin, password: ${defaultPassword})`);
        } else {
            console.log('Admin kullanıcısı zaten mevcut.');
        }

    } catch (error) {
        console.error('Database setup hatası:', error);
    }
}

// Eğer bu dosya direkt çalıştırılıyorsa
if (require.main === module) {
    setupDatabase().then(() => {
        console.log('Setup tamamlandı.');
        process.exit(0);
    }).catch((error) => {
        console.error('Setup hatası:', error);
        process.exit(1);
    });
}

module.exports = setupDatabase;