const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

const generateTokens = (user) => {
    const payload = { id: user.id, role: user.role, name: user.name };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'super_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return sendError(res, 400, 'Email already registered');

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const userRole = role || 'Student';

        const newUser = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, password_hash, userRole]
        );

        return sendCreated(res, 'User registered successfully', newUser.rows[0]);
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return sendError(res, 401, 'Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return sendError(res, 401, 'Invalid credentials');

        const { accessToken, refreshToken } = generateTokens(user.rows[0]);

        // Set HTTPOnly Cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return sendSuccess(res, 'Login successful', {
            accessToken,
            user: { id: user.rows[0].id, name: user.rows[0].name, email: user.rows[0].email, role: user.rows[0].role }
        });
    } catch (err) {
        next(err);
    }
};

const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return sendError(res, 401, 'Refresh token required');

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret', async (err, decoded) => {
            if (err) return sendError(res, 403, 'Invalid refresh token');

            const user = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
            if (user.rows.length === 0) return sendError(res, 404, 'User not found');

            const tokens = generateTokens(user.rows[0]);

            res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return sendSuccess(res, 'Token refreshed', { accessToken: tokens.accessToken });
        });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken');
        return sendSuccess(res, 'Logged out successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, refresh, logout };
