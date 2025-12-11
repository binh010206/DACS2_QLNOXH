const express = require("express");
const router = express.Router();
const controller = require("../controllers/hop_dong.controller");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const upload = require("../middleware/uploadHopDong");

// Upload PDF cho HỢP ĐỒNG (user hoặc admin đều có thể)
router.post("/upload", auth, upload.single("file"), controller.userUpload);

// Các route khác...
router.post("/", auth, role("admin", "staff"), controller.create);
router.get("/", auth, role("admin", "staff"), controller.getAll);
router.get("/my", auth, controller.getMy);
router.put("/:id", auth, role("admin", "staff"), controller.update);
router.delete("/:id", auth, role("admin", "staff"), controller.delete);

module.exports = router;
