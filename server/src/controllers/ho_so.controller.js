// src/controllers/ho_so.controller.js
const db = require("../config/db");
const HoSo = require("../models/HoSo");
const CanHo = require("../models/CanHo");
const statuses = require("../constants/status");
const { calculateScore } = require("../utils/scoring"); // Import hàm tính điểm

const CanHoTable = "can_ho";
const ThongBaoTable = "thong_bao";

/* =====================================
   1) TẠO HỒ SƠ + TỰ ĐỘNG CHẤM ĐIỂM
===================================== */
exports.create = (req, res) => {
  const { can_ho_id, ghi_chu, nghe_nghiep, thu_nhap, so_nguoi_o, ho_ten, cccd, ngay_sinh, dia_chi } = req.body;
  const user_id = req.user.id;

  if (!can_ho_id) return res.status(400).json({ message: "Thiếu mã căn hộ" });

  // --- TÍNH ĐIỂM TỰ ĐỘNG ---
  // Hệ thống tự đánh giá mức độ ưu tiên dựa trên dữ liệu nhập
  const diemUuTien = calculateScore(req.body); 
  // -------------------------

  const sql = `
    INSERT INTO ho_so 
    (user_id, can_ho_id, ho_ten, cccd, ngay_sinh, dia_chi, thu_nhap, nghe_nghiep, so_nguoi_o, diem_uu_tien, ghi_chu, trang_thai, ngay_tao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  // Lưu ý: Status phải khớp với file constants (pending)
  const params = [
      user_id, can_ho_id, ho_ten, cccd, ngay_sinh, dia_chi, 
      thu_nhap, nghe_nghiep, so_nguoi_o || 1, diemUuTien, 
      ghi_chu || null, statuses.HO_SO.PENDING
  ];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi tạo hồ sơ", err });

    return res.status(201).json({
      success: true,
      message: "Nộp hồ sơ thành công",
      score: diemUuTien, // Trả về điểm cho user biết luôn
      id: result.insertId,
    });
  });
};

/* =====================================
   2) LẤY HỒ SƠ CỦA USER ĐANG LOGIN
===================================== */
exports.getMyHoSo = (req, res) => {
  const user_id = req.user.id;
  HoSo.getByUser(user_id, (err, rows) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      return res.json({ success: true, data: rows });
  });
};

/* =====================================
   3) ADMIN – XEM DANH SÁCH (SẮP XẾP THEO ĐIỂM)
===================================== */
exports.list = (req, res) => {
  // Query tay ở đây để sort theo điểm ưu tiên
  const sql = `
      SELECT h.*, u.name AS user_name, c.ten_can_ho 
      FROM ho_so h
      LEFT JOIN users u ON h.user_id = u.id
      LEFT JOIN can_ho c ON h.can_ho_id = c.id
      ORDER BY h.diem_uu_tien DESC, h.ngay_tao ASC
  `;
  // Logic: Ai điểm cao hơn lên đầu, bằng điểm thì ai nộp trước lên đầu
  
  db.query(sql, (err, rows) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      return res.json({ success: true, data: rows });
  });
};

/* =====================================
   4) LẤY CHI TIẾT 1 HỒ SƠ
===================================== */
exports.getOne = (req, res) => {
  const id = req.params.id;
  HoSo.getById(id, (err, rows) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      if (!rows || rows.length === 0)
        return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

      return res.json({ success: true, data: rows[0] });
  });
};

/* =====================================
   5) DUYỆT HỒ SƠ (TRANSACTION)
===================================== */
exports.approveHoSo = (req, res) => {
  const hoSoId = req.params.id;
  const reviewerId = req.user.id;
  const note = req.body.note || null;

  HoSo.getById(hoSoId, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy hồ sơ" });

    const hoSo = rows[0];

    db.getConnection((connErr, connection) => {
      if (connErr) return res.status(500).json({ message: "Lỗi kết nối", err: connErr });

      connection.beginTransaction((txErr) => {
        if (txErr) { connection.release(); return res.status(500).json({ message: "Lỗi tx", err: txErr }); }

        // 1. Lock & Check Căn hộ
        connection.query(`SELECT * FROM ${CanHoTable} WHERE id = ? FOR UPDATE`, [hoSo.can_ho_id], (cErr, cRows) => {
            if (cErr || !cRows.length || cRows[0].trang_thai !== statuses.CAN_HO.TRONG) {
                return connection.rollback(() => {
                    connection.release();
                    res.status(400).json({ message: "Căn hộ không khả dụng" });
                });
            }

            // 2. Update Hồ sơ -> Approved
            const sqlApprove = `UPDATE ho_so SET trang_thai = ?, reviewer_id = ?, note = ? WHERE id = ?`;
            connection.query(sqlApprove, [statuses.HO_SO.APPROVED, reviewerId, note, hoSoId], (updHsErr) => {
                if (updHsErr) return connection.rollback(() => { connection.release(); res.status(500).json({message: "Lỗi update hồ sơ"}); });

                // 3. Update Căn hộ -> Chờ ký HĐ
                const sqlCanHo = `UPDATE ${CanHoTable} SET trang_thai = ? WHERE id = ?`;
                connection.query(sqlCanHo, [statuses.CAN_HO.DANG_CHO_KY_HD, hoSo.can_ho_id], (updChErr) => {
                    if (updChErr) return connection.rollback(() => { connection.release(); res.status(500).json({message: "Lỗi update căn hộ"}); });

                    // 4. Tạo thông báo
                    const sqlTB = `INSERT INTO ${ThongBaoTable} (user_id, noi_dung, trang_thai, created_at) VALUES (?, ?, 'unread', NOW())`;
                    connection.query(sqlTB, [hoSo.user_id, `Hồ sơ #${hoSoId} đã được duyệt!`], (tbErr) => {
                        connection.commit(() => {
                            connection.release();
                            res.json({ success: true, message: "Duyệt hồ sơ thành công!" });
                        });
                    });
                });
            });
        });
      });
    });
  });
};

