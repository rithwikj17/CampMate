const db = require('./db');

(async () => {
  try {
    const result = await db.query(
      `INSERT INTO campus_locations (location_name, latitude, longitude, description, category, floor_number, image_url, building_id, opening_hours, is_accessible)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      ['Test Pin', 17.7252584, 78.2571511, null, 'Academic', null, null, null, null, false]
    );
    console.log('INSERT SUCCESS:', result.rows[0]);
  } catch (err) {
    console.error('DB ERROR:', err.message);
  } finally {
    process.exit(0);
  }
})();
