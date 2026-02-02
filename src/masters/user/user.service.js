const db = require('../../db');

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO users 
     (company_id, role_id, name, email, password_hash, profile_image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.company_id,
      data.role_id,
      data.name,
      data.email,
      data.password_hash,
      data.profile_image || null
    ]
  );
  return result.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(`
    SELECT 
      u.id, u.name, u.email, u.is_active,
      c.name AS company,
      r.name AS role
    FROM users u
    JOIN companies c ON c.id = u.company_id
    JOIN roles r ON r.id = u.role_id
    WHERE u.is_active = 1
  `);
  return rows;
};

exports.getByEmail = async (email) => {
  const [[row]] = await db.query(
    `SELECT 
       u.id,
       u.company_id,
       u.password_hash,
       r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ? AND u.is_active = 1`,
    [email]
  );
  return row;
};


exports.getById = async (id) => {
  const [[row]] = await db.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
  return row;
};

exports.update = async (id, data) => {
  await db.query(`UPDATE users SET ? WHERE id = ?`, [data, id]);
};

exports.softDelete = async (id) => {
  await db.query(
    `UPDATE users SET is_active = 0 WHERE id = ?`,
    [id]
  );
};
