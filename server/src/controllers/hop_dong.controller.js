const db = require("../config/db");
const statuses = require("../constants/status");
const HoSo = require("../models/HoSo");

const HopDongTable = "hop_dong";
const CanHoTable = "can_ho";
const ThongBaoTable = "thong_bao";

/* ===================================================
   1) TẠO HỢP ĐỒNG (ĐÃ CÓ – EM CLEAN LẠI)
=================================================== */
exports.create = (req, res) => {
  const { ho_so_id, ngay_ky, ngay_bat_dau, ngay_ket_thuc, file_pdf } = req.body;

  if (!ho_so_id || !ngay_ky || !ngay_bat_dau || !ngay_ket_thuc)
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

  db.query("SELECT id FROM hop_dong WHERE ho_so_id = ?", [ho_so_id], (errCheck, exist) => {
    if (errCheck) return res.status(500).json({ message: "Lỗi DB", errCheck });
    if (exist.length > 0) return res.status(400).json({ message: "Hồ sơ này đã có hợp đồng." });

    // Lấy hồ sơ trước
    HoSo.getById(ho_so_id, (err, rows) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      if (!rows.length) return res.status(404).json({ message: "Hồ sơ không tồn tại" });

      const hoSo = rows[0];

      if (hoSo.trang_thai !== statuses.HO_SO.APPROVED)
        return res.status(400).json({ message: "Hồ sơ chưa được duyệt" });

      // Transaction
      db.getConnection((connErr, connection) => {
        if (connErr) return res.status(500).json({ message: "Lỗi kết nối DB", err: connErr });

        connection.beginTransaction((txErr) => {
          if (txErr) return res.status(500).json({ message: "Lỗi transaction", err: txErr });

          const insertSql = `
            INSERT INTO hop_dong
            (ho_so_id, user_id, can_ho_id, ngay_ky, ngay_bat_dau, ngay_ket_thuc, file_pdf, trang_thai, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `;

          const params = [
            ho_so_id,
            hoSo.user_id,
            hoSo.can_ho_id,
            ngay_ky,
            ngay_bat_dau,
            ngay_ket_thuc,
            file_pdf || null,
            statuses.HOP_DONG.HIEU_LUC,
          ];

          connection.query(insertSql, params, (insErr, insRes) => {
            if (insErr)
              return connection.rollback(() =>
                res.status(500).json({ message: "Lỗi tạo hợp đồng", err: insErr })
              );

            // Cập nhật trạng thái căn hộ
            connection.query(
              `UPDATE ${CanHoTable} SET trang_thai = ? WHERE id = ?`,
              [statuses.CAN_HO.DA_THUE, hoSo.can_ho_id],
              (updErr) => {
                if (updErr)
                  return connection.rollback(() =>
                    res.status(500).json({ message: "Lỗi cập nhật căn hộ", err: updErr })
                  );

                // Thông báo
                connection.query(
                  `INSERT INTO ${ThongBaoTable}(user_id, noi_dung, trang_thai, created_at)
                   VALUES (?, ?, ?, NOW())`,
                  [
                    hoSo.user_id,
                    `Hợp đồng cho hồ sơ #${ho_so_id} đã được tạo.`,
                    statuses.THONG_BAO.UNREAD,
                  ],
                  (tbErr) => {
                    if (tbErr)
                      return connection.rollback(() =>
                        res.status(500).json({ message: "Lỗi thông báo", err: tbErr })
                      );

                    connection.commit(() => {
                      connection.release();
                      res.status(201).json({
                        success: true,
                        message: "Tạo hợp đồng thành công",
                        id: insRes.insertId,
                      });
                    });
                  }
                );
              }
            );
          });
        });
      });
    });
  });
};

/* ===================================================
   2) LẤY DANH SÁCH HỢP ĐỒNG (ADMIN)
=================================================== */
exports.getAll = (req, res) => {
  db.query(`SELECT * FROM ${HopDongTable} ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, data: rows });
  });
};

/* ===================================================
   3) USER XEM HỢP ĐỒNG CỦA MÌNH
=================================================== */
exports.getMy = (req, res) => {
  const user_id = req.user.id;

  db.query(`SELECT * FROM ${HopDongTable} WHERE user_id = ?`, [user_id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    return res.json({ success: true, data: rows });
  });
};

/* ===================================================
   4) CẬP NHẬT HỢP ĐỒNG (ADMIN)
=================================================== */
exports.update = (req, res) => {
  const id = req.params.id;
  const { ngay_bat_dau, ngay_ket_thuc, trang_thai } = req.body;

  db.query(
    `UPDATE ${HopDongTable}
     SET ngay_bat_dau = ?, ngay_ket_thuc = ?, trang_thai = ?
     WHERE id = ?`,
    [ngay_bat_dau, ngay_ket_thuc, trang_thai, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Không tìm thấy hợp đồng" });

      res.json({ success: true, message: "Cập nhật thành công" });
    }
  );
};

/* ===================================================
   5) XÓA HỢP ĐỒNG (ADMIN)
=================================================== */
exports.delete = (req, res) => {
  const id = req.params.id;

  db.query(`DELETE FROM ${HopDongTable} WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Lỗi DB", err });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Hợp đồng không tồn tại" });

    res.json({ success: true, message: "Xóa hợp đồng thành công" });
  });
};

/* ===================================================
   6) USER UPLOAD FILE PDF (cập nhật file_pdf)
=================================================== */
exports.userUpload = (req, res) => {
  const user_id = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "Không có file" });

  db.query(
    `UPDATE ${HopDongTable} SET file_pdf = ? WHERE user_id = ?`,
    [file.filename, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Lỗi DB", err });

      return res.json({
        success: true,
        message: "Tải file thành công",
        file: file.filename,
      });
    }
  );
};
