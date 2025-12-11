import React, { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoDeka from '../assets/deka-logo.jpg';

const UserSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Dùng State để cập nhật lại giao diện khi có thay đổi
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || { name: 'Cư dân', avatar: '' });

    // --- LOGIC TỰ ĐỘNG ĐỒNG BỘ AVATAR ---
    useEffect(() => {
        // Hàm đọc lại dữ liệu mới nhất
        const updateUserData = () => {
            const updatedUser = JSON.parse(localStorage.getItem('user'));
            if (updatedUser) {
                setUser(updatedUser);
            }
        };

        // Lắng nghe sự kiện 'storage' (khi Profile bắn tín hiệu)
        window.addEventListener('storage', updateUserData);
        
        // Cleanup khi component bị hủy
        return () => window.removeEventListener('storage', updateUserData);
    }, []);

    const handleLogout = () => {
        if(window.confirm("Bạn muốn đăng xuất?")) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const menus = [
        { path: '/user/dashboard', name: 'Tổng quan', icon: 'bi-grid-fill' },
        { path: '/user/profile', name: 'Hồ sơ cá nhân', icon: 'bi-person-badge-fill' },
        { path: '/user/contracts', name: 'Hợp đồng thuê', icon: 'bi-file-earmark-text-fill' },
        { path: '/user/bills', name: 'Hóa đơn & Thanh toán', icon: 'bi-receipt' },
        { path: '/user/requests', name: 'Gửi phản ánh', icon: 'bi-chat-dots-fill' },
    ];

    return (
        <div className="d-flex flex-column p-3 h-100 position-relative text-white" style={{ width: '280px', overflow: 'hidden' }}>
            
            {/* NỀN SIDEBAR */}
            <div className="sidebar-background"></div>
            <div className="sidebar-overlay"></div>

            {/* LOGO */}
            <div className="position-relative z-2 mb-4 text-center mt-2">
                <Link to="/user" className="text-decoration-none">
                    <img 
                        src={logoDeka} alt="Logo" 
                        className="rounded-circle shadow-lg border border-2 border-white mb-2" 
                        width="80" height="80" style={{objectFit: 'contain', backgroundColor: 'white'}} 
                    />
                    <h5 className="fw-bold m-0 text-white ls-1">DEKA RESIDENT</h5>
                </Link>
            </div>
            
            {/* --- INFO USER (ĐÃ CẬP NHẬT HIỂN THỊ ẢNH) --- */}
            <div className="position-relative z-2 mb-4 p-3 glass-card rounded-4 d-flex align-items-center">
                <div className="position-relative me-3">
                    {/* Nếu có Avatar thì hiện Ảnh, không thì hiện Icon */}
                    {user.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt="User" 
                            className="rounded-circle shadow-sm border border-2 border-white"
                            style={{width: '45px', height: '45px', objectFit: 'cover'}}
                        />
                    ) : (
                        <div className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center shadow-sm" style={{width: 45, height: 45}}>
                            <i className="bi bi-person-fill fs-4"></i>
                        </div>
                    )}
                    
                    {/* Chấm xanh online */}
                    <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"></span>
                </div>
                
                <div className="overflow-hidden">
                    <h6 className="mb-1 fw-bold text-truncate text-white" style={{fontSize: '0.95rem'}}>{user.name}</h6>
                    <small className="text-white-50 d-block" style={{fontSize: '0.75rem'}}>
                        Cư dân chính thức
                    </small>
                </div>
            </div>

            <hr className="position-relative z-2 opacity-25 my-1"/>

            {/* MENU */}
            <Nav className="flex-column mb-auto gap-2 position-relative z-2 mt-3">
                {menus.map((menu, idx) => {
                    const isActive = location.pathname === menu.path;
                    return (
                        <Nav.Link 
                            key={idx}
                            as={Link} 
                            to={menu.path}
                            className={`d-flex align-items-center px-3 py-3 rounded-3 fw-bold menu-item ${
                                isActive ? 'active-menu' : 'text-white-50'
                            }`}
                        >
                            <i className={`bi ${menu.icon} me-3 fs-5`}></i>
                            {menu.name}
                        </Nav.Link>
                    )
                })}
            </Nav>
            
            <div className="position-relative z-2 mt-3">
                <button onClick={handleLogout} className="btn btn-danger w-100 fw-bold shadow rounded-pill hover-lift">
                    <i className="bi bi-box-arrow-left me-2"></i> Đăng xuất
                </button>
            </div>
            
            <style>{`
                .sidebar-background {
                    position: absolute; inset: 0;
                    background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600');
                    background-size: cover; background-position: center; z-index: 0;
                }
                .sidebar-overlay {
                    position: absolute; inset: 0;
                    background: linear-gradient(to bottom, rgba(10, 20, 30, 0.9), rgba(10, 20, 30, 0.95));
                    backdrop-filter: blur(4px); z-index: 1;
                }
                .ls-1 { letter-spacing: 1px; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .menu-item { transition: 0.3s; border: 1px solid transparent; }
                .menu-item:not(.active-menu):hover {
                    background: rgba(255, 255, 255, 0.1); color: white !important; transform: translateX(5px);
                }
                .active-menu {
                    background: linear-gradient(90deg, #0d6efd, #0099ff); color: white !important;
                    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.4);
                }
                .hover-lift:hover { transform: translateY(-2px); transition: 0.3s; }
            `}</style>
        </div>
    );
};

export default UserSidebar;