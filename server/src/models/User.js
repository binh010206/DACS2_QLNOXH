// src/models/User.js
const db = require("../config/db");

const User = {
  findByEmail: (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], callback);
  },

  create: (data, callback) => {
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [data.name, data.email, data.password, data.role || "user"],
      callback
    );
  },

  findById: (id, callback) => {
    db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
      [id],
      callback
    );
  },

  getAll: (callback) => {
    db.query("SELECT id, name, email, role, created_at FROM users", callback);
  },

  update: (id, data, callback) => {
    const fields = [];
    const params = [];
    if (data.name !== undefined) { fields.push("name = ?"); params.push(data.name); }
    if (data.email !== undefined) { fields.push("email = ?"); params.push(data.email); }
    if (data.password !== undefined) { fields.push("password = ?"); params.push(data.password); }
    if (data.role !== undefined) { fields.push("role = ?"); params.push(data.role); }

    if (fields.length === 0) return callback(null, { affectedRows: 0 });

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    params.push(id);
    db.query(sql, params, callback);
  },

  remove: (id, callback) => {
    db.query("DELETE FROM users WHERE id = ?", [id], callback);
  }
};

module.exports = User;
