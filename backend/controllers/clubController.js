const db = require('../db');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

const getAllClubs = async (req, res, next) => {
    try {
        const clubs = await db.query('SELECT * FROM clubs WHERE deleted_at IS NULL ORDER BY club_name');
        return sendSuccess(res, 'Clubs fetched successfully', clubs.rows);
    } catch (err) {
        next(err);
    }
};

const getClubById = async (req, res, next) => {
    try {
        const club = await db.query('SELECT * FROM clubs WHERE id = $1 AND deleted_at IS NULL', [req.params.id]);
        if (club.rows.length === 0) return sendError(res, 404, 'Club not found');

        const events = await db.query(`
            SELECT * FROM events WHERE organizer_id = $1 AND deleted_at IS NULL ORDER BY date
        `, [req.params.id]);

        return sendSuccess(res, 'Club details fetched successfully', {
            ...club.rows[0],
            events: events.rows
        });
    } catch (err) {
        next(err);
    }
};

const joinClub = async (req, res, next) => {
    try {
        const newMember = await db.query(
            'INSERT INTO club_members (club_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
            [req.params.id, req.user.id, 'Member']
        );
        return sendCreated(res, 'Successfully joined the club', newMember.rows[0]);
    } catch (err) {
        if(err.code === '23505') return sendError(res, 400, 'Already a member of this club');
        next(err);
    }
};

const leaveClub = async (req, res, next) => {
    try {
        const result = await db.query(
            'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return sendError(res, 404, 'You are not a member of this club');
        return sendSuccess(res, 'Successfully left the club');
    } catch (err) {
        next(err);
    }
};

const getClubMembers = async (req, res, next) => {
    try {
        const clubId = req.params.id;
        
        // Validation: Must be Administrator OR Club Admin of this specific club
        let hasAccess = req.user.role === 'Administrator';
        
        if (!hasAccess) {
            const memberCheck = await db.query(
                'SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2',
                [clubId, req.user.id]
            );
            if (memberCheck.rows.length > 0 && memberCheck.rows[0].role === 'Admin') {
                hasAccess = true;
            }
        }

        if (!hasAccess) {
            return sendError(res, 403, 'Forbidden. Only administrators or club admins can view members.');
        }

        const members = await db.query(`
            SELECT u.id, u.name, u.email, u.profile_picture_url, cm.role, cm.created_at
            FROM club_members cm 
            JOIN users u ON cm.user_id = u.id 
            WHERE cm.club_id = $1
        `, [clubId]);

        return sendSuccess(res, 'Club members fetched successfully', members.rows);
    } catch (err) {
        next(err);
    }
};

const createAnnouncement = async (req, res, next) => {
    try {
        const clubId = req.params.id;
        const { title, body } = req.body;

        // Validation: Must be Club Admin
        const memberCheck = await db.query(
            'SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2',
            [clubId, req.user.id]
        );

        if (memberCheck.rows.length === 0 || memberCheck.rows[0].role !== 'Admin') {
            return sendError(res, 403, 'Forbidden. Only club admins can post announcements.');
        }

        const announcement = await db.query(
            'INSERT INTO announcements (club_id, author_id, title, body) VALUES ($1, $2, $3, $4) RETURNING *',
            [clubId, req.user.id, title, body]
        );

        return sendCreated(res, 'Announcement created successfully', announcement.rows[0]);
    } catch (err) {
        next(err);
    }
};

const getClubEvents = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verify club exists
        const clubResult = await db.query(
            'SELECT id, club_name FROM clubs WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        if (clubResult.rows.length === 0) return sendError(res, 404, 'Club not found');

        const events = await db.query(`
            SELECT id, title, description, date, time, venue, category, poster_url, is_cancelled
            FROM events
            WHERE organizer_id = $1 AND deleted_at IS NULL
            ORDER BY date DESC
        `, [id]);

        return sendSuccess(res, 'Club events fetched successfully', events.rows);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllClubs, getClubById, joinClub, leaveClub, getClubMembers, createAnnouncement, getClubEvents };
