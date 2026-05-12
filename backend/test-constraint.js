const db = require('./db');

(async () => {
  try {
    const result = await db.query(`
      SELECT pg_get_constraintdef(oid) as def
      FROM pg_constraint
      WHERE conname = 'campus_locations_category_check'
    `);
    console.log('CONSTRAINT:', result.rows[0]);
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit(0);
  }
})();
