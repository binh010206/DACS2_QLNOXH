import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Spinner, Modal, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State ẩn/hiện mật khẩu
    
    // State Modals
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');

    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // ==================================================
    // 1. HIỆU ỨNG GỢN NƯỚC (RIPPLE EFFECT)
    // ==================================================
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let width, height, ripples = [];

        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        class Ripple {
            constructor(x, y) {
                this.x = x; this.y = y; this.radius = 0; this.alpha = 0.6; this.speed = 1.5;
            }
            update() { this.radius += this.speed; this.alpha -= 0.02; }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(13, 202, 240, ${this.alpha})`; // Màu Cyan sáng
                ctx.lineWidth = 2; ctx.stroke();
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < ripples.length; i++) {
                ripples[i].update(); ripples[i].draw();
                if (ripples[i].alpha <= 0) { ripples.splice(i, 1); i--; }
            }
            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e) => { 
            // Tạo gợn nước khi di chuột (mật độ vừa phải)
            if (Math.random() > 0.7) ripples.push(new Ripple(e.clientX, e.clientY)); 
        };
        
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize(); animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // ==================================================
    // 2. XỬ LÝ LOGIC (API)
    // ==================================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success(`Chào mừng ${res.data.user.name}!`);
            
            if (res.data.user.role === 'admin') navigate('/admin');
            else navigate('/user');
        } catch (err) {
            toast.error(err.response?.data?.message || "Sai thông tin đăng nhập!");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        if(forgotEmail.includes('@')) {
            toast.info(`Hệ thống mô phỏng: Đã gửi link reset tới ${forgotEmail}`);
            setShowForgot(false); setForgotEmail('');
        } else {
            toast.warning("Email không hợp lệ.");
        }
    };

    // ==================================================
    // 3. GIAO DIỆN (JSX)
    // ==================================================
    return (
        <div className="login-wrapper">
            <canvas ref={canvasRef} className="particle-canvas"></canvas>
            <div className="login-overlay"></div>

            <Container className="d-flex align-items-center justify-content-center vh-100 position-relative content-container">
                <Card className="login-card shadow-lg border-0 overflow-hidden animate-fade-up">
                    <div className="row g-0 h-100">
                        
                        {/* --- CỘT TRÁI: LOGO & BRANDING (Nền tối) --- */}
                        <div className="col-lg-5 d-none d-lg-flex bg-left-panel flex-column justify-content-center align-items-center text-white p-5 text-center position-relative">
                            <div className="glass-panel p-5 rounded-4 position-relative" style={{zIndex: 2, width: '100%'}}>
                                
                                {/* === CUSTOM LOGO: BUILDING STYLE === */}
                                <div className="mb-4 logo-wrapper">
                                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="building-icon">
                                        {/* Tòa nhà cao nhất (Giữa) */}
                                        <path d="M45 20L55 15V90H45V20Z" fill="url(#grad1)" stroke="white" strokeWidth="1"/>
                                        <path d="M45 20H55V90H45V20Z" fill="white" fillOpacity="0.2"/>
                                        
                                        {/* Tòa nhà bên trái */}
                                        <path d="M30 40L40 35V90H30V40Z" fill="url(#grad1)" stroke="white" strokeWidth="1"/>
                                        <path d="M20 60L30 55V90H20V60Z" fill="url(#grad1)" stroke="white" strokeWidth="1"/>
                                        
                                        {/* Tòa nhà bên phải */}
                                        <path d="M60 35L70 40V90H60V35Z" fill="url(#grad1)" stroke="white" strokeWidth="1"/>
                                        <path d="M75 50L85 55V90H75V50Z" fill="url(#grad1)" stroke="white" strokeWidth="1"/>

                                        {/* Đế */}
                                        <rect x="15" y="90" width="70" height="4" fill="white"/>

                                        {/* Gradient tô màu */}
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" style={{stopColor:'#00d2ff', stopOpacity:1}} />
                                                <stop offset="100%" style={{stopColor:'#3a7bd5', stopOpacity:1}} />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <h3 className="brand-name mt-3">DEKA BUILDING</h3>
                                    <div className="brand-divider"></div>
                                    <p className="brand-slogan">KIẾN TẠO TƯƠNG LAI</p>
                                </div>
                                {/* === END LOGO === */}

                                <p className="opacity-75 mb-4 small">
                                    Hệ thống quản lý nhà ở xã hội tập trung, minh bạch và tiện ích.
                                </p>

                                <Button 
                                    variant="outline-light" 
                                    className="rounded-pill px-4 fw-bold py-2 w-100 hover-white"
                                    onClick={() => toast.info("Vui lòng nộp hồ sơ tại trang chủ.")}
                                >
                                    Nộp Hồ Sơ Xét Duyệt
                                </Button>
                            </div>
                        </div>

                        {/* --- CỘT PHẢI: FORM ĐĂNG NHẬP (Nền trắng) --- */}
                        <div className="col-lg-7 bg-white p-5 d-flex flex-column justify-content-center">
                            <div className="text-end mb-5">
                                <Link to="/" className="text-decoration-none fw-bold small text-secondary hover-primary d-inline-flex align-items-center">
                                    <i className="bi bi-arrow-left me-2"></i> Quay về Trang chủ
                                </Link>
                            </div>

                            <div className="mb-4 ps-1">
                                <h2 className="fw-bold text-dark mb-1">Đăng Nhập</h2>
                                <p className="text-muted">Nhập thông tin tài khoản cư dân của bạn.</p>
                            </div>

                            <Form onSubmit={handleLogin}>
                                {/* EMAIL INPUT */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-uppercase text-secondary ls-1">Tài khoản</Form.Label>
                                    <InputGroup className="input-group-lg border rounded-3 overflow-hidden focus-ring">
                                        <InputGroup.Text className="bg-white border-0 text-primary ps-3">
                                            <i className="bi bi-envelope-fill"></i>
                                        </InputGroup.Text>
                                        <Form.Control 
                                            className="border-0 shadow-none ps-2" 
                                            placeholder="Email hoặc Số điện thoại" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>

                                {/* PASSWORD INPUT (CÓ MẮT ẨN HIỆN) */}
                                <Form.Group className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small fw-bold text-uppercase text-secondary ls-1 mb-0">Mật khẩu</Form.Label>
                                        <span className="small text-primary fw-bold cursor-pointer hover-underline" onClick={() => setShowForgot(true)}>
                                            Quên mật khẩu?
                                        </span>
                                    </div>
                                    <InputGroup className="input-group-lg border rounded-3 overflow-hidden focus-ring">
                                        <InputGroup.Text className="bg-white border-0 text-primary ps-3">
                                            <i className="bi bi-lock-fill"></i>
                                        </InputGroup.Text>
                                        <Form.Control 
                                            type={showPassword ? "text" : "password"} 
                                            className="border-0 shadow-none ps-2" 
                                            placeholder="••••••••" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        {/* NÚT MẮT ẨN/HIỆN */}
                                        <InputGroup.Text 
                                            className="bg-white border-0 text-muted cursor-pointer pe-3 hover-text-dark"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow-sm btn-gradient rounded-3 mb-4 text-uppercase ls-1" disabled={loading}>
                                    {loading ? <Spinner size="sm" animation="border" /> : "Đăng Nhập Hệ Thống"}
                                </Button>
                            </Form>
                            
                             <Alert variant="light" className="d-flex align-items-center border-0 bg-gray rounded-3 p-3 small text-muted mb-0">
                                <i className="bi bi-info-circle-fill fs-5 text-info me-3"></i>
                                <div>
                                    Nếu chưa có tài khoản, vui lòng liên hệ BQL hoặc nộp hồ sơ trực tuyến.
                                </div>
                            </Alert>
                        </div>
                    </div>
                </Card>
            </Container>

            {/* --- MODAL QUÊN MẬT KHẨU --- */}
            <Modal show={showForgot} onHide={() => setShowForgot(false)} centered>
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold">Khôi phục mật khẩu</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 pt-0">
                    <p className="text-muted small mb-3">Nhập email đăng ký để nhận mã OTP.</p>
                    <Form onSubmit={handleForgotSubmit}>
                        <Form.Control 
                            type="email" placeholder="Nhập email của bạn..." 
                            required className="mb-3 py-2 bg-light border-0"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                        />
                        <Button variant="dark" type="submit" className="w-100 fw-bold py-2">Gửi Yêu Cầu</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* CSS STYLES */}
            <style>{`
                /* Layout */
                .login-wrapper {
                    position: relative; height: 100vh; overflow: hidden;
                    background: #0f172a; /* Nền tối sang trọng */
                    background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000');
                    background-size: cover; background-position: center;
                }
                .login-overlay {
                    position: absolute; inset: 0;
                    background: rgba(15, 23, 42, 0.85); /* Lớp phủ tối màu xanh đen */
                    z-index: 1;
                }
                .content-container { z-index: 10; }
                .particle-canvas { position: absolute; inset: 0; z-index: 2; pointer-events: none; }

                /* Card */
                .login-card {
                    width: 950px; min-height: 580px; border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                }

                /* Left Panel */
                .bg-left-panel {
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    position: relative; overflow: hidden;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                }

                /* LOGO STYLING */
                .building-icon {
                    filter: drop-shadow(0 0 8px rgba(0, 210, 255, 0.6));
                    transition: transform 0.5s ease;
                }
                .logo-wrapper:hover .building-icon { transform: scale(1.05); }
                .brand-name {
                    font-family: 'Arial Black', sans-serif; font-weight: 900;
                    letter-spacing: 1px; margin-bottom: 5px;
                    background: -webkit-linear-gradient(#fff, #a1c4fd);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .brand-divider { height: 2px; width: 50px; background: #00d2ff; margin: 0 auto 5px; }
                .brand-slogan { font-size: 0.8rem; letter-spacing: 3px; color: #c2e9fb; font-weight: bold; }

                /* Right Panel & Inputs */
                .focus-ring:focus-within {
                    border-color: #0d6efd !important;
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
                    transition: all 0.3s;
                }
                .hover-primary:hover { color: #0d6efd !important; }
                .hover-underline:hover { text-decoration: underline; }
                .hover-text-dark:hover { color: #212529 !important; }
                .cursor-pointer { cursor: pointer; }
                .bg-gray { background-color: #f8f9fa; }
                .ls-1 { letter-spacing: 1px; }

                /* Buttons */
                .btn-gradient {
                    background: linear-gradient(90deg, #0061ff 0%, #60efff 100%);
                    border: none; color: white;
                }
                .btn-gradient:hover {
                    background: linear-gradient(90deg, #60efff 0%, #0061ff 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 97, 255, 0.4);
                }
                .hover-white:hover { background-color: white; color: #1e3c72 !important; }

                /* Animation */
                .animate-fade-up { animation: fadeUp 0.8s ease-out; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Login;