const jwt = require('jsonwebtoken');

require('dotenv').config();
const actualToken = jwt.sign(
  { id: 1, role: 'Administrator' },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: '1h' }
);

fetch('http://localhost:5000/api/ai/chat', { 
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + actualToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: 'What events are happening?' })
})
.then(res => res.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => {
  console.log('ERROR:', err.message);
});
