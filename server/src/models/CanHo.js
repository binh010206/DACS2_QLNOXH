// src/models/CanHo.js
const db = require("../config/db");

const CanHo = {
  getAll: (options, callback) => {
    // options: { q, page, limit, sortBy, sortDir }
    const { q, page = 1, limit = 10, sortBy = "id", sortDir = "DESC" } = options;

    const offset = (page - 1) * limit;
    const params = [];
    let where = "";

    if (q) {
      // search on ten_can_ho or khu_vuc
      where = "WHERE ten_can_ho LIKE ? OR khu_vuc LIKE ?";
      const like = `%${q}%`;
      params.push(like, like);
    }

    // protect sortBy to allowed fields
    const allowedSort = ["id", "ten_can_ho", "khu_vuc", "dien_tich", "gia", "created_at"];
    const col = allowedSort.includes(sortBy) ? sortBy : "id";
    const dir = sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const sqlCount = `SELECT COUNT(*) AS total FROM can_ho ${where}`;
    const sql = `SELECT * FROM can_ho ${where} ORDER BY ${col} ${dir} LIMIT ? OFFSET ?`;

    // query count then rows
    db.query(sqlCount, params, (err, countRes) => {
      if (err) return callback(err);
      const total = countRes[0].total || 0;
      params.push(Number(limit), Number(offset));
      db.query(sql, params, (err2, rows) => {
        if (err2) return callback(err2);
        callback(null, { total, page: Number(page), limit: Number(limit), rows });
      });
    });
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM can_ho WHERE id = ?", [id], callback);
  },

  create: (data, callback) => {
    db.query(
      "INSERT INTO can_ho (ten_can_ho, khu_vuc, dien_tich, gia, trang_thai) VALUES (?, ?, ?, ?, ?)",
      [data.ten_du_an,      
       data.dia_chi_du_an,
       data.ten_can_ho,
       data.khu_vuc,
       data.tang || 1,
       data.dien_tich,
       data.so_phong || 1,
       data.gia,
       data.trang_thai || "trong"],
       callback
    );
  },

  update: (id, data, callback) => {
    // allow partial update
    const fields = [];
    const params = [];
    if (data.ten_du_an !== undefined) { fields.push("ten_du_an = ?"); params.push(data.ten_du_an); }
    if (data.dia_chi_du_an !== undefined) { fields.push("dia_chi_du_an = ?"); params.push(data.dia_chi_du_an); }
    if (data.ten_can_ho !== undefined) { fields.push("ten_can_ho = ?"); params.push(data.ten_can_ho); }
    if (data.khu_vuc !== undefined) { fields.push("khu_vuc = ?"); params.push(data.khu_vuc); }
    if (data.tang !== undefined) { fields.push("tang = ?"); params.push(data.tang); }
    if (data.dien_tich !== undefined) { fields.push("dien_tich = ?"); params.push(data.dien_tich); }
    if (data.so_phong !== undefined) { fields.push("so_phong = ?"); params.push(data.so_phong); }
    if (data.gia !== undefined) { fields.push("gia = ?"); params.push(data.gia); }
    if (data.trang_thai !== undefined) { fields.push("trang_thai = ?"); params.push(data.trang_thai); }

    if (fields.length === 0) return callback(null, { affectedRows: 0 });

    const sql = `UPDATE can_ho SET ${fields.join(", ")} WHERE id = ?`;
    params.push(id);
    db.query(sql, params, callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM can_ho WHERE id = ?", [id], callback);
  }
};

module.exports = CanHo;
