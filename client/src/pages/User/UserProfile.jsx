import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', phone: '', avatar: '' });
    const [loading, setLoading] = useState(true);
    const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        api.get('/users/me').then(res => {
            if(res.data.success) setUser(res.data.data);
            setLoading(false);
        });
    }, []);

    const handleUpdate = async () => {
        try {
            const res = await api.put('/users/me', user);
            if(res.data.success) {
                toast.success("Cập nhật thành công!");
                const local = JSON.parse(localStorage.getItem('user')) || {};
                localStorage.setItem('user', JSON.stringify({ ...local, name: user.name, avatar: user.avatar }));
                setTimeout(() => window.location.reload(), 1000); 
            }
        } catch (e) { toast.error("Lỗi cập nhật"); }
    };

    const handleChangePass = async () => {
        if(passData.newPassword !== passData.confirmPassword) return toast.error("Mật khẩu không khớp");
        try {
            const payload = { oldPassword: passData.currentPassword, newPassword: passData.newPassword };
            const res = await api.put('/users/change-password', payload);
            if(res.data.success) {
                toast.success("Đổi mật khẩu thành công! Đang đăng xuất...", { autoClose: 2000 });
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }, 2500);
            } else toast.error(res.data.message);
        } catch (e) { toast.error(e.response?.data?.message || "Lỗi đổi mật khẩu"); }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;

    return (
        <div className="container-fluid p-4 page-enter-animation" style={{ backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <div className="mb-4 d-flex align-items-center">
                <div className="bg-primary text-white p-2 rounded-circle me-3 shadow-sm">
                    <i className="bi bi-person-vcard-fill fs-4"></i>
                </div>
                <div>
                    <h3 className="fw-bold text-dark m-0">Hồ Sơ Cư Dân</h3>
                    <p className="text-muted m-0 small">Quản lý thông tin cá nhân & bảo mật</p>
                </div>
            </div>

            <Row className="g-4">
                {/* --- CỘT TRÁI: AVATAR & MENU --- */}
                <Col lg={4}>
                    <Card className="border-0 shadow-lg rounded-4 h-100 bg-white card-hover-effect">
                        <Card.Body className="p-5 text-center d-flex flex-column align-items-center">
                            
                            {/* AVATAR CÓ HIỆU ỨNG */}
                            <div className="avatar-container mb-4">
                                <img 
                                    src={user.avatar || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                    alt="Avatar" 
                                    className="profile-avatar"
                                />
                                <div className="status-badge"></div>
                            </div>

                            <h4 className="fw-bold text-dark mb-1">{user.name}</h4>
                            <p className="text-muted mb-4 bg-light px-3 py-1 rounded-pill small border">{user.email}</p>

                            <div className="d-grid gap-3 w-100 mt-auto">
                                <Button 
                                    variant={!showPass ? "primary" : "outline-primary"} 
                                    className={`py-2 fw-bold rounded-pill shadow-sm transition-btn`}
                                    onClick={() => setShowPass(false)}
                                >
                                    <i className="bi bi-person-lines-fill me-2"></i> Thông tin chung
                                </Button>
                                <Button 
                                    variant={showPass ? "danger" : "outline-danger"} 
                                    className={`py-2 fw-bold rounded-pill shadow-sm transition-btn`}
                                    onClick={() => setShowPass(true)}
                                >
                                    <i className="bi bi-shield-lock-fill me-2"></i> Đổi mật khẩu
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- CỘT PHẢI: FORM --- */}
                <Col lg={8}>
                    <Card className="border-0 shadow-lg rounded-4 h-100 bg-white card-hover-effect overflow-hidden">
                        <Card.Body className="p-5">
                            
                            {/* FORM 1: THÔNG TIN (Hiện khi showPass = false) */}
                            <div className={`form-container ${!showPass ? 'active' : ''}`}>
                                <h5 className="fw-bold text-primary mb-4 text-uppercase border-bottom pb-3">
                                    <i className="bi bi-pencil-square me-2"></i>Cập nhật hồ sơ
                                </h5>
                                <Form>
                                    <Row className="g-4">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">HỌ VÀ TÊN</Form.Label>
                                                <Form.Control 
                                                    value={user.name} 
                                                    onChange={e => setUser({...user, name: e.target.value})} 
                                                    className="form-control-lg custom-input" 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">SỐ ĐIỆN THOẠI</Form.Label>
                                                <Form.Control 
                                                    value={user.phone || ''} 
                                                    onChange={e => setUser({...user, phone: e.target.value})} 
                                                    className="form-control-lg custom-input" 
                                                    placeholder="09xx..." 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">EMAIL (CỐ ĐỊNH)</Form.Label>
                                                <Form.Control 
                                                    value={user.email} 
                                                    disabled 
                                                    className="form-control-lg custom-input bg-light" 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">LINK ẢNH ĐẠI DIỆN</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text className="bg-white border-end-0 border-secondary"><i className="bi bi-link-45deg"></i></InputGroup.Text>
                                                    <Form.Control 
                                                        value={user.avatar || ''} 
                                                        onChange={e => setUser({...user, avatar: e.target.value})} 
                                                        className="form-control-lg custom-input border-start-0" 
                                                        placeholder="https://..." 
                                                    />
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="mt-5 text-end">
                                        <Button variant="primary" size="lg" className="px-5 rounded-pill fw-bold shadow-lg btn-animate" onClick={handleUpdate}>
                                            <i className="bi bi-save me-2"></i> Lưu Thay Đổi
                                        </Button>
                                    </div>
                                </Form>
                            </div>

                            {/* FORM 2: ĐỔI MẬT KHẨU (Hiện khi showPass = true) */}
                            <div className={`form-container ${showPass ? 'active' : ''}`}>
                                <h5 className="fw-bold text-danger mb-4 text-uppercase border-bottom pb-3">
                                    <i className="bi bi-shield-check me-2"></i>Bảo mật tài khoản
                                </h5>
                                <Form>
                                    <Row className="g-4">
                                        <Col md={12}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">MẬT KHẨU HIỆN TẠI</Form.Label>
                                                <Form.Control 
                                                    type="password" 
                                                    value={passData.currentPassword} 
                                                    onChange={e => setPassData({...passData, currentPassword: e.target.value})} 
                                                    className="form-control-lg custom-input" 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">MẬT KHẨU MỚI</Form.Label>
                                                <Form.Control 
                                                    type="password" 
                                                    value={passData.newPassword} 
                                                    onChange={e => setPassData({...passData, newPassword: e.target.value})} 
                                                    className="form-control-lg custom-input" 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label className="fw-bold small text-dark">XÁC NHẬN MẬT KHẨU</Form.Label>
                                                <Form.Control 
                                                    type="password" 
                                                    value={passData.confirmPassword} 
                                                    onChange={e => setPassData({...passData, confirmPassword: e.target.value})} 
                                                    className="form-control-lg custom-input" 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <div className="mt-5 text-end">
                                        <Button variant="danger" size="lg" className="px-5 rounded-pill fw-bold shadow-lg btn-animate" onClick={handleChangePass}>
                                            <i className="bi bi-check-circle me-2"></i> Xác Nhận Đổi
                                        </Button>
                                    </div>
                                </Form>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <style>{`
                /* 1. HIỆU ỨNG VÀO TRANG (Slide Up + Fade In) */
                .page-enter-animation {
                    animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* 2. AVATAR HOVER EFFECT */
                .avatar-container { position: relative; display: inline-block; transition: transform 0.3s; }
                .avatar-container:hover { transform: scale(1.05); }
                
                .profile-avatar {
                    width: 180px; height: 180px; object-fit: cover;
                    border-radius: 50%;
                    border: 5px solid white;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                    transition: all 0.3s ease;
                }
                .avatar-container:hover .profile-avatar {
                    box-shadow: 0 0 20px rgba(13, 110, 253, 0.4); /* Phát sáng xanh */
                    border-color: #0d6efd;
                }
                
                .status-badge {
                    position: absolute; bottom: 15px; right: 15px;
                    width: 25px; height: 25px;
                    background: #198754; border: 4px solid white; border-radius: 50%;
                }

                /* 3. INPUT CÓ VIỀN RÕ RÀNG */
                .custom-input {
                    border: 2px solid #dee2e6; /* Viền xám rõ */
                    background-color: #fff;
                    transition: all 0.2s;
                }
                .custom-input:focus {
                    border-color: #0d6efd; /* Viền xanh khi focus */
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
                }

                /* 4. CHUYỂN ĐỔI FORM MƯỢT MÀ */
                .form-container {
                    display: none; opacity: 0; transform: translateX(20px); transition: all 0.4s;
                }
                .form-container.active {
                    display: block; opacity: 1; transform: translateX(0);
                    animation: slideInRight 0.4s ease-out;
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* 5. NÚT BẤM */
                .btn-animate:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important; }
                .transition-btn { transition: all 0.3s; }
            `}</style>
        </div>
    );
};

export default UserProfile;