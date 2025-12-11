// src/routes/auth.route.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authCtrl = require("../controllers/auth.controller");
const auth = require("../middleware/auth");

// Middleware xử lý lỗi validate
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array()
    });
  }
  next();
};

// REGISTER
router.post(
  "/register",
  [
    body("name").exists().isString().isLength({ min: 2 }),
    body("email").exists().isEmail(),
    body("password").exists().isLength({ min: 6 }),
    body("role").optional().isIn(["admin", "staff", "user"])
  ],
  validate,
  authCtrl.register
);

// LOGIN (đã fix)
router.post(
  "/login",
  [
    body("email").exists().isEmail().withMessage("Email không hợp lệ"),
    body("password").exists().withMessage("Thiếu mật khẩu")
  ],
  validate,
  authCtrl.login
);

router.get("/me", auth, authCtrl.me);

module.exports = router;
