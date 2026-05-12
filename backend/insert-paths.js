const db = require('./db');

const paths = [
  {
    name: 'Main Campus Road',
    coordinates: [
      { lat: 17.7270, lng: 78.2580 }, // Bus Terminal
      { lat: 17.7258, lng: 78.2580 }, // Cafeteria
      { lat: 17.7255, lng: 78.2575 }, // CSE Block
      { lat: 17.7248, lng: 78.2578 }, // Auditorium
      { lat: 17.7235, lng: 78.2585 }  // Boat Club
    ]
  },
  {
    name: 'Academic Spine Walkway',
    coordinates: [
      { lat: 17.7251, lng: 78.2568 }, // ECE Block
      { lat: 17.7253, lng: 78.2572 }, // Middle point
      { lat: 17.7255, lng: 78.2575 }, // CSE Block
      { lat: 17.7260, lng: 78.2570 }  // Central Library
    ]
  },
  {
    name: 'Hostel Connector',
    coordinates: [
      { lat: 17.7275, lng: 78.2555 }, // Girls Hostel
      { lat: 17.7265, lng: 78.2565 }, // Wellness Centre
      { lat: 17.7260, lng: 78.2570 }  // Central Library
    ]
  },
  {
    name: 'Sports Path',
    coordinates: [
      { lat: 17.7251, lng: 78.2568 }, // ECE Block
      { lat: 17.7245, lng: 78.2564 }, // Middle point
      { lat: 17.7240, lng: 78.2560 }  // Sports Complex
    ]
  }
];

(async () => {
  try {
    for (const path of paths) {
      await db.query(
        'INSERT INTO campus_paths (name, coordinates) VALUES ($1, $2)',
        [path.name, JSON.stringify(path.coordinates)]
      );
    }
    console.log('Successfully inserted campus paths.');
  } catch (err) {
    console.error('Error inserting paths:', err.message);
  } finally {
    process.exit(0);
  }
})();
