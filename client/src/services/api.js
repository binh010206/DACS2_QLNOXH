// client/src/services/api.js
import axios from 'axios';

// Cấu hình Base URL của Backend (Thay đổi port nếu cần)
const API_BASE_URL = 'http://localhost:8080/api'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, 
});

// THÊM INTERCEPTOR (TRÌNH CHẶN) ĐỂ TỰ ĐỘNG GỬI TOKEN
api.interceptors.request.use(config => {
    // 1. Lấy token từ nơi lưu trữ (localStorage)
    const token = localStorage.getItem('token'); 

    if (token) {
        // 2. Gắn Token vào Header Authorization theo format chuẩn
        config.headers.Authorization = `Bearer ${token}`; 
    } else {
        // Nếu không có token, đây là lúc nên chuyển hướng về trang login
        // Tuy nhiên, việc chuyển hướng nên xử lý ở Frontend Router/Layout
    }
    return config;
}, error => {
    return Promise.reject(error);
});


api.interceptors.response.use(
    (response) => response,
    (error) => {
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            console.error("TOKEN HẾT HẠN HOẶC KHÔNG HỢP LỆ. Đăng xuất cưỡng bức.");
            
        }
        return Promise.reject(error);
    }
);

export default api;