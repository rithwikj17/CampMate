require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'campmate'
});

async function seed() {
  console.log('🌱 Starting database seed...');
  
  try {
    // 1. Clean existing tables (in correct foreign key order)
    console.log('🧹 Truncating existing tables...');
    await pool.query(`
      TRUNCATE TABLE 
        event_registrations, 
        club_members, 
        notifications, 
        announcements,
        events, 
        clubs, 
        users, 
        campus_locations 
      RESTART IDENTITY CASCADE;
    `);

    // 2. Insert Users
    console.log('👤 Seeding Users...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('Test@1234', saltRounds);

    const usersRes = await pool.query(`
      INSERT INTO users (name, email, password_hash, role, bio) VALUES 
        ('Aryan Sharma', 'student@campmate.com', $1, 'Student', 'Just a regular student.'),
        ('Priya Reddy', 'club@campmate.com', $1, 'Club Member', 'Tech enthusiast & builder.'),
        ('Admin Sir', 'admin@campmate.com', $1, 'Administrator', 'Campus systems administrator.')
      RETURNING id, role;
    `, [passwordHash]);
    
    const users = usersRes.rows;
    const student = users.find(u => u.role === 'Student');
    const clubMember = users.find(u => u.role === 'Club Member');
    const admin = users.find(u => u.role === 'Administrator');

    // 3. Insert Clubs
    console.log('⛺ Seeding Clubs...');
    const clubsRes = await pool.query(`
      INSERT INTO clubs (club_name, description, created_by) VALUES 
        ('Coding Club', 'A community of developers building cool things. Join us for hackathons and workshops!', $1),
        ('Cultural Club', 'Embracing art, dance, drama, and campus festivals. Creativity unleashed.', $1),
        ('Sports Club', 'Promoting fitness and organizing inter-college tournaments.', $1)
      RETURNING id, club_name;
    `, [admin.id]);
    
    const clubs = clubsRes.rows;
    const codingClub = clubs.find(c => c.club_name === 'Coding Club');
    const culturalClub = clubs.find(c => c.club_name === 'Cultural Club');
    const sportsClub = clubs.find(c => c.club_name === 'Sports Club');

    // 4. Insert Club Members
    console.log('👥 Seeding Club Members...');
    await pool.query(`
      INSERT INTO club_members (user_id, club_id, role) VALUES 
        ($1, $2, 'Admin'),    -- Priya is Admin of Coding Club
        ($3, $2, 'Member'),   -- Aryan is Member of Coding Club
        ($3, $4, 'Member')    -- Aryan is Member of Cultural Club
    `, [clubMember.id, codingClub.id, student.id, culturalClub.id]);

    // 5. Insert Events
    console.log('📅 Seeding Events...');
    const now = new Date();
    
    const event1Date = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const event2Date = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    const event3Date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const event4Date = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const event5Date = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    // Format dates to YYYY-MM-DD for Postgres
    const formatDate = (d) => d.toISOString().split('T')[0];

    const eventsRes = await pool.query(`
      INSERT INTO events (title, description, date, time, venue, organizer_id, category, max_participants) VALUES 
        ('Hackathon 2026', 'A 24-hour coding sprint. Build next-gen web apps and win prizes.', $1, '09:00:00', 'Main Auditorium', $2, 'Technical', 100),
        ('AI Workshop', 'Hands-on session on building RAG pipelines with OpenAI.', $3, '14:00:00', 'Computer Lab 3', $2, 'Workshop', 50),
        ('Annual Fest Dance Off', 'Inter-department dance competition. Bring your best moves!', $4, '17:30:00', 'Open Air Theatre', $5, 'Cultural', NULL),
        ('Cricket Tournament Finale', 'The final showdown between CSE and ECE departments.', $6, '15:00:00', 'Main Ground', $7, 'Sports', 200),
        ('Resume Review Session', 'Get your resume reviewed by industry experts before placements.', $8, '10:00:00', 'Seminar Hall', $2, 'Other', 60)
      RETURNING id;
    `, [
      formatDate(event1Date), codingClub.id, 
      formatDate(event2Date), culturalClub.id, // cultural club runs fest (wait, AI workshop by coding club)
      formatDate(event3Date), culturalClub.id, 
      formatDate(event4Date), sportsClub.id,
      formatDate(event5Date) // resume review by coding club
    ]);
    
    // Fix Organizer IDs manually via array parameters mapping:
    // Actually, let's just do multiple queries to be safe and clear.
    await pool.query('DELETE FROM events;'); // Reset from the batch above as the params got messy
    
    const eventsInserted = await pool.query(`
      INSERT INTO events (title, description, date, time, venue, organizer_id, category, max_participants) VALUES 
        ('Hackathon 2026', 'A 24-hour coding sprint. Build next-gen web apps and win prizes.', $1, '09:00:00', 'Main Auditorium', $2, 'Technical', 100),
        ('AI Workshop', 'Hands-on session on building RAG pipelines with OpenAI.', $3, '14:00:00', 'Computer Lab 3', $2, 'Workshop', 50),
        ('Annual Fest Dance Off', 'Inter-department dance competition. Bring your best moves!', $4, '17:30:00', 'Open Air Theatre', $5, 'Cultural', NULL),
        ('Cricket Tournament Finale', 'The final showdown between CSE and ECE departments.', $6, '15:00:00', 'Main Ground', $7, 'Sports', 200),
        ('Resume Review Session', 'Get your resume reviewed by industry experts before placements.', $8, '10:00:00', 'Seminar Hall', $2, 'Other', 60)
      RETURNING id, title;
    `, [
      formatDate(event1Date), codingClub.id, 
      formatDate(event2Date), // $3
      formatDate(event3Date), culturalClub.id, // $4, $5
      formatDate(event4Date), sportsClub.id, // $6, $7
      formatDate(event5Date) // $8
    ]);
    
    const eventsList = eventsInserted.rows;

    // 6. Insert Event Registrations
    console.log('🎟️ Seeding Event Registrations...');
    await pool.query(`
      INSERT INTO event_registrations (user_id, event_id, status) VALUES 
        ($1, $4, 'Confirmed'), -- Student -> Hackathon
        ($1, $5, 'Confirmed'), -- Student -> AI Workshop
        ($2, $4, 'Confirmed'), -- Club Member -> Hackathon
        ($3, $6, 'Confirmed')  -- Admin -> Annual Fest
    `, [
      student.id, 
      clubMember.id, 
      admin.id, 
      eventsList.find(e => e.title.includes('Hackathon')).id,
      eventsList.find(e => e.title.includes('AI Workshop')).id,
      eventsList.find(e => e.title.includes('Annual Fest')).id
    ]);

    // 7. Insert Campus Locations (Around BVRIT Narsapur)
    console.log('📍 Seeding Campus Locations...');
    await pool.query(`
      INSERT INTO campus_locations (location_name, description, latitude, longitude) VALUES 
        ('Main Administration Block', 'Principal office, admin affairs, and fees submission.', 17.7265, 78.2542),
        ('Central Library', 'Three stories of engineering books, journals, and a digital library.', 17.7258, 78.2536),
        ('Aryabhatta Core Lab Block', 'Computer Science and IT department labs.', 17.7241, 78.2558),
        ('Student Cafeteria', 'Multi-cuisine central canteen and student hangout spot.', 17.7235, 78.2561),
        ('Vishveshwarya Sports Complex', 'Indoor stadium, gym, and main cricket ground.', 17.7275, 78.2570)
    `);

    console.log('✅ Seeding completed successfully!');
    
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  } finally {
    // End the pool to allow the script to exit gracefully
    await pool.end();
    process.exit(0);
  }
}

seed();
