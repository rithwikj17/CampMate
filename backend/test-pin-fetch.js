require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, role: 'Administrator' },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);

fetch('http://localhost:5000/api/locations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    location_name: 'Test Pin',
    latitude: 17.7252584,
    longitude: 78.2571511,
    category: 'Academic'
  })
})
.then(res => res.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => console.log('ERROR:', err.message));
