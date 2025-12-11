import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import logoDeka from '../../assets/deka-logo.jpg'; // Import Logo

const UserDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Cư dân' };
    const [stats, setStats] = useState({ unpaidBills: 0, activeContract: false, pendingRequests: 0 });
    const [loading, setLoading] = useState(true);

    // Gọi API lấy số liệu thật
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/users/dashboard-stats');
                if (res.data.success) setStats(res.data.data);
            } catch (error) { console.error(error); } 
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    // Component Card đẹp giống Admin
    const MenuCard = ({ title, desc, icon, gradient, onClick, btnText, delay }) => (
        <Col md={4} className="mb-4 animate-up" style={{ animationDelay: delay }}>
            <div className="card border-0 shadow-lg h-100 rounded-4 overflow-hidden text-white hover-scale" 
                 style={{ background: gradient, cursor: 'pointer' }}
                 onClick={onClick}
            >
                <div className="card-body p-4 position-relative d-flex flex-column">
                    {/* Icon nền mờ to */}
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-25">
                        <i className={`bi ${icon}`} style={{ fontSize: '5rem' }}></i>
                    </div>
                    
                    <h4 className="fw-bold text-uppercase mb-2">{title}</h4>
                    <p className="opacity-75 mb-4" style={{maxWidth: '80%'}}>{desc}</p>
                    
                    <div className="mt-auto">
                        <Button variant="light" className="rounded-pill fw-bold px-4 text-primary shadow-sm">
                            {btnText} <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    </div>
                </div>
            </div>
        </Col>
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;

    return (
        <div className="animate-fade-in container-fluid p-0">
            {/* 1. HEADER CHÀO MỪNG (CÓ LOGO) */}
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4 d-flex align-items-center justify-content-between position-relative overflow-hidden">
                <div className="d-flex align-items-center position-relative" style={{zIndex: 2}}>
                    <img src={logoDeka} alt="Logo" className="rounded-circle shadow-sm me-3 border border-2 border-white" width="60" height="60" style={{objectFit: 'contain'}} />
                    <div>
                        <h4 className="fw-bold text-dark m-0">Xin chào, {user.name}! 👋</h4>
                        <p className="text-muted m-0 small">Chúc bạn một ngày tốt lành tại DEKA BUILDING.</p>
                    </div>
                </div>
                {/* Trang trí nền */}
                <div className="position-absolute end-0 top-0 h-100 w-50" style={{background: 'linear-gradient(90deg, transparent, #f8f9fa)', zIndex: 1}}></div>
            </div>

            {/* 2. CẢNH BÁO HÓA ĐƠN (NỔI BẬT) */}
            {stats.unpaidBills > 0 && (
                <div className="animate-up" style={{animationDelay: '0.1s'}}>
                    <Alert variant="danger" className="border-0 shadow-sm mb-4 rounded-4 d-flex align-items-center justify-content-between p-3 bg-danger text-white">
                        <div className="d-flex align-items-center">
                            <div className="bg-white text-danger rounded-circle p-2 me-3 shadow-sm" style={{width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-0">CẢNH BÁO THANH TOÁN</h6>
                                <span className="small opacity-75">Bạn có <strong>{stats.unpaidBills} hóa đơn</strong> chưa thanh toán. Vui lòng đóng ngay để tránh cắt dịch vụ.</span>
                            </div>
                        </div>
                        <Button variant="light" className="fw-bold text-danger rounded-pill shadow-sm" onClick={() => navigate('/user/bills')}>
                            Thanh Toán Ngay
                        </Button>
                    </Alert>
                </div>
            )}

            {/* 3. DANH SÁCH CARD CHỨC NĂNG (STYLE ADMIN) */}
            <Row className="g-4">
                {/* Card Hợp Đồng (Xanh Dương) */}
                <MenuCard 
                    title={stats.activeContract ? "Hợp Đồng Của Bạn" : "Hợp Đồng Thuê Nhà Của Bạn"}
                    desc={stats.activeContract ? "Xem chi tiết thời hạn và điều khoản hợp đồng." : "Xem hợp đồng của bạn tại đây."}
                    icon="bi-file-earmark-text-fill"
                    gradient="linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)"
                    btnText="Xem Chi Tiết"
                    onClick={() => navigate('/user/contracts')}
                    delay="0.2s"
                />

                {/* Card Phản Ánh (Cam/Vàng) */}
                <MenuCard 
                    title="Gửi Phản Ánh"
                    desc={`Bạn có ${stats.pendingRequests} yêu cầu đang chờ BQL xử lý.`}
                    icon="bi-chat-dots-fill"
                    gradient="linear-gradient(135deg, #fd7e14 0%, #d65b00 100%)"
                    btnText="Gửi Yêu Cầu"
                    onClick={() => navigate('/user/requests')}
                    delay="0.3s"
                />

                {/* Card Hóa Đơn (Xanh Lá/Tím) */}
                <MenuCard 
                    title="Hóa Đơn & Nợ"
                    desc="Tra cứu lịch sử thanh toán điện, nước, phí dịch vụ."
                    icon="bi-receipt"
                    gradient="linear-gradient(135deg, #20c997 0%, #0f7d5c 100%)"
                    btnText="Tra Cứu"
                    onClick={() => navigate('/user/bills')}
                    delay="0.4s"
                />
            </Row>

            {/* 4. BANNER QUẢNG CÁO / TIN TỨC (LẤP TRỐNG) */}
            <div className="row mt-2 animate-up" style={{animationDelay: '0.5s'}}>
                <Col md={12}>
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden text-white" 
                         style={{
                             backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000")', 
                             backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '150px'
                         }}>
                        <div className="card-body p-4 d-flex flex-column justify-content-center" style={{background: 'rgba(0,0,0,0.5)'}}>
                            <h3 className="fw-bold">Cộng đồng văn minh - An toàn tuyệt đối</h3>
                            <p className="mb-0">Hotline hỗ trợ kỹ thuật 24/7: <span className="text-warning fw-bold">1900 1080</span></p>
                        </div>
                    </div>
                </Col>
            </div>

            <style>{`
                .hover-scale:hover { transform: translateY(-5px); transition: 0.3s ease; box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important; }
                .animate-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 1s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default UserDashboard;