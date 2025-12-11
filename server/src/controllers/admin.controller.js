// src/controllers/admin.controller.js
const db = require("../config/db");
const HoSo = require("../models/HoSo");
const ExcelJS = require('exceljs'); // Thư viện xuất Excel

exports.thongKe = (req, res) => {
  const result = {};

  // Query gom nhóm để tối ưu performance
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM can_ho) as totalCanHo,
      (SELECT COUNT(*) FROM can_ho WHERE trang_thai = 'da_thue') as canHoDaThue,
      (SELECT COUNT(*) FROM can_ho WHERE trang_thai = 'trong') as canHoTrong,
      (SELECT COUNT(*) FROM ho_so WHERE trang_thai = 'pending') as hoSoChoDuyet,
      (SELECT COUNT(*) FROM hop_dong WHERE trang_thai = 'hieu_luc') as hopDongHieuLuc
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    result.summary = rows[0];
    return res.json({ success: true, data: result });
  });
};

/* ==================================================
   XUẤT BÁO CÁO DANH SÁCH HỒ SƠ RA EXCEL (BONUS)
================================================== */
exports.exportExcelHoSo = (req, res) => {
    // Gọi hàm list của HoSo (hoặc query trực tiếp ở đây)
    const sql = `
      SELECT h.*, u.name AS user_name, c.ten_can_ho 
      FROM ho_so h
      LEFT JOIN users u ON h.user_id = u.id
      LEFT JOIN can_ho c ON h.can_ho_id = c.id
      ORDER BY h.diem_uu_tien DESC
    `;

    db.query(sql, async (err, rows) => {
        if(err) return res.status(500).json({message: "Lỗi DB"});

        // 1. Khởi tạo Workbook
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Danh Sách Hồ Sơ');

        // 2. Định nghĩa cột
        sheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Họ Tên', key: 'ho_ten', width: 25 },
            { header: 'Căn Hộ', key: 'ten_can_ho', width: 15 },
            { header: 'Nghề Nghiệp', key: 'nghe_nghiep', width: 20 },
            { header: 'Thu Nhập', key: 'thu_nhap', width: 15 },
            { header: 'Số Người', key: 'so_nguoi_o', width: 10 },
            { header: 'Điểm Ưu Tiên', key: 'diem_uu_tien', width: 15 }, // Điểm nhấn
            { header: 'Trạng Thái', key: 'trang_thai', width: 15 },
            { header: 'Ngày Nộp', key: 'ngay_tao', width: 20 },
        ];

        // 3. Thêm dữ liệu
        rows.forEach(row => {
            sheet.addRow({
                id: row.id,
                ho_ten: row.ho_ten || row.user_name,
                ten_can_ho: row.ten_can_ho,
                nghe_nghiep: row.nghe_nghiep,
                thu_nhap: row.thu_nhap,
                so_nguoi_o: row.so_nguoi_o,
                diem_uu_tien: row.diem_uu_tien,
                trang_thai: row.trang_thai,
                ngay_tao: row.ngay_tao
            });
        });

        // 4. Style đơn giản (Bold header)
        sheet.getRow(1).font = { bold: true };

        // 5. Trả về file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=BaoCao_XetDuyet_NOXH.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    });
};