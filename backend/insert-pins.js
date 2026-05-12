const db = require('./db');

const locations = [
  { name: 'CSE Block', lat: 17.7255, lng: 78.2575, desc: 'Computer Science and Engineering Department classrooms and labs.', cat: 'Academic' },
  { name: 'ECE Block', lat: 17.7251, lng: 78.2568, desc: 'Electronics and Communication Engineering Department.', cat: 'Academic' },
  { name: 'Central Library', lat: 17.7260, lng: 78.2570, desc: 'A spacious central library and information centre.', cat: 'Academic' },
  { name: 'Auditorium', lat: 17.7248, lng: 78.2578, desc: 'Multi-purpose auditorium for events and guest lectures.', cat: 'Building' },
  { name: 'Sports Complex', lat: 17.7240, lng: 78.2560, desc: 'Indoor and outdoor sports facilities including basketball and cricket.', cat: 'Sports' },
  { name: 'Cafeteria', lat: 17.7258, lng: 78.2580, desc: 'Spacious food court serving hygienic food.', cat: 'Canteen' },
  { name: 'Wellness Centre', lat: 17.7265, lng: 78.2565, desc: 'On-campus medical facility with a residential doctor.', cat: 'Building' },
  { name: 'Boat Club', lat: 17.7235, lng: 78.2585, desc: 'Recreational boating facility on campus.', cat: 'Outdoor' },
  { name: 'Bus Terminal', lat: 17.7270, lng: 78.2580, desc: 'Transport hub for college buses.', cat: 'Parking' },
  { name: 'Girls Hostel', lat: 17.7275, lng: 78.2555, desc: 'Secure residential facility for female students.', cat: 'Hostel' }
];

(async () => {
  try {
    for (const loc of locations) {
      await db.query(
        `INSERT INTO campus_locations (location_name, latitude, longitude, description, category, is_accessible) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [loc.name, loc.lat, loc.lng, loc.desc, loc.cat]
      );
    }
    console.log('Successfully inserted building pins.');
  } catch (err) {
    console.error('Error inserting pins:', err.message);
  } finally {
    process.exit(0);
  }
})();
