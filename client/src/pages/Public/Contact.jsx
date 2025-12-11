import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';

// [FIX] Đường dẫn ảnh lùi 2 cấp thư mục
import logoDeka from '../../assets/deka-logo.jpg'; 

const Contact = () => {
    const [formData, setFormData] = useState({ ho_ten: '', email: '', sdt: '', noi_dung: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Gọi API gửi liên hệ
            const res = await axios.post('http://localhost:8080/api/lien-he/gui', formData);
            
            if(res.data.success) {
                toast.success("✅ Đã gửi thành công! Admin sẽ phản hồi sớm.");
                setFormData({ ho_ten: '', email: '', sdt: '', noi_dung: '' });
            } else {
                toast.warning(res.data.message);
            }
        } catch (error) {
            // [FIX] Bắt lỗi 429 (Spam) để báo nhẹ nhàng
            if (error.response && error.response.status === 429) {
                toast.warning("⏳ Bạn gửi quá nhanh! Vui lòng đợi một chút.");
            } else {
                console.error(error);
                toast.error("Lỗi kết nối Server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-wrapper position-relative overflow-hidden" style={{
            backgroundImage: 'url("https://moitruongxaydungvn.vn/uploads/images/2023/Quy%201-2024/1.1-ben-ngoai-toa-nha-dep-nhat-the-gioi-tai-dubai.jpg")', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed',
            minHeight: '100vh', 
            paddingTop: '120px',
            paddingBottom: '100px'
        }}>
            
            {/* Lớp phủ tối */}
            <div className="overlay" style={{
                position:'absolute', inset:0, 
                background:'rgba(10, 25, 41, 0.75)', 
                zIndex: 1 
            }}></div>

            {/* === LOGO BAY === */}
            <div className="bouncing-logo-container">
                <img 
                    src={logoDeka} 
                    alt="DEKA BUILDING" 
                    className="rainbow-logo"
                />
            </div>

            <Container className="position-relative" style={{zIndex: 10}}>
                <div className="text-center text-white mb-5 animate-up">
                    <h1 className="fw-black display-4 text-uppercase ls-2 text-shadow">Liên Hệ Hỗ Trợ</h1>
                    <div className="divider mx-auto bg-gradient-rainbow mb-3"></div>
                    <p className="lead opacity-75">Hệ thống tiếp nhận phản ánh 24/7 - Nhanh chóng & Minh bạch</p>
                </div>

                <Row className="g-5 justify-content-center">
                    {/* FORM */}
                    <Col lg={6} className="animate-up delay-1">
                        <div className="glass-card p-5 rounded-5 h-100">
                            <h3 className="fw-bold text-white mb-4 d-flex align-items-center">
                                <span className="icon-circle bg-warning text-dark me-3 shadow"><i className="bi bi-send-fill"></i></span>
                                Gửi Yêu Cầu
                            </h3>
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Floating className="mb-3">
                                    <Form.Control placeholder="Họ tên" className="glass-input" value={formData.ho_ten} onChange={e => setFormData({...formData, ho_ten: e.target.value})} required />
                                    <label className="text-white-50">Họ và tên</label>
                                </Form.Floating>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Floating className="mb-3">
                                            <Form.Control placeholder="SĐT" className="glass-input" value={formData.sdt} onChange={e => setFormData({...formData, sdt: e.target.value})} required />
                                            <label className="text-white-50">Số điện thoại</label>
                                        </Form.Floating>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Floating className="mb-3">
                                            <Form.Control type="email" placeholder="Email" className="glass-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                                            <label className="text-white-50">Email</label>
                                        </Form.Floating>
                                    </Col>
                                </Row>

                                <Form.Floating className="mb-4">
                                    <Form.Control as="textarea" style={{height: '150px'}} placeholder="Nội dung" className="glass-input" value={formData.noi_dung} onChange={e => setFormData({...formData, noi_dung: e.target.value})} required />
                                    <label className="text-white-50">Nội dung cần hỗ trợ...</label>
                                </Form.Floating>

                                <Button variant="warning" type="submit" size="lg" className="w-100 fw-bold rounded-pill btn-glow text-dark" disabled={loading}>
                                    {loading ? <Spinner size="sm" animation="border"/> : "GỬI YÊU CẦU NGAY"}
                                </Button>
                            </Form>
                        </div>
                    </Col>

                    {/* MAP */}
                    <Col lg={5} className="animate-up delay-2">
                        <Card className="border-0 shadow-lg h-100 rounded-5 overflow-hidden" style={{background: 'rgba(255,255,255,0.95)'}}>
                            <div className="position-relative" style={{height: '350px'}}>
                                <iframe 
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.110435406323!2d108.2097933141697!3d16.05975803990616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x314219b413a292d3%3A0x140d5885239a4867!2zMTIzIMSQw6BpIGzhu5kgTmd1eeG7hW4gVsSDbiBMaW5o!5e0!3m2!1svi!2s!4v1626245384950!5m2!1svi!2s" 
                                    width="100%" height="100%" style={{border:0}} loading="lazy" title="map"
                                ></iframe>
                            </div>
                            
                            <Card.Body className="p-4">
                                <h5 className="fw-bold text-dark mb-4 text-uppercase border-bottom pb-3">Thông tin liên hệ</h5>
                                <ul className="list-unstyled text-secondary spacing-list">
                                    <li><i className="bi bi-building text-primary fs-5 me-3"></i><span>123 Nguyễn Văn Linh, Đà Nẵng</span></li>
                                    <li><i className="bi bi-telephone-outbound text-success fs-5 me-3"></i><span className="fw-bold text-dark">111 222 666</span></li>
                                    <li><i className="bi bi-envelope-at text-danger fs-5 me-3"></i><span>hotro@deka.vn</span></li>
                                </ul>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style>{`
                /* [FIX] CSS KHỬ MÀU TRẮNG KHI AUTOFILL CỦA CHROME */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                textarea:-webkit-autofill,
                textarea:-webkit-autofill:hover,
                textarea:-webkit-autofill:focus {
                    -webkit-text-fill-color: white !important;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
                    transition: background-color 5000s ease-in-out 0s;
                }

                .animate-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
                .delay-1 { animation-delay: 0.2s; } .delay-2 { animation-delay: 0.4s; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                
                .bouncing-logo-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; overflow: hidden; }
                .rainbow-logo { width: 250px; opacity: 0.5; position: absolute; animation: floatAround 20s infinite linear, rainbowShift 3s infinite linear; }
                @keyframes floatAround { 0% { top: 10%; left: 5%; } 50% { top: 40%; left: 40%; } 100% { top: 10%; left: 5%; } }
                @keyframes rainbowShift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(360deg); } }

                .glass-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .glass-input { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.2) !important; color: white !important; border-radius: 12px; }
                .glass-input:focus { background: rgba(255, 255, 255, 0.15) !important; border-color: #ffc107 !important; color: white !important; }
                .form-floating > label { color: rgba(255,255,255,0.7); }
                .form-floating > .form-control:focus ~ label { color: #ffc107; }
                
                .text-shadow { text-shadow: 0 4px 10px rgba(0,0,0,0.8); }
                .ls-2 { letter-spacing: 2px; }
                .bg-gradient-rainbow { height: 4px; width: 100px; background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); border-radius: 2px; }
                .spacing-list li { margin-bottom: 20px; display: flex; align-items: center; }
                .icon-circle { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 1.3rem; }
                .btn-glow:hover { box-shadow: 0 0 20px #ffc107; transform: scale(1.02); transition: all 0.3s; }
            `}</style>
        </div>
    );
};

export default Contact;