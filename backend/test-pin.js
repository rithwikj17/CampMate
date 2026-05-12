require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

const token = jwt.sign(
  { id: 1, role: 'Administrator' },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);

axios.post('http://localhost:5000/api/locations', {
  location_name: 'Test Pin',
  latitude: 17.7252584,
  longitude: 78.2571511,
  category: 'Academic'
}, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => console.log('SUCCESS:', res.data))
.catch(err => {
  console.log('ERROR:', err.response ? err.response.data : err.message);
});
