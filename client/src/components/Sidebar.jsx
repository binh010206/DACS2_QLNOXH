import React, { useEffect, useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import logoDeka from '../assets/deka-logo.jpg'; 
import api from '../services/api';

const Sidebar = () => {
    const navigate = useNavigate();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const checkPending = async () => {
            try {
                const res = await api.get('/admin/thong-ke');
                if(res.data.success) setPendingCount(res.data.data.summary.hoSoChoDuyet);
            } catch (e) { console.error(e); }
        };
        checkPending();
        const interval = setInterval(checkPending, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="sidebar-glass d-flex flex-column flex-shrink-0 p-3 text-white">
            <div className="sidebar-bg"></div>

            {/* LOGO */}
            <div className="d-flex align-items-center mb-4 px-2 position-relative" style={{zIndex: 2}}>
                <div className="bg-white rounded p-1 me-3 shadow-sm">
                    <img src={logoDeka} alt="Logo" width="40" height="40" style={{objectFit:'contain'}} />
                </div>
                <div>
                    <h5 className="fw-bold m-0 ls-1">DEKA ADMIN</h5>
                    <small className="text-white-50" style={{fontSize: '0.75rem'}}>Hệ thống quản trị</small>
                </div>
            </div>
            
            <hr className="opacity-25 my-3 position-relative" style={{zIndex: 2}} />
            
            <Nav className="flex-column mb-auto gap-2 position-relative" style={{zIndex: 2}}>
                <Nav.Item>
                    <NavLink to="/admin/dashboard" className="nav-link text-white d-flex align-items-center px-3 py-3 rounded-3 sidebar-link">
                        <i className="bi bi-grid-fill me-3 fs-5"></i> Tổng quan
                    </NavLink>
                </Nav.Item>

                <Nav.Item>
    <NavLink to="/admin/applications" className="nav-link text-white d-flex align-items-center px-3 py-3 rounded-3 sidebar-link">
        <i className="bi bi-file-earmark-text-fill me-3 fs-5"></i>
        Xét duyệt hồ sơ
        <div className="ms-auto d-flex align-items-center">
            {pendingCount > 0 ? (
                <span className="badge bg-danger rounded-pill shadow-glow-red animate-pulse">
                    {pendingCount} chờ
                </span>
            ) : (
                <i className="bi bi-check-circle-fill text-success fs-5 shadow-glow-green" title="Đã xử lý hết"></i>
            )}
        </div>
    </NavLink>
</Nav.Item>

                <Nav.Item>
                    <NavLink to="/admin/apartments" className="nav-link text-white d-flex align-items-center px-3 py-3 rounded-3 sidebar-link">
                        <i className="bi bi-building-fill me-3 fs-5"></i> Quản lý căn hộ
                    </NavLink>
                </Nav.Item>

                {/* --- 2 NÚT BẠN CẦN THÊM --- */}
                <Nav.Item>
                    <NavLink to="/admin/contracts" className="nav-link text-white d-flex align-items-center px-3 py-3 rounded-3 sidebar-link">
                        <i className="bi bi-file-earmark-check-fill me-3 fs-5"></i> Hợp đồng
                    </NavLink>
                </Nav.Item>

                <Nav.Item>
                    <NavLink to="/admin/requests" className="nav-link text-white d-flex align-items-center px-3 py-3 rounded-3 sidebar-link">
                        <i className="bi bi-chat-left-text-fill me-3 fs-5"></i> Phản ánh & Hỗ trợ
                    </NavLink>
                </Nav.Item>
            </Nav>
            
            <div className="mt-5 position-relative" style={{zIndex: 2}}>
                <button className="btn btn-danger w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-left me-2"></i> Đăng Xuất
                </button>
            </div>

            <style>{`
                .sidebar-glass {
                    width: 280px;
                    /* QUAN TRỌNG: min-height để không bị hở khi scroll */
                    min-height: 100vh; 
                    height: 100%;
                    background: rgba(18, 28, 45, 0.95);
                    backdrop-filter: blur(15px);
                    border-right: 1px solid rgba(255,255,255,0.1);
                }
                .sidebar-bg {
                    position: absolute; inset: 0; z-index: 0;
                    background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600');
                    background-size: cover; background-position: center;
                    opacity: 0.15;
                }
                .sidebar-link { transition: all 0.3s; opacity: 0.8; border: 1px solid transparent; }
                .sidebar-link:hover, .sidebar-link.active {
                    background: rgba(255, 255, 255, 0.15); opacity: 1; 
                    border-color: rgba(255,255,255,0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .shadow-glow-red { box-shadow: 0 0 10px #ff3b3b; }
    .shadow-glow-green { text-shadow: 0 0 10px #198754; }
    
    .animate-pulse {
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(1); opacity: 1; }
    }
                .status-dot { display: block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); }
            `}</style>
        </div>
    );
};

export default Sidebar;