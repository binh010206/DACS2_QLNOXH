const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// --- CẤU HÌNH EMAIL (GIỮ NGUYÊN) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'binhcs2006@gmail.com', pass: 'iktq ozul efpj zptu' }
});

const removeVietnameseTones = (str) => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/\s+/g, '');
    return str;
}
const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// 1. THỐNG KÊ DASHBOARD (FULL OPTIONS CHO ĐỒ ÁN)
router.get("/thong-ke", async (req, res) => {
    try {
        const stats = {};
        
        // A. SỐ LIỆU TỔNG QUAN (4 CARD)
        const [canHo] = await db.promise().query("SELECT COUNT(*) as total, SUM(CASE WHEN trang_thai='trong' THEN 1 ELSE 0 END) as empty FROM can_ho");
        stats.totalCanHo = canHo[0].total;
        stats.canHoTrong = canHo[0].empty;
        
        const [hoSo] = await db.promise().query("SELECT COUNT(*) as pending FROM ho_so WHERE trang_thai = 'pending'");
        stats.hoSoChoDuyet = hoSo[0].pending;

        const [users] = await db.promise().query("SELECT COUNT(*) as total FROM users WHERE role = 'user'");
        stats.totalCuDan = users[0].total;

        // B. DỮ LIỆU BIỂU ĐỒ TRÒN (Tỉ lệ hồ sơ)
        const [pieData] = await db.promise().query("SELECT trang_thai, COUNT(*) as count FROM ho_so GROUP BY trang_thai");
        stats.pieChart = pieData; // Trả về dạng: [{trang_thai: 'approved', count: 5}, ...]

        // C. DỮ LIỆU BIỂU ĐỒ CỘT (Hợp đồng theo tháng trong năm nay)
        const [barData] = await db.promise().query(`
            SELECT MONTH(ngay_ky) as month, COUNT(*) as count 
            FROM hop_dong 
            WHERE YEAR(ngay_ky) = YEAR(NOW()) 
            GROUP BY MONTH(ngay_ky)
            ORDER BY month ASC
        `);
        // Chuẩn hóa dữ liệu cho đủ 12 tháng (Tháng nào ko có thì = 0)
        const fullYearData = Array.from({ length: 12 }, (_, i) => {
            const m = i + 1;
            const found = barData.find(d => d.month === m);
            return found ? found.count : 0;
        });
        stats.barChart = fullYearData;

        // D. HOẠT ĐỘNG GẦN ĐÂY
        const sqlRecent = `
            (SELECT id, ho_ten as title, 'application' as type, created_at FROM ho_so ORDER BY created_at DESC LIMIT 5)
            UNION
            (SELECT hd.id, u.name as title, 'contract' as type, hd.ngay_ky as created_at 
             FROM hop_dong hd JOIN users u ON hd.user_id = u.id 
             ORDER BY hd.ngay_ky DESC LIMIT 5)
            ORDER BY created_at DESC LIMIT 5
        `;
        const [recentActivities] = await db.promise().query(sqlRecent);
        stats.recent = recentActivities;

        res.json({ success: true, data: { summary: stats } });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. LẤY DANH SÁCH HỒ SƠ (GIỮ NGUYÊN)
router.get("/ho-so", (req, res) => {
    const sql = `SELECT h.*, c.ten_can_ho, c.gia, c.dien_tich, c.dia_chi_du_an FROM ho_so h LEFT JOIN can_ho c ON h.can_ho_id = c.id ORDER BY FIELD(h.trang_thai, 'pending', 'approved', 'rejected'), h.diem_uu_tien DESC, h.created_at ASC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });
        res.json({ success: true, data: results });
    });
});

// 3. DUYỆT HỒ SƠ & TỰ ĐỘNG TẠO HỢP ĐỒNG (CẬP NHẬT MỚI)
router.post("/ho-so/:id/duyet", async (req, res) => {
    const hoSoId = req.params.id;

    // A. Lấy thông tin
    db.query(`SELECT h.*, c.ten_can_ho, c.gia, c.khu_vuc FROM ho_so h LEFT JOIN can_ho c ON h.can_ho_id = c.id WHERE h.id = ?`, [hoSoId], async (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ message: "Hồ sơ lỗi" });
        const hoSo = rows[0];

        // B. Check User
        db.query("SELECT * FROM users WHERE email = ?", [hoSo.email], async (err, uRows) => {
            if (uRows.length > 0) return res.status(400).json({ message: "Email đã tồn tại!" });

            // C. Tạo User
            const cleanName = removeVietnameseTones(hoSo.ho_ten);
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const rawPassword = `${cleanName}${randomCode}`;
            const passwordHash = await bcrypt.hash(rawPassword, 10);

            db.query("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'user')", 
            [hoSo.ho_ten, hoSo.email, passwordHash, hoSo.dien_thoai], (errU, resU) => {
                if (errU) return res.status(500).json({ message: "Lỗi tạo User" });
                const newUserId = resU.insertId;

                // D. Update Hồ sơ & Căn hộ
                db.query("UPDATE ho_so SET trang_thai = 'approved', user_id = ? WHERE id = ?", [newUserId, hoSoId]);
                db.query("UPDATE can_ho SET trang_thai = 'da_thue' WHERE id = ?", [hoSo.can_ho_id]);

                // --- E. TẠO HỢP ĐỒNG TỰ ĐỘNG (MỚI THÊM) ---
                const today = new Date();
                const endDate = new Date();
                endDate.setFullYear(today.getFullYear() + 5); // Cộng 5 năm

                const sqlHD = `INSERT INTO hop_dong (ho_so_id, user_id, can_ho_id, ngay_ky, ngay_bat_dau, ngay_ket_thuc, trang_thai) VALUES (?, ?, ?, NOW(), NOW(), ?, 'hieu_luc')`;
                db.query(sqlHD, [hoSoId, newUserId, hoSo.can_ho_id, endDate]);

                // F. Từ chối hồ sơ trùng
                db.query("UPDATE ho_so SET trang_thai = 'rejected', note = 'Căn hộ đã có người thuê' WHERE can_ho_id = ? AND id != ? AND trang_thai = 'pending'", [hoSo.can_ho_id, hoSoId]);

                // G. Gửi Email (Có thêm thông tin hợp đồng)
                transporter.sendMail({
                    from: '"BQL DEKA" <binhcs2006@gmail.com>',
                    to: hoSo.email,
                    subject: "✅ DUYỆT THÀNH CÔNG - HỢP ĐỒNG THUÊ NHÀ",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
                            <h2 style="color: #0d6efd;">CHÚC MỪNG! HỒ SƠ ĐÃ ĐƯỢC DUYỆT</h2>
                            <p>Xin chào <strong>${hoSo.ho_ten}</strong>,</p>
                            <p>Hồ sơ thuê nhà tại <strong>${hoSo.ten_can_ho}</strong> đã được chấp thuận.</p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #28a745; margin: 15px 0;">
                                <h3>📜 THÔNG TIN HỢP ĐỒNG</h3>
                                <p><strong>Căn hộ:</strong> ${hoSo.ten_can_ho}</p>
                                <p><strong>Giá thuê:</strong> ${formatMoney(hoSo.gia)}/tháng</p>
                                <p><strong>Thời hạn:</strong> 5 Năm (${today.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')})</p>
                                <p style="color: red; font-style: italic; font-weight: bold;">
                                    * Lưu ý: Hồ sơ hợp đồng này chỉ cấp 1 lần qua email, quý khách vui lòng lưu trữ cẩn thận.
                                </p>
                            </div>

                            <div style="background: #e9ecef; padding: 15px; margin: 15px 0;">
                                <p><strong>User:</strong> ${hoSo.email}</p>
                                <p><strong>Pass:</strong> ${rawPassword}</p>
                                <a href="http://localhost:5173/login">Đăng nhập ngay</a>
                            </div>
                        </div>
                    `
                });

                res.json({ success: true, message: "Duyệt thành công! Đã tạo hợp đồng 5 năm." });
            });
        });
    });
});

