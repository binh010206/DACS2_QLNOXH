// src/middleware/role.js
module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Token không hợp lệ" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }

        next();
    };
};
