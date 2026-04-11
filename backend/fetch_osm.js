const https = require('https');

const query = `
[out:json];
(
  way["building"](around:700, 17.7252584, 78.2571511);
  way["highway"](around:700, 17.7252584, 78.2571511);
  node["amenity"](around:700, 17.7252584, 78.2571511);
);
out geom;
`;

const url = 'https://overpass-api.de/api/interpreter';

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Elements fetched:', parsed.elements?.length);
      require('fs').writeFileSync('osm_data.json', JSON.stringify(parsed, null, 2));
    } catch(e) {
      console.log('Parse error:', e);
    }
  });
});

req.on('error', (e) => console.error(e));
req.write('data=' + encodeURIComponent(query));
req.end();
