const db = require('../../db');

exports.checkDuplicate = async (email) => {
  const [[row]] = await db.query(
    `SELECT id FROM companies WHERE email = ? AND is_active = 1`,
    [email]
  );
  return row;
};

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO companies (name, email, phone, address, company_logo)
     VALUES (?, ?, ?, ?, ?)`,
    [data.name, data.email, data.phone, data.address, data.company_logo || null]
  );
  return result.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    `SELECT * FROM companies WHERE is_active = 1`
  );
  return rows;
};

exports.getById = async (id) => {
  const [[row]] = await db.query(
    `SELECT * FROM companies WHERE id = ?`,
    [id]
  );
  return row;
};

exports.update = async (id, data) => {
  await db.query(
    `UPDATE companies SET ? WHERE id = ?`,
    [data, id]
  );
};

exports.softDelete = async (id) => {
  await db.query(
    `UPDATE companies SET is_active = 0 WHERE id = ?`,
    [id]
  );
};
