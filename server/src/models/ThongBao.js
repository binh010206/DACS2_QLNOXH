// src/models/ThongBao.js
const db = require("../config/db");

const ThongBao = {
  // 1. Tạo thông báo
  create: (data, callback) => {
    const sql = `
      INSERT INTO thong_bao (user_id, tieu_de, noi_dung, loai, trang_thai, created_at)
      VALUES (?, ?, ?, ?, 'unread', NOW())
    `;
    // loai: 'he_thong', 'admin', 'nhac_nho'
    db.query(sql, [
      data.user_id, 
      data.tieu_de, 
      data.noi_dung, 
      data.loai || 'he_thong'
    ], callback);
  },

  // 2. Lấy thông báo của 1 user (CÓ PHÂN TRANG)
  // Không dùng 'static', dùng hàm mũi tên hoặc function thường
  getByUser: (userId, page = 1, limit = 10, callback) => {
    const offset = (page - 1) * limit;
    
    // Bước 1: Đếm tổng số
    db.query("SELECT COUNT(*) as total FROM thong_bao WHERE user_id = ?", [userId], (err, cRes) => {
        if(err) return callback(err);
        const total = cRes[0].total;

        // Bước 2: Lấy dữ liệu
        db.query(
            "SELECT * FROM thong_bao WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
            [userId, parseInt(limit), parseInt(offset)],
            (err2, rows) => {
                if(err2) return callback(err2);
                
                // Trả về dữ liệu chuẩn
                callback(null, { 
                    data: rows, 
                    pagination: { 
                        page: parseInt(page), 
                        limit: parseInt(limit), 
                        total,
                        totalPages: Math.ceil(total / limit)
                    } 
                });
            }
        );
    });
  },

  // 3. Đánh dấu đã đọc
  markRead: (id, callback) => {
    db.query("UPDATE thong_bao SET trang_thai = 'read' WHERE id = ?", [id], callback);
  },

  // 4. Đếm số thông báo chưa đọc
  countUnread: (userId, callback) => {
    const sql = "SELECT COUNT(*) as total FROM thong_bao WHERE user_id = ? AND trang_thai = 'unread'";
    db.query(sql, [userId], callback);
  },
  
  // 5. Gửi thông báo cho TOÀN BỘ Cư dân (Broadcast)
  broadcast: (tieu_de, noi_dung, callback) => {
    const sqlGetUsers = "SELECT id FROM users WHERE role = 'user'";
    
    db.query(sqlGetUsers, (err, users) => {
        if (err) return callback(err);
        if (users.length === 0) return callback(null, { message: "Không có cư dân nào" });

        const values = users.map(u => [u.id, tieu_de, noi_dung, 'admin', 'unread', new Date()]);
        
        const sqlInsert = "INSERT INTO thong_bao (user_id, tieu_de, noi_dung, loai, trang_thai, created_at) VALUES ?";
        db.query(sqlInsert, [values], callback);
    });
  }
};

module.exports = ThongBao;