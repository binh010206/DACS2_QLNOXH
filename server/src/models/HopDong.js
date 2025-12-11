// src/models/HopDong.js
const db = require("../config/db");

const HopDong = {
  create: (data, callback) => {
    db.query(
      `INSERT INTO hop_dong 
      (ho_so_id, user_id, can_ho_id, ngay_ky, ngay_bat_dau, ngay_ket_thuc, file_pdf, trang_thai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.ho_so_id,
        data.user_id,
        data.can_ho_id,
        data.ngay_ky,
        data.ngay_bat_dau,
        data.ngay_ket_thuc,
        data.file_pdf || null,
        data.trang_thai || "hieu_luc"
      ],
      callback
    );
  },

  getAll: (callback) => {
    db.query("SELECT * FROM hop_dong ORDER BY id DESC", callback);
  },

  getByUser: (user_id, callback) => {
    db.query("SELECT * FROM hop_dong WHERE user_id = ?", [user_id], callback);
  },

  getById: (id, callback) => {
    db.query("SELECT * FROM hop_dong WHERE id = ?", [id], callback);
  },

  update: (id, data, callback) => {
    const fields = [];
    const values = [];

    if (data.ngay_bat_dau) { fields.push("ngay_bat_dau = ?"); values.push(data.ngay_bat_dau); }
    if (data.ngay_ket_thuc) { fields.push("ngay_ket_thuc = ?"); values.push(data.ngay_ket_thuc); }
    if (data.file_pdf) { fields.push("file_pdf = ?"); values.push(data.file_pdf); }
    if (data.trang_thai) { fields.push("trang_thai = ?"); values.push(data.trang_thai); }

    if (fields.length === 0) return callback(null, { affectedRows: 0 });

    values.push(id);

    db.query(`UPDATE hop_dong SET ${fields.join(", ")} WHERE id = ?`, values, callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM hop_dong WHERE id = ?", [id], callback);
  }
};

module.exports = HopDong;
