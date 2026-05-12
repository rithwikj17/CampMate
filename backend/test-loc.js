const db = require('./db');
(async () => {
  try {
    const result = await db.query("SELECT * FROM campus_locations LIMIT 1");
    console.log(result.rows[0]);
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
})();
