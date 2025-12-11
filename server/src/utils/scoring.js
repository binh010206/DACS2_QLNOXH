/**
 * Hàm tính điểm ưu tiên tự động cho hồ sơ NOXH
 * Thang điểm tham khảo (tùy chỉnh theo quy chế dự án):
 * - Tổng điểm = Điểm đối tượng + Điểm thu nhập + Điểm hoàn cảnh
 */

const calculateScore = (data) => {
    let score = 0;
    const { nghe_nghiep, thu_nhap, so_nguoi_o } = data;

    // 1. CHẤM ĐIỂM THEO ĐỐI TƯỢNG (Dựa vào nghề nghiệp nhập vào)
    // Bạn có thể mở rộng danh sách này
    const text = nghe_nghiep ? nghe_nghiep.toLowerCase() : "";
    
    if (text.includes("có công") || text.includes("liệt sĩ") || text.includes("thương binh")) {
        score += 100; // Ưu tiên cao nhất
    } else if (text.includes("hộ nghèo") || text.includes("cận nghèo")) {
        score += 80;
    } else if (text.includes("công nhân") || text.includes("khu công nghiệp")) {
        score += 60; // Đối tượng lao động KCN
    } else if (text.includes("công chức") || text.includes("viên chức") || text.includes("bộ đội") || text.includes("công an")) {
        score += 50;
    } else if (text.includes("tự do") || text.includes("thu nhập thấp")) {
        score += 40;
    } else {
        score += 20; // Đối tượng thường
    }

    // 2. CHẤM ĐIỂM THEO THU NHẬP BÌNH QUÂN ĐẦU NGƯỜI
    // Thu nhập càng thấp thì điểm ưu tiên càng cao
    // Giả sử thu nhập nhập vào là tổng thu nhập gia đình
    const thuNhapBQ = parseInt(thu_nhap) / parseInt(so_nguoi_o || 1);

    if (thuNhapBQ < 3000000) { // Dưới 3 triệu/người
        score += 30;
    } else if (thuNhapBQ < 5000000) { // Dưới 5 triệu
        score += 20;
    } else if (thuNhapBQ < 9000000) { // Dưới 9 triệu
        score += 10;
    } else if (thuNhapBQ > 11000000) { 
        score -= 100; // Trừ điểm nặng nếu thu nhập quá cao (không thuộc diện NOXH)
    }

    // 3. CHẤM ĐIỂM THEO SỐ NGƯỜI (Ưu tiên gia đình đông con/người)
    if (parseInt(so_nguoi_o) >= 5) {
        score += 20;
    } else if (parseInt(so_nguoi_o) >= 3) {
        score += 10;
    }

    return score;
};

module.exports = { calculateScore };