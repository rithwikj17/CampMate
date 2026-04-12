const db = require('./db.js');
db.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'campus_locations_category_check';")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => process.exit());
