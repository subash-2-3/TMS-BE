const db = require('../db');

exports.save = async (userId, token, expiresAt) => {
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt]
  );
};

exports.find = async (token) => {
  const [[row]] = await db.query(
    `SELECT * FROM refresh_tokens WHERE token = ?`,
    [token]
  );
  return row;
};

exports.delete = async (token) => {
  await db.query(
    `DELETE FROM refresh_tokens WHERE token = ?`,
    [token]
  );
};
