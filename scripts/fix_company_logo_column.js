const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const logFile = './fix_result.txt';
function log(msg) {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
}

async function run() {
    try {
        log('Script started.');
        log(`Connecting to ${process.env.DB_HOST} with user ${process.env.DB_USER}`);

        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        log('Connected to DB.');

        const [rows] = await connection.query("SHOW COLUMNS FROM companies LIKE 'company_logo'");
        log(`Found columns: ${rows.length}`);

        if (rows.length === 0) {
            log('Adding company_logo column...');
            await connection.query("ALTER TABLE companies ADD COLUMN company_logo LONGTEXT DEFAULT NULL AFTER address");
            log('Column company_logo added successfully.');
        } else {
            log('Column company_logo already exists.');
        }

        await connection.end();
        log('Connection closed. Exiting.');
        process.exit(0);
    } catch (err) {
        log(`Error: ${err.message}`);
        log(err.stack);
        process.exit(1);
    }
}

run();
