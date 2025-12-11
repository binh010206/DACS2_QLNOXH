const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// --- SỬA LẠI DÒNG NÀY (Dùng ../ thay vì ../../) ---
const db = require("../config/db"); 

// Gọi file tính điểm (nếu có)
let calculateScore;
try {
    const scoring = require("../utils/scoring");
    calculateScore = scoring.calculateScore;
} catch (e) {
    calculateScore = () => 0; 
}

// Cấu hình Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// --- API NỘP HỒ SƠ ---
router.post("/nop", upload.array('files', 10), (req, res) => {
  try {
    const data = req.body;
    
    // Lấy tên file
    let filePaths = [];
    if (req.files && req.files.length > 0) {
        filePaths = req.files.map(f => f.filename);
    }
    const fileString = JSON.stringify(filePaths);

    // Tính điểm
    let diemUuTien = 0;
    if (calculateScore) diemUuTien = calculateScore(data);

    // Câu lệnh SQL (user_id = NULL)
    const sql = `
      INSERT INTO ho_so 
      (user_id, ho_ten, ngay_sinh, cccd, dien_thoai, email, dia_chi, thu_nhap, nghe_nghiep, so_nguoi_o, can_ho_id, file_dinh_kem, diem_uu_tien, trang_thai, created_at)
      VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    const params = [
      data.ho_ten, data.ngay_sinh, data.cccd, data.dien_thoai, data.email, 
      data.dia_chi, data.thu_nhap, data.nghe_nghiep, data.so_nguoi_o, 
      data.can_ho_id, fileString, diemUuTien
    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Lỗi SQL:", err);
        return res.status(500).json({ success: false, message: "Lỗi lưu database", error: err.message });
      }
      res.json({ success: true, message: "Nộp hồ sơ thành công!", id: result.insertId });
    });

  } catch (error) {
    console.error("Lỗi Server:", error);
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
});

module.exports = router;