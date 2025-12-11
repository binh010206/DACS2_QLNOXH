
const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user.controller");
const auth = require("../middleware/auth"); 
const role = require("../middleware/role");
const db = require("../config/db"); 



// LẤY THÔNG TIN CỦA CHÍNH USER ĐANG ĐĂNG NHẬP
router.get("/me", auth, userCtrl.getMyInfo); 

// CẬP NHẬT THÔNG TIN CÁ NHÂN (Name, Phone, Avatar)
router.put("/me", auth, userCtrl.updateMyInfo);

// ĐỔI MẬT KHẨU
router.put("/change-password", auth, userCtrl.changePassword);



router.get("/dashboard-stats", auth, (req, res) => {
    const userId = req.user.id; 
    const stats = { activeContract: false, pendingRequests: 0, unpaidBills: 0 };


    db.query("SELECT * FROM hop_dong WHERE user_id = ? AND trang_thai = 'hieu_luc'", [userId], (err, hdRows) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi DB Hợp đồng" });
        if (hdRows.length > 0) stats.activeContract = true;


        db.query("SELECT COUNT(*) as count FROM phan_anh WHERE user_id = ? AND trang_thai = 'cho_xu_ly'", [userId], (err, paRows) => {
             if (err) return res.status(500).json({ success: false, message: "Lỗi DB Phản ánh" });
            stats.pendingRequests = paRows[0].count;

            // TODO: Phần unpaidBills sẽ cần API hóa đơn (chưa làm)
            
            res.json({ success: true, data: stats });
        });
    });
});


// API: LẤY HỢP ĐỒNG 
router.get("/my-contract", auth, (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT 
            hd.id, 
            DATE_FORMAT(hd.ngay_ky, '%Y-%m-%d') AS ngay_ky, 
            DATE_FORMAT(hd.ngay_bat_dau, '%Y-%m-%d') AS ngay_bat_dau, 
            DATE_FORMAT(hd.ngay_ket_thuc, '%Y-%m-%d') AS ngay_ket_thuc, 
            hd.trang_thai,
            c.ten_can_ho, c.dien_tich, c.gia, c.dia_chi_du_an, c.khu_vuc,
            u.name as chu_ho, u.phone, u.email
        FROM hop_dong hd
        JOIN can_ho c ON hd.can_ho_id = c.id
        JOIN users u ON hd.user_id = u.id
        WHERE hd.user_id = ? AND hd.trang_thai = 'hieu_luc'
    `;
    
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Lỗi truy vấn CSDL" });
        res.json({ success: true, data: rows[0] || null }); 
    });
});




router.get("/", auth, role("admin"), userCtrl.getAllUsers); 


router.get("/:id", auth, role("admin"), userCtrl.get);


router.put("/:id", auth, role("admin"), userCtrl.update);

router.delete("/:id", auth, role("admin"), userCtrl.remove);


module.exports = router;