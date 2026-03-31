const db = require('../db');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/paths — all paths
const getAllPaths = async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM campus_paths ORDER BY created_at DESC');
        return sendSuccess(res, 'Paths fetched successfully', result.rows);
    } catch (err) {
        next(err);
    }
};

// POST /api/paths — admin creates a path
const createPath = async (req, res, next) => {
    try {
        const { name, coordinates } = req.body;
        if (!name || !coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
            return sendError(res, 400, 'name and at least 2 coordinates are required.');
        }
        const result = await db.query(
            'INSERT INTO campus_paths (name, coordinates, created_by) VALUES ($1, $2, $3) RETURNING *',
            [name, JSON.stringify(coordinates), req.user?.id || null]
        );
        return sendSuccess(res, 'Path created successfully', result.rows[0], 201);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/paths/:id — admin deletes a path
const deletePath = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM campus_paths WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return sendError(res, 404, 'Path not found.');
        return sendSuccess(res, 'Path deleted successfully', result.rows[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllPaths, createPath, deletePath };
