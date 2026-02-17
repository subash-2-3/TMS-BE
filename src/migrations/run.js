const db = require('../db');
const logger = require('../utils/logger');

module.exports = async function runMigrations() {
    try {
        logger.info('Running database migrations...');

        // Fix: Add company_logo column if missing
        const [rows] = await db.query("SHOW COLUMNS FROM companies LIKE 'company_logo'");

        if (rows.length === 0) {
            logger.info('Migration: Adding company_logo column to companies table...');
            await db.query("ALTER TABLE companies ADD COLUMN company_logo LONGTEXT DEFAULT NULL AFTER address");
            logger.info('Migration: Successfully added company_logo column.');
        } else {
            logger.info('Migration: company_logo column already exists. No action needed.');
        }

        // Fix: Add profile_image column to users if missing
        const [userCols] = await db.query("SHOW COLUMNS FROM users LIKE 'profile_image'");

        if (userCols.length === 0) {
            logger.info('Migration: Adding profile_image column to users table...');
            await db.query("ALTER TABLE users ADD COLUMN profile_image LONGTEXT DEFAULT NULL");
            logger.info('Migration: Successfully added profile_image column.');
        } else {
            logger.info('Migration: profile_image column exists. Ensuring it is LONGTEXT and cleaning bad data...');
            // Force modify to LONGTEXT to support large base64 images
            await db.query("ALTER TABLE users MODIFY COLUMN profile_image LONGTEXT DEFAULT NULL");

            // Clean up bad data from Swagger defaults
            await db.query("UPDATE users SET profile_image = NULL WHERE profile_image = 'string'");
            logger.info('Migration: profile_image column updated and cleaned.');
        }

    } catch (err) {
        logger.error('Migration Failed', err);
        console.error('Migration failed:', err);
    }
};
