const bcrypt = require('bcryptjs');
const { findUser } = require('./database');

// Login fonksiyonu
const login = async (username, password) => {
    try {
        const user = await findUser(username);
        if (!user) {
            return { success: false, message: 'Kullanıcı bulunamadı' };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { success: false, message: 'Şifre yanlış' };
        }

        return { 
            success: true, 
            user: { id: user.id, username: user.username } 
        };
    } catch (error) {
        return { success: false, message: 'Giriş hatası' };
    }
};

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/dashboard/login');
    }
    next();
};

module.exports = {
    login,
    requireAuth
};