const https = require('https');

async function fetchOSM() {
    const bbox = [17.721, 78.250, 17.732, 78.261]; // minLat, minLon, maxLat, maxLon (approx BVRIT bounding box)
    
    const query = `
    [out:json];
    (
      way["highway"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
      way["building"](${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]});
    );
    out body;
    >;
    out skel qt;
    `;

    const data = 'data=' + encodeURIComponent(query);

    const options = {
        hostname: 'overpass-api.de',
        port: 443,
        path: '/api/interpreter',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
            'User-Agent': 'CampMate/1.0 (ayush@example.com)'
        }
    };

    const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            console.log("HTTP Status:", res.statusCode);
            if (res.statusCode !== 200) {
                console.error("Failed:", body.substring(0, 500));
                return;
            }
            try {
                const parsed = JSON.parse(body);
                console.log(`Received ${parsed.elements.length} elements.`);
                const ways = parsed.elements.filter(e => e.type === 'way');
                console.log(`Buildings: ${ways.filter(w => w.tags && w.tags.building).length}`);
                console.log(`Highways: ${ways.filter(w => w.tags && w.tags.highway).length}`);
            } catch (e) {
                console.error("Not JSON:", body.substring(0, 100));
            }
        });
    });

    req.write(data);
    req.end();
}

fetchOSM();
