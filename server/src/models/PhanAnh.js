// src/models/PhanAnh.js
const db = require("../config/db");

const PhanAnh = {
  // Tạo phản ánh mới
  create: (data, callback) => {
    const sql = `
      INSERT INTO phan_anh (user_id, tieu_de, noi_dung, trang_thai, created_at)
      VALUES (?, ?, ?, 'cho_xu_ly', NOW())
    `;
    db.query(sql, [data.user_id, data.tieu_de, data.noi_dung], callback);
  },

  // Admin lấy tất cả phản ánh
  getAll: (callback) => {
    const sql = `
      SELECT pa.*, u.name as nguoi_gui, u.email 
      FROM phan_anh pa
      JOIN users u ON pa.user_id = u.id
      ORDER BY pa.created_at DESC
    `;
    db.query(sql, callback);
  },

  // User xem lịch sử phản ánh của mình
  getByUser: (userId, callback) => {
    const sql = "SELECT * FROM phan_anh WHERE user_id = ? ORDER BY created_at DESC";
    db.query(sql, [userId], callback);
  },

  // Admin cập nhật trạng thái (VD: Đang xử lý, Đã xong)
  updateStatus: (id, status, phan_hoi, callback) => {
    const sql = `
      UPDATE phan_anh 
      SET trang_thai = ?, phan_hoi_admin = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    db.query(sql, [status, phan_hoi || '', id], callback);
  },
  
  delete: (id, callback) => {
      db.query("DELETE FROM phan_anh WHERE id = ?", [id], callback);
  }
};

module.exports = PhanAnh;