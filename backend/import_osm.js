const fs = require('fs');
const db = require('./db');

async function importOSM() {
    console.log('Connecting to database...');
    
    // Create missing campus_paths table
    await db.query(`
        CREATE TABLE IF NOT EXISTS campus_paths (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            coordinates JSONB NOT NULL,
            created_by INTEGER REFERENCES users(id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    console.log('Wiping old dummy data...');
    await db.query('DELETE FROM campus_locations');
    await db.query('DELETE FROM campus_paths');
    console.log('Dummy data wiped.');

    const data = JSON.parse(fs.readFileSync('osm_data.json', 'utf-8'));
    
    let injectedLocations = 0;
    let injectedPaths = 0;

    for (let element of data.elements) {
        // Handle Paths (highway)
        if (element.type === 'way' && element.tags && element.tags.highway) {
            if (element.geometry && element.geometry.length > 1) {
                // Frontend expects array of objects for graph building: { lng, lat }
                const coordinates = element.geometry.map(pt => ({ lng: pt.lon, lat: pt.lat }));
                const name = element.tags.name || 'Campus Path';
                await db.query(
                    'INSERT INTO campus_paths (name, coordinates) VALUES ($1, $2)',
                    [name, JSON.stringify(coordinates)]
                );
                injectedPaths++;
            }
            continue;
        }

        // Handle Buildings / Amenities
        let lat, lon;
        if (element.type === 'node') {
            lat = element.lat;
            lon = element.lon;
        } else if (element.type === 'way' && element.geometry) {
            // Calculate center of the way using the bounding box or average of geometry
            const lats = element.geometry.map(g => g.lat);
            const lons = element.geometry.map(g => g.lon);
            lat = lats.reduce((a, b) => a + b, 0) / lats.length;
            lon = lons.reduce((a, b) => a + b, 0) / lons.length;
        }

        if (lat && lon && element.tags) {
            const name = element.tags.name || element.tags.building || element.tags.amenity || 'Location';
            
            // Map tags to category
            let category = 'Building';
            if (name.toLowerCase().includes('hostel')) {
                category = 'Hostel';
            } else if (element.tags.parking || name.toLowerCase().includes('parking')) {
                category = 'Parking';
            } else if (element.tags.amenity === 'place_of_worship') {
                category = 'Building'; // Fallback
            }

            // Generate description
            let description = `Imported from OSM (${element.tags.amenity || element.tags.building || 'building'})`;
            
            await db.query(`
                INSERT INTO campus_locations (location_name, latitude, longitude, description, category)
                VALUES ($1, $2, $3, $4, $5)
            `, [name, lat, lon, description, category]);
            injectedLocations++;
        }
    }

    console.log(`Success! Injected ${injectedLocations} locations and ${injectedPaths} paths.`);
    process.exit(0);
}

importOSM().catch(err => {
    console.error('Error importing:', err);
    process.exit(1);
});
