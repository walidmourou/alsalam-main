import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkTables() {
  try {
    console.log('=== MEMBERSHIPS TABLE ===');
    const [memberships] = await pool.query('DESCRIBE memberships');
    console.table(memberships);
    
    console.log('\n=== STUDENTS TABLE ===');
    const [students] = await pool.query('DESCRIBE students');
    console.table(students);
    
    console.log('\n=== STUDENT_GUARDIANS TABLE ===');
    try {
      const [guardians] = await pool.query('DESCRIBE student_guardians');
      console.table(guardians);
    } catch (e) {
      console.log('Table student_guardians does not exist');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
