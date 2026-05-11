const https = require('https');
const db = require('./db');
require('dotenv').config();

const BBOX = [17.721, 78.250, 17.732, 78.261];

const query = `
[out:json];
(
  way["highway"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
  way["building"](${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]});
);
out body;
>;
out skel qt;
`;

function fetchOSM() {
    return new Promise((resolve, reject) => {
        const data = 'data=' + encodeURIComponent(query);
        const options = {
            hostname: 'overpass-api.de',
            port: 443,
            path: '/api/interpreter',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data),
                'User-Agent': 'CampMate/1.0 (admin@campmate.com)'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed with status ${res.statusCode}: ${body.substring(0, 200)}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    reject(new Error("Failed to parse JSON response"));
                }
            });
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function runImport() {
    console.log('🌍 Fetching data from OpenStreetMap...');
    try {
        const data = await fetchOSM();
        console.log(`✅ Received ${data.elements.length} elements from OSM.`);

        // Create node dictionary
        const nodes = {};
        for (const el of data.elements) {
            if (el.type === 'node') {
                nodes[el.id] = { lat: el.lat, lng: el.lon };
            }
        }

        const ways = data.elements.filter(e => e.type === 'way');
        const buildings = ways.filter(w => w.tags && w.tags.building);
        const paths = ways.filter(w => w.tags && w.tags.highway);

        console.log(`🏢 Processing ${buildings.length} buildings...`);
        let buildingsInserted = 0;
        for (const b of buildings) {
            // Find center of building
            let latSum = 0, lngSum = 0, count = 0;
            for (const nId of b.nodes) {
                if (nodes[nId]) {
                    latSum += nodes[nId].lat;
                    lngSum += nodes[nId].lng;
                    count++;
                }
            }
            if (count > 0) {
                const lat = latSum / count;
                const lng = lngSum / count;
                const name = b.tags.name || 'Building'; // Use generic name if not tagged
                
                await db.query(
                    `INSERT INTO campus_locations (location_name, latitude, longitude, description, category, is_accessible) 
                     VALUES ($1, $2, $3, $4, $5, true)`,
                    [name, lat, lng, b.tags.amenity || 'Campus Building', 'Building']
                );
                buildingsInserted++;
            }
        }
        console.log(`✅ Inserted ${buildingsInserted} buildings into campus_locations.`);

        console.log(`🛣️ Processing ${paths.length} paths...`);
        let pathsInserted = 0;
        for (const p of paths) {
            const coordinates = [];
            for (const nId of p.nodes) {
                if (nodes[nId]) {
                    coordinates.push(nodes[nId]);
                }
            }
            if (coordinates.length >= 2) {
                const name = p.tags.name || p.tags.highway || 'Campus Path';
                await db.query(
                    'INSERT INTO campus_paths (name, coordinates) VALUES ($1, $2)',
                    [name, JSON.stringify(coordinates)]
                );
                pathsInserted++;
            }
        }
        console.log(`✅ Inserted ${pathsInserted} paths into campus_paths.`);

        console.log('🎉 Import completed successfully! (Kept existing data intact)');

    } catch (err) {
        console.error('❌ Import failed:', err);
    } finally {
        process.exit(0);
    }
}

runImport();
