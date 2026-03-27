const db = require('../db');
const { sendSuccess, sendError } = require('../utils/response');

const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            'SELECT id, name, email, role, profile_picture_url, bio, is_active, created_at FROM users WHERE id = $1', 
            [userId]
        );
        if (result.rows.length === 0) return sendError(res, 404, 'User not found');
        return sendSuccess(res, 'User profile fetched successfully', result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const updateMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { bio, profile_picture_url } = req.body;
        
        const result = await db.query(
            'UPDATE users SET bio = COALESCE($1, bio), profile_picture_url = COALESCE($2, profile_picture_url) WHERE id = $3 RETURNING id, name, bio, profile_picture_url',
            [bio, profile_picture_url, userId]
        );

        if (result.rows.length === 0) return sendError(res, 404, 'User not found');
        return sendSuccess(res, 'User profile updated successfully', result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const getMyEvents = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const query = `
            SELECT e.*, er.status as registration_status, er.registered_at
            FROM events e
            JOIN event_registrations er ON e.id = er.event_id
            WHERE er.user_id = $1
            ORDER BY e.date ASC, e.time ASC
        `;
        
        const result = await db.query(query, [userId]);
        return sendSuccess(res, 'User events fetched successfully', result.rows);
    } catch (err) {
        next(err);
    }
};

module.exports = { getMe, updateMe, getMyEvents };
