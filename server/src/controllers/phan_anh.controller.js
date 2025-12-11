// src/controllers/phan_anh.controller.js
const PhanAnh = require("../models/PhanAnh");
const ThongBao = require("../models/ThongBao"); // Để gửi thông báo lại cho user khi xử lý xong

// User gửi phản ánh
exports.create = (req, res) => {
  const { tieu_de, noi_dung } = req.body;
  const user_id = req.user.id;

  if (!tieu_de || !noi_dung) return res.status(400).json({ message: "Thiếu thông tin" });

  PhanAnh.create({ user_id, tieu_de, noi_dung }, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.status(201).json({ success: true, message: "Đã gửi phản ánh thành công" });
  });
};

// Admin xem danh sách
exports.listAll = (req, res) => {
  PhanAnh.getAll((err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, data: rows });
  });
};

// User xem của mình
exports.getMyRequests = (req, res) => {
  const user_id = req.user.id;
  PhanAnh.getByUser(user_id, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, data: rows });
  });
};

// Admin xử lý phản ánh
exports.updateStatus = (req, res) => {
  const id = req.params.id;
  const { trang_thai, phan_hoi } = req.body; 
  // trang_thai: 'dang_xu_ly', 'da_xong'

  PhanAnh.updateStatus(id, trang_thai, phan_hoi, (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });

    // Tự động tạo thông báo gửi về cho User
    // Cần lấy user_id của phản ánh này (Ở đây làm tắt, thực tế nên query lấy user_id trước)
    // Nhưng để đơn giản, ta chỉ trả về kết quả
    return res.json({ success: true, message: "Đã cập nhật trạng thái phản ánh" });
  });
};

exports.delete = (req, res) => {
    const id = req.params.id;
    PhanAnh.delete(id, (err) => {
        if(err) return res.status(500).json({message: "Lỗi DB", err});
        return res.json({success: true, message: "Đã xóa phản ánh"});
    });
}