// 4. TỪ CHỐI (GIỮ NGUYÊN)
router.post("/ho-so/:id/tu-choi", (req, res) => {
    db.query("UPDATE ho_so SET trang_thai = 'rejected', note = ? WHERE id = ?", [req.body.ly_do, req.params.id], () => {
        res.json({ success: true, message: "Đã từ chối." });
    });
});

// 5. DANH SÁCH LIÊN HỆ (GIỮ NGUYÊN)
router.get("/lien-he", (req, res) => {
    db.query("SELECT * FROM lien_he ORDER BY created_at DESC", (err, results) => {
        res.json({ success: true, data: results });
    });
});

// --- 6. API MỚI: LẤY DANH SÁCH HỢP ĐỒNG ---
router.get("/hop-dong", (req, res) => {
    const sql = `
        SELECT hd.*, c.ten_can_ho, c.gia, c.dia_chi_du_an, c.dien_tich, u.name as chu_ho, u.email, u.phone 
        FROM hop_dong hd
        JOIN can_ho c ON hd.can_ho_id = c.id
        JOIN users u ON hd.user_id = u.id
        WHERE hd.trang_thai = 'hieu_luc'
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi DB" });
        res.json({ success: true, data: results });
    });
});

// --- 7. API MỚI: BAN HỢP ĐỒNG (CHẤM DỨT + XÓA USER) ---
router.post("/hop-dong/:id/ban", (req, res) => {
    const hdId = req.params.id;
    
    // Lấy thông tin hợp đồng để biết căn nào, user nào
    db.query("SELECT can_ho_id, user_id FROM hop_dong WHERE id = ?", [hdId], (err, rows) => {
        if (rows.length === 0) return res.status(404).json({ message: "Không tìm thấy HĐ" });
        const { can_ho_id, user_id } = rows[0];

        // 1. Cập nhật HĐ thành hết hạn
        db.query("UPDATE hop_dong SET trang_thai = 'het_han' WHERE id = ?", [hdId]);

        // 2. Trả lại căn hộ thành trống
        db.query("UPDATE can_ho SET trang_thai = 'trong' WHERE id = ?", [can_ho_id]);

        // 3. XÓA LUÔN USER (Theo yêu cầu của anh)
        db.query("DELETE FROM users WHERE id = ?", [user_id], () => {
            res.json({ success: true, message: "Đã chấm dứt hợp đồng, thu hồi căn hộ và xóa tài khoản cư dân." });
        });
    });
});

// 8. LẤY DANH SÁCH PHẢN ÁNH (CỦA CƯ DÂN)
router.get("/phan-anh", (req, res) => {
    // Lấy kèm thông tin người gửi
    const sql = `
        SELECT pa.*, u.name as nguoi_gui, u.email 
        FROM phan_anh pa 
        JOIN users u ON pa.user_id = u.id 
        ORDER BY pa.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Lỗi DB" });
        res.json({ success: true, data: results });
    });
});

// 9. TRẢ LỜI PHẢN ÁNH (ADMIN COMMENT)
router.post("/phan-anh/:id/tra-loi", (req, res) => {
    const { noi_dung_tra_loi } = req.body; // Nội dung Admin trả lời
    
    // Cập nhật câu trả lời và đổi trạng thái thành 'da_xu_ly'
    const sql = "UPDATE phan_anh SET phan_hoi = ?, trang_thai = 'da_xu_ly', ngay_xu_ly = NOW() WHERE id = ?";
    
    db.query(sql, [noi_dung_tra_loi, req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Lỗi lưu phản hồi" });
        res.json({ success: true, message: "Đã gửi phản hồi cho cư dân." });
    });
});

// 10. XÓA TIN NHẮN (LIÊN HỆ KHÁCH HOẶC PHẢN ÁNH)
router.delete("/lien-he/:id", (req, res) => {
    db.query("DELETE FROM lien_he WHERE id = ?", [req.params.id], () => {
        res.json({ success: true, message: "Đã xóa tin nhắn." });
    });
});

module.exports = router;