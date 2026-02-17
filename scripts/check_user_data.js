const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUserData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected.');

        // Check column type
        const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'profile_image'");
        console.log('Column Schema:', columns);

        // Check data
        const [rows] = await connection.query("SELECT id, email, length(profile_image) as img_len, left(profile_image, 30) as img_start FROM users");
        console.log('User Data:', rows);

        await connection.end();
    } catch (err) {
        console.error(err);
    }
}

checkUserData();
