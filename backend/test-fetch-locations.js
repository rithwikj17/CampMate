const jwt = require('jsonwebtoken');
require('dotenv').config();

const actualToken = jwt.sign(
  { id: 1, role: 'Administrator' },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);

fetch('http://localhost:5000/api/locations', { 
  headers: { 'Authorization': 'Bearer ' + actualToken }
})
.then(res => res.json())
.then(data => console.log('FETCH SUCCESS, total pins:', data.data ? data.data.length : data))
.catch(err => console.error('ERROR:', err.message));
