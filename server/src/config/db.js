const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "ql_noxh"
});

db.connect((err) => {
    if (err) {
        console.log("Kết nối database thất bại:", err);
    } else {
        console.log("Kết nối database thành công!");
    }
});

module.exports = db;
