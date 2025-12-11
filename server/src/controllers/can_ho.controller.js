// src/controllers/can_ho.controller.js
const { validationResult } = require("express-validator");
const CanHo = require("../models/CanHo");
const db = require("../config/db");
const statuses = require("../constants/status");

const sendValidation = (res, req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return null;
};

exports.list = (req, res) => {
  const q = req.query.q || "";
  const page = parseInt(req.query.page || "1", 10);
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
  const sortBy = req.query.sortBy || "id";
  const sortDir = req.query.sortDir || "DESC";

  CanHo.getAll({ q, page, limit, sortBy, sortDir }, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err: err.message });
    res.json({ success: true, data: result });
  });
};

exports.get = (req, res) => {
  CanHo.getById(req.params.id, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi server", err });
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Không tìm thấy căn hộ" });
    res.json({ success: true, data: rows[0] });
  });
};

exports.create = (req, res) => {
  if (sendValidation(res, req)) return;

  CanHo.create(req.body, (err, result) => {
    if (err) return res.status(500).json({ message: "Thêm thất bại", err: err.message });
    res.status(201).json({ success: true, message: "Thêm thành công", id: result.insertId });
  });
};

exports.update = (req, res) => {
  if (sendValidation(res, req)) return;

  CanHo.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ message: "Cập nhật thất bại", err: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy căn hộ" });
    res.json({ success: true, message: "Cập nhật thành công" });
  });
};

exports.remove = (req, res) => {
  CanHo.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: "Xóa thất bại", err: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy căn hộ" });
    res.json({ success: true, message: "Xóa thành công" });
  });
};

exports.getAll = (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS total FROM can_ho", (errCount, countRows) => {
    if (errCount) return res.status(500).json({ message: "Lỗi DB", errCount });

    const total = countRows[0].total;

    db.query(
      "SELECT * FROM can_ho ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Lỗi DB", err });

        return res.json({
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          data: rows
        });
      }
    );
  });
};

// -----------------------
// Tìm kiếm nâng cao
// GET /api/can-ho/search
// query params: minArea, maxArea, minPrice, maxPrice, khu_vuc, trang_thai, page, limit
exports.searchAdvanced = (req, res) => {
  const { minArea, maxArea, minPrice, maxPrice, khu_vuc, trang_thai } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const params = [];
  const where = [];

  if (minArea) { where.push("dien_tich >= ?"); params.push(minArea); }
  if (maxArea) { where.push("dien_tich <= ?"); params.push(maxArea); }
  if (minPrice) { where.push("gia >= ?"); params.push(minPrice); }
  if (maxPrice) { where.push("gia <= ?"); params.push(maxPrice); }
  if (khu_vuc) { where.push("khu_vuc = ?"); params.push(khu_vuc); }
  if (trang_thai) { where.push("trang_thai = ?"); params.push(trang_thai); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  db.query(`SELECT COUNT(*) AS total FROM can_ho ${whereSql}`, params, (errCount, countRows) => {
    if (errCount) return res.status(500).json({ message: "Lỗi DB", err: errCount });

    const total = countRows[0].total || 0;
    const paramsWithLimit = params.concat([limit, offset]);

    db.query(`SELECT * FROM can_ho ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`, paramsWithLimit, (err, rows) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      return res.json({
        success: true,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: rows
      });
    });
  });
};

/* ====================================================
   GỢI Ý CĂN HỘ (Dựa trên Thu nhập & Số người) - BONUS
   GET /api/can-ho/recommend?thu_nhap=5000000&so_nguoi=3
==================================================== */
exports.recommend = (req, res) => {
  const thuNhap = parseInt(req.query.thu_nhap) || 0;
  const soNguoi = parseInt(req.query.so_nguoi) || 1;

  // LOGIC GỢI Ý (Luật đơn giản):
  // 1. Giá thuê nên < 40% thu nhập để đảm bảo sống được.
  // 2. Diện tích nên > 15m2/người (tiêu chuẩn không gian).
  
  const maxPrice = thuNhap * 0.4; 
  const minArea = soNguoi * 15;

  // Query tìm các căn thỏa mãn và còn TRỐNG
  // Sắp xếp ưu tiên: Giá rẻ nhất lên đầu
  const sql = `
    SELECT * FROM can_ho 
    WHERE gia <= ? 
      AND dien_tich >= ? 
      AND trang_thai = 'trong'
    ORDER BY gia ASC
    LIMIT 5
  `;

  db.query(sql, [maxPrice, minArea], (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi hệ thống gợi ý", err });

    // Trả về kết quả kèm lời nhắn phân tích
    return res.json({
      success: true,
      message: `Dựa trên thu nhập ${thuNhap.toLocaleString()}đ và ${soNguoi} người, hệ thống tìm thấy ${rows.length} căn hộ phù hợp (Giá <= ${maxPrice.toLocaleString()}đ, DT >= ${minArea}m2).`,
      data: rows
    });
  });
};