/* =====================================
   6) TỪ CHỐI HỒ SƠ
===================================== */
exports.rejectHoSo = (req, res) => {
  const hoSoId = req.params.id;
  const reviewerId = req.user.id;
  const note = req.body.note || null;

  HoSo.getById(hoSoId, (err, rows) => {
    if (!rows.length) return res.status(404).json({ message: "Không tìm thấy" });
    const hoSo = rows[0];

    db.getConnection((connErr, connection) => {
        connection.beginTransaction((txErr) => {
            // 1. Update Hồ sơ -> Rejected
            const sqlReject = `UPDATE ho_so SET trang_thai = ?, reviewer_id = ?, note = ? WHERE id = ?`;
            connection.query(sqlReject, [statuses.HO_SO.REJECTED, reviewerId, note, hoSoId], (err1) => {
                if(err1) return connection.rollback(() => { connection.release(); res.status(500).send("Lỗi update hồ sơ"); });

                // 2. Trả căn hộ -> Trong (nếu cần)
                const sqlCanHo = `UPDATE ${CanHoTable} SET trang_thai = ? WHERE id = ?`;
                connection.query(sqlCanHo, [statuses.CAN_HO.TRONG, hoSo.can_ho_id], (err2) => {
                    
                    // 3. Thông báo
                    const sqlTB = `INSERT INTO ${ThongBaoTable} (user_id, noi_dung, trang_thai, created_at) VALUES (?, ?, 'unread', NOW())`;
                    connection.query(sqlTB, [hoSo.user_id, `Hồ sơ #${hoSoId} bị từ chối: ${note}`], () => {
                        connection.commit(() => {
                            connection.release();
                            res.json({ success: true, message: "Đã từ chối hồ sơ" });
                        });
                    });
                });
            });
        });
    });
  });
};

/* =====================================
   7) XÓA HỒ SƠ (Fix lỗi Async)
===================================== */
exports.deleteHoSo = (req, res) => {
  const { id } = req.params;

  HoSo.getById(id, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Hồ sơ không tồn tại" });

    const hoSo = rows[0];
    const allowDeleteStatus = [statuses.HO_SO.PENDING, statuses.HO_SO.REJECTED]; 
    if (!allowDeleteStatus.includes(hoSo.trang_thai)) {
      return res.status(400).json({ message: "Không thể xóa hồ sơ đã duyệt." });
    }

    HoSo.delete(id, (delErr) => {
      if (delErr) return res.status(500).json({ message: "Lỗi xóa", err: delErr });

      // Trả trạng thái căn hộ
      if (hoSo.can_ho_id) {
         CanHo.update(hoSo.can_ho_id, { trang_thai: statuses.CAN_HO.TRONG }, () => {
             console.log(`Căn hộ ${hoSo.can_ho_id} đã free`);
         });
      }
      return res.json({ success: true, message: "Xóa hồ sơ thành công", id });
    });
  });
};

// src/controllers/ho_so.controller.js

// src/controllers/ho_so.controller.js - Thay thế hàm list cũ
exports.list = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  HoSo.getAll(page, limit, (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      // result lúc này đã chứa { data: [...], pagination: {...} }
      return res.json({ success: true, ...result }); 
  });
};