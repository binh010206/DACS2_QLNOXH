const express = require("express");
const router = express.Router();
const db = require("../config/db");

const rateLimit = {}; 

router.post("/gui", (req, res) => {
    const { ho_ten, email, sdt, noi_dung } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    
    
    // if (rateLimit[ip] && Date.now() - rateLimit[ip] < 30000) {
    //     return res.status(429).json({ 
    //         success: false, 
    //         message: "Thao tác quá nhanh! Vui lòng đợi vài giây." 
    //     });
    // }

    if (!ho_ten || !email || !noi_dung) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đủ thông tin!" });
    }

    const sql = "INSERT INTO lien_he (ho_ten, email, sdt, noi_dung) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [ho_ten, email, sdt, noi_dung], (err, result) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
        }
        rateLimit[ip] = Date.now();
        res.json({ success: true, message: "Gửi liên hệ thành công!" });
    });
});

module.exports = router;