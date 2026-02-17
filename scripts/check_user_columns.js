const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserColumns() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to DB.');

        const [rows] = await connection.query("SHOW COLUMNS FROM users LIKE 'profile_image'");
        console.log('Existing columns check:', rows);

        if (rows.length === 0) {
            console.log('Column profile_image is MISSING.');
        } else {
            console.log('Column profile_image EXISTS.');
        }

        await connection.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUserColumns();
