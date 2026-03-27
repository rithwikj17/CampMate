const db = require('../db');
const { sendSuccess, sendError } = require('../utils/response');

const getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        const notifications = await db.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY is_read ASC, created_at DESC LIMIT 50',
            [userId]
        );

        return sendSuccess(res, 'Notifications fetched successfully', notifications.rows);
    } catch (err) {
        next(err);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return sendError(res, 404, 'Notification not found');
        }

        return sendSuccess(res, 'Notification marked as read', result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = { getMyNotifications, markAsRead };
