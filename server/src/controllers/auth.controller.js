// src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

exports.register = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;

  User.findByEmail(email, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (rows.length > 0) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashed = bcrypt.hashSync(password, 10);
    User.create({ name, email, password: hashed, role }, (err2, result) => {
      if (err2) return res.status(500).json({ message: "Lỗi tạo user", err: err2 });
      res.json({ message: "Đăng ký thành công", id: result.insertId });
    });
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Email nhận:", email);
    console.log("Mật khẩu nhận:", password);

    // Dùng đúng model và đúng hàm
    User.findByEmail(email, async (err, rows) => {
      if (err) {
        console.log("Lỗi DB:", err);
        return res.status(500).json({ message: "DB error", err });
      }

      const user = rows[0];
      console.log("User trong DB:", user);

      if (!user) {
        return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
      }

      const match = await bcrypt.compare(password, user.password);
      console.log("Kết quả compare bcrypt:", match);

      if (!match) {
        return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: "Đăng nhập thành công",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (err) {
    console.log("Lỗi trong try:", err);
    return res.status(500).json({ message: "Lỗi đăng nhập", err });
  }
};


exports.me = (req, res) => {
  // auth middleware đã gắn req.user
  User.findById(req.user.id, (err, rows) => {
    if (err) return res.status(500).json({ message: "DB error", err });
    if (!rows || rows.length === 0) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(rows[0]);
  });
};
