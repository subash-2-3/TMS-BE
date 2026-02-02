const db = require('../../db');

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO roles (name, description)
     VALUES (?, ?)`,
    [data.name, data.description]
  );
  return result.insertId;
};

exports.getAll = async () => {
  const [rows] = await db.query(
    `SELECT * FROM roles`
  );
  return rows;
};

exports.getById = async (id) => {
  const [[row]] = await db.query(
    `SELECT * FROM roles WHERE id = ?`,
    [id]
  );
  return row;
};

exports.update = async (id, data) => {
  await db.query(
    `UPDATE roles SET ? WHERE id = ?`,
    [data, id]
  );
};

exports.softDelete = async (id) => {
  await db.query(
    `DELETE FROM roles WHERE id = ?`,
    [id]
  );
};
