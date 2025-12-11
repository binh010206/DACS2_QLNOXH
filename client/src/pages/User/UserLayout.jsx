import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import UserSidebar from '../../components/UserSidebar';
import UserDashboard from './UserDashboard';
import UserProfile from './UserProfile';
import UserContracts from './UserContracts';
import UserBills from './UserBills';
import UserRequests from './UserRequests';

const UserLayout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (!token) {
            navigate('/login');
        } else if (user && user.role === 'admin') {
            navigate('/admin');
        }
    }, [navigate]);

    return (
        // THAY ĐỔI Ở ĐÂY: Thêm background gradient thay vì bg-light
        <div className="d-flex user-layout-bg" style={{ minHeight: '100vh' }}>
            {/* Sidebar cố định */}
            <div className="d-none d-lg-block sticky-top" style={{ height: '100vh', zIndex: 1000 }}>
                <UserSidebar />
            </div>

            {/* Nội dung chính */}
            <div className="flex-grow-1 p-4 content-area" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
                {/* Mobile Menu Toggle (Optional - giữ nguyên) */}
                <div className="d-lg-none mb-3">
                    <button className="btn btn-primary shadow-sm"><i className="bi bi-list"></i> Menu</button>
                </div>

                <Routes>
                    <Route index element={<UserDashboard />} />
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="profile" element={<UserProfile />} />
                    <Route path="contracts" element={<UserContracts />} />
                    <Route path="bills" element={<UserBills />} />
                    <Route path="requests" element={<UserRequests />} />
                    <Route path="*" element={<UserDashboard />} />
                </Routes>
            </div>

            {/* STYLE MỚI CHO NỀN VÀ HIỆU ỨNG TỔNG */}
            <style>{`
                /* Nền Gradient nhẹ nhàng sang trọng */
                .user-layout-bg {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }
                /* Hiệu ứng hiện nội dung mượt mà */
                .content-area {
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                /* Tùy chỉnh thanh cuộn cho đẹp */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
            `}</style>
        </div>
    );
};

export default UserLayout;