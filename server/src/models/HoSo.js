// src/models/HoSo.js
const db = require("../config/db");

const HoSo = {
  // 1. Tạo hồ sơ (Cập nhật lưu thêm điểm ưu tiên & nghề nghiệp)
  create: (data, callback) => {
    const sql = `
      INSERT INTO ho_so 
      (user_id, can_ho_id, ho_ten, cccd, ngay_sinh, dia_chi, thu_nhap, nghe_nghiep, so_nguoi_o, diem_uu_tien, ghi_chu, trang_thai, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    db.query(sql, [
      data.user_id,
      data.can_ho_id,
      data.ho_ten,
      data.cccd,
      data.ngay_sinh,
      data.dia_chi,
      data.thu_nhap,
      data.nghe_nghiep, // Mới thêm
      data.so_nguoi_o,  // Mới thêm
      data.diem_uu_tien,// Mới thêm
      data.ghi_chu
    ], callback);
  },

  // 2. Lấy tất cả (Dành cho Admin - Có phân trang & Sắp xếp theo điểm)
  getAll: (page = 1, limit = 10, callback) => {
    const offset = (page - 1) * limit;
    
    // Bước 1: Đếm tổng số bản ghi
    db.query("SELECT COUNT(*) as total FROM ho_so", (err, countRes) => {
        if(err) return callback(err);
        const total = countRes[0].total;

        // Bước 2: Lấy dữ liệu theo trang
        // Sắp xếp: Điểm ưu tiên cao lên đầu, nếu bằng điểm thì ai nộp trước (created_at bé hơn) lên đầu
        const sql = `
          SELECT h.*, u.name AS user_name, c.ten_can_ho 
          FROM ho_so h
          LEFT JOIN users u ON h.user_id = u.id
          LEFT JOIN can_ho c ON h.can_ho_id = c.id
          ORDER BY h.diem_uu_tien DESC, h.created_at ASC
          LIMIT ? OFFSET ?
        `;
        
        db.query(sql, [parseInt(limit), parseInt(offset)], (err2, rows) => {
            if(err2) return callback(err2);
            // Trả về dữ liệu kèm thông tin phân trang
            callback(null, { 
                data: rows, 
                pagination: { 
                    page: parseInt(page), 
                    limit: parseInt(limit), 
                    total, 
                    totalPages: Math.ceil(total/limit) 
                } 
            });
        });
    });
  },

  // 3. Lấy hồ sơ của User đang đăng nhập
  getByUser: (user_id, callback) => {
    db.query(`
      SELECT h.*, c.ten_can_ho 
      FROM ho_so h 
      LEFT JOIN can_ho c ON h.can_ho_id = c.id 
      WHERE h.user_id = ? 
      ORDER BY h.created_at DESC
    `, [user_id], callback);
  },

  // 4. Lấy chi tiết 1 hồ sơ
  getById: (id, callback) => {
    db.query(`
      SELECT h.*, u.name AS user_name, c.ten_can_ho 
      FROM ho_so h
      LEFT JOIN users u ON h.user_id = u.id
      LEFT JOIN can_ho c ON h.can_ho_id = c.id
      WHERE h.id = ?
    `, [id], callback);
  },

  // 5. Duyệt hoặc Từ chối hồ sơ
  setStatus: (id, status, reviewer_id, note, callback) => {
    db.query(`
      UPDATE ho_so 
      SET trang_thai = ?, reviewer_id = ?, reviewed_at = NOW(), note = ? 
      WHERE id = ?
    `, [status, reviewer_id || null, note || null, id], callback);
  },

  // 6. Xóa hồ sơ
  delete: (id, callback) => {
    db.query("DELETE FROM ho_so WHERE id = ?", [id], callback);
  }
};

module.exports = HoSo;