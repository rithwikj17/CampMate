const db = require('../db');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');

const getAllEvents = async (req, res, next) => {
    try {
        const { category, upcoming, search, page = 1, limit = 10 } = req.query;
        
        let query = `
            SELECT e.*, c.club_name as organizer_name, cl.latitude as location_lat, cl.longitude as location_lng 
            FROM events e 
            LEFT JOIN clubs c ON e.organizer_id = c.id
            LEFT JOIN campus_locations cl ON e.location_id = cl.id
            WHERE e.deleted_at IS NULL
        `;
        const queryParams = [];
        let paramIndex = 1;

        if (category) {
            query += ` AND e.category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        if (upcoming === 'true') {
            query += ` AND e.date >= CURRENT_DATE`;
        }

        if (search) {
            query += ` AND (e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Count total for pagination
        const countQuery = query.replace('SELECT e.*, c.club_name as organizer_name, cl.latitude as location_lat, cl.longitude as location_lng', 'SELECT COUNT(*)');
        const totalResult = await db.query(countQuery, queryParams);
        const totalItemCount = parseInt(totalResult.rows[0].count, 10);

        // Sorting and Pagination
        query += ` ORDER BY e.date ASC, e.time ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const offset = (page - 1) * limit;
        queryParams.push(limit, offset);

        const events = await db.query(query, queryParams);

        const pagination = {
            totalData: totalItemCount,
            totalPages: Math.ceil(totalItemCount / limit),
            currentPage: parseInt(page, 10),
            limit: parseInt(limit, 10)
        };

        return sendSuccess(res, 'Events fetched successfully', events.rows, pagination);
    } catch (err) {
        next(err);
    }
};

const createEvent = async (req, res, next) => {
    try {
        const { title, description, date, time, venue, category, organizer_id, max_participants, location_id } = req.body;

        // Verify club membership if user is not Administrator
        if (req.user.role !== 'Administrator') {
            const memberCheck = await db.query(
                'SELECT * FROM club_members WHERE user_id = $1 AND club_id = $2 AND role = $3', 
                [req.user.id, organizer_id, 'Admin']
            );
            if(memberCheck.rows.length === 0) {
                return sendError(res, 403, 'You are not an admin of this club.');
            }
        }

        const newEvent = await db.query(
            'INSERT INTO events (title, description, date, time, venue, category, organizer_id, max_participants, location_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [title, description, date, time, venue, category, organizer_id, max_participants || null, location_id || null]
        );

        return sendCreated(res, 'Event created successfully', newEvent.rows[0]);
    } catch (err) {
        next(err);
    }
};

const registerEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        // 1. Check if event exists
        const eventRes = await db.query('SELECT max_participants, is_cancelled, deleted_at FROM events WHERE id = $1', [id]);
        if (eventRes.rows.length === 0 || eventRes.rows[0].deleted_at !== null) {
            return sendError(res, 404, 'Event not found');
        }
        if (eventRes.rows[0].is_cancelled) {
            return sendError(res, 400, 'This event is cancelled');
        }

        const maxParticipants = eventRes.rows[0].max_participants;

        // 2. Count current confirmed registrations
        const countRes = await db.query("SELECT COUNT(*) FROM event_registrations WHERE event_id = $1 AND status = 'Confirmed'", [id]);
        const currentCount = parseInt(countRes.rows[0].count, 10);

        let status = 'Confirmed';
        if (maxParticipants !== null && currentCount >= maxParticipants) {
            status = 'Waitlisted';
        }

        // 3. Register user
        const newReg = await db.query(
            'INSERT INTO event_registrations (user_id, event_id, status) VALUES ($1, $2, $3) RETURNING *',
            [user_id, id, status]
        );

        const message = status === 'Confirmed' ? 'Successfully registered for event' : 'Added to the waitlist';
        return sendCreated(res, message, newReg.rows[0]);

    } catch (err) {
        if(err.code === '23505') return sendError(res, 400, 'You are already registered or waitlisted for this event');
        next(err);
    }
};

const unregisterEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await db.query(
            'DELETE FROM event_registrations WHERE user_id = $1 AND event_id = $2 RETURNING *',
            [user_id, id]
        );

        if (result.rows.length === 0) {
            return sendError(res, 404, 'Registration not found');
        }

        // Logic to move a waitlisted person to confirmed could go here in a real app
        // For now, we will just delete the registration

        return sendSuccess(res, 'Successfully unregistered from event');
    } catch (err) {
        next(err);
    }
};

const deleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query('UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return sendError(res, 404, 'Event not found');
        }

        return sendSuccess(res, 'Event softly deleted successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllEvents, createEvent, registerEvent, unregisterEvent, deleteEvent };
