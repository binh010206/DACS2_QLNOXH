const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. LẤY DANH SÁCH & TÌM KIẾM
router.get("/", (req, res) => {
    // Nhận tham số từ Frontend gửi lên
    const { keyword, khu_vuc, trang_thai } = req.query;
    
    let sql = "SELECT * FROM can_ho WHERE 1=1"; // 1=1 để dễ nối chuỗi AND
    const params = [];

    // Logic tìm kiếm
    if (keyword) {
        sql += " AND (ten_can_ho LIKE ? OR ten_du_an LIKE ?)";
        params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (khu_vuc) {
        sql += " AND khu_vuc LIKE ?";
        params.push(`%${khu_vuc}%`);
    }
    if (trang_thai) {
        sql += " AND trang_thai = ?";
        params.push(trang_thai);
    }

    sql += " ORDER BY created_at DESC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json({ success: false, message: "Lỗi DB" });
        }
        res.json({ success: true, data: results });
    });
});

// 2. THÊM MỚI (Chỉ dùng các cột có trong DB của bạn)
router.post("/", (req, res) => {
    const { ten_du_an, ten_can_ho, dia_chi_du_an, hinh_anh, khu_vuc, tang, dien_tich, so_phong, gia, trang_thai } = req.body;
    
    const sql = `
        INSERT INTO can_ho 
        (ten_du_an, ten_can_ho, dia_chi_du_an, hinh_anh, khu_vuc, tang, dien_tich, so_phong, gia, trang_thai) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [
        ten_du_an, ten_can_ho, dia_chi_du_an, hinh_anh, khu_vuc, 
        tang || 1, dien_tich || 0, so_phong || 1, gia || 0, trang_thai || 'trong'
    ], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Lỗi thêm mới" });
        }
        res.json({ success: true, message: "Thêm thành công!" });
    });
});

// 3. CẬP NHẬT
router.put("/:id", (req, res) => {
    const { ten_du_an, ten_can_ho, dia_chi_du_an, hinh_anh, khu_vuc, tang, dien_tich, so_phong, gia, trang_thai } = req.body;
    
    const sql = `
        UPDATE can_ho SET 
        ten_du_an=?, ten_can_ho=?, dia_chi_du_an=?, hinh_anh=?, khu_vuc=?, tang=?, dien_tich=?, so_phong=?, gia=?, trang_thai=?
        WHERE id = ?
    `;
    
    db.query(sql, [
        ten_du_an, ten_can_ho, dia_chi_du_an, hinh_anh, khu_vuc, 
        tang, dien_tich, so_phong, gia, trang_thai, req.params.id
    ], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi cập nhật" });
        res.json({ success: true, message: "Cập nhật thành công!" });
    });
});

// 4. XÓA
router.delete("/:id", (req, res) => {
    db.query("DELETE FROM can_ho WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Không thể xóa" });
        res.json({ success: true, message: "Đã xóa!" });
    });
});

module.exports = router;