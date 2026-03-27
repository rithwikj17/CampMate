const db = require('../db');
const { sendSuccess } = require('../utils/response');

const getAllLocations = async (req, res, next) => {
    try {
        const locations = await db.query('SELECT * FROM campus_locations ORDER BY location_name');
        return sendSuccess(res, 'Locations fetched successfully', locations.rows);
    } catch (err) {
        next(err);
    }
};

module.exports = { getAllLocations };
