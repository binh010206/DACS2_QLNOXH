import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProjectList = () => {
    const [allProjects, setAllProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ keyword: '', price: '', area: '' });

    // KHO ẢNH MẪU (6 tấm)
    const buildingImages = [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800",
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=800",
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?q=80&w=800",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800",
        "https://images.unsplash.com/photo-1430285561322-7808604715df?q=80&w=800",
    ];

    // Hàm lấy ảnh an toàn tuyệt đối (Dùng toán tử % để xoay vòng)
    const getProjectImage = (item, index) => {
        if (item.hinh_anh) return item.hinh_anh; // Ưu tiên ảnh thật trong DB
        
        // Nếu không có, lấy ảnh mẫu dựa trên ID (hoặc index nếu ID lỗi)
        const safeIndex = (item.id || index) % buildingImages.length;
        return buildingImages[safeIndex];
    };

    // 1. LẤY DỮ LIỆU
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/can-ho?limit=100');
                if (res.data.success) {
                    let data = res.data.data.rows || res.data.data || [];
                    setAllProjects(data);
                    setFilteredProjects(data);
                }
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // 2. TÌM KIẾM
    useEffect(() => {
        const removeAccents = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const result = allProjects.filter(item => {
            const fullInfo = (item.ten_du_an || "") + " " + (item.ten_can_ho || "") + " " + (item.khu_vuc || "") + " " + (item.dia_chi_du_an || "");
            
            const matchKeyword = removeAccents(fullInfo).includes(removeAccents(filter.keyword));
            const matchArea = filter.area ? removeAccents(fullInfo).includes(removeAccents(filter.area)) : true;

            let matchPrice = true;
            if (filter.price === '1') matchPrice = item.gia < 3000000;
            if (filter.price === '2') matchPrice = item.gia >= 3000000 && item.gia <= 5000000;
            if (filter.price === '3') matchPrice = item.gia > 5000000;

            return matchKeyword && matchArea && matchPrice;
        });
        setFilteredProjects(result);
    }, [filter, allProjects]);

    const formatMoney = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

    return (
        <div style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', paddingBottom: '100px', overflowX: 'hidden' }}>
            
            {/* === HERO BANNER (ANIMATION TRƯỢT XUỐNG) === */}
            <div style={{
                background: 'linear-gradient(135deg, #004e92 0%, #000428 100%)',
                paddingTop: '140px', paddingBottom: '120px', marginBottom: '60px', color: 'white', textAlign: 'center',
                position: 'relative', overflow: 'hidden'
            }}>
                {/* Hiệu ứng nền nhẹ */}
                <div style={{position:'absolute', inset:0, background:'url("https://www.transparenttextures.com/patterns/cubes.png")', opacity:0.1}}></div>
                
                <Container className="position-relative" style={{zIndex: 2}}>
                    <h1 className="fw-bold display-4 mb-3 animate-down" style={{textShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>
                        DANH SÁCH DỰ ÁN
                    </h1>
                    <p className="lead opacity-75 animate-down delay-1">
                        Cơ hội sở hữu nhà ở xã hội với chi phí tốt nhất Đà Nẵng
                    </p>
                </Container>
            </div>

            <Container style={{ marginTop: '-100px', position: 'relative', zIndex: 10 }}>
                
                {/* === THANH TÌM KIẾM (ANIMATION TRƯỢT LÊN) === */}
                <Card className="border-0 shadow-lg rounded-4 p-4 mb-5 animate-up glass-effect">
                    <Row className="g-3 align-items-end">
                        <Col md={5}>
                            <label className="fw-bold small text-muted mb-1">Tìm kiếm</label>
                            <Form.Control 
                                placeholder="Nhập tên dự án, căn hộ, quận..." 
                                className="bg-light border-0 py-3 rounded-pill"
                                value={filter.keyword}
                                onChange={(e) => setFilter({...filter, keyword: e.target.value})} 
                            />
                        </Col>
                        <Col md={3}>
                            <label className="fw-bold small text-muted mb-1">Khu vực</label>
                            <Form.Select className="bg-light border-0 py-3 rounded-pill" onChange={(e) => setFilter({...filter, area: e.target.value})}>
                                <option value="">Tất cả</option>
                                <option value="Liên Chiểu">Q. Liên Chiểu</option>
                                <option value="Hải Châu">Q. Hải Châu</option>
                                <option value="Sơn Trà">Q. Sơn Trà</option>
                                <option value="Ngũ Hành Sơn">Q. Ngũ Hành Sơn</option>
                                <option value="Cẩm Lệ">Q. Cẩm Lệ</option>
                                <option value="Hòa Vang">H. Hòa Vang</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <label className="fw-bold small text-muted mb-1">Mức giá</label>
                            <Form.Select className="bg-light border-0 py-3 rounded-pill" onChange={(e) => setFilter({...filter, price: e.target.value})}>
                                <option value="">Tất cả</option>
                                <option value="1">Dưới 3 triệu</option>
                                <option value="2">3 - 5 triệu</option>
                                <option value="3">Trên 5 triệu</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" className="w-100 fw-bold py-3 rounded-pill shadow-sm btn-glow">
                                <i className="bi bi-search me-2"></i>Tìm Kiếm
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* === DANH SÁCH DỰ ÁN (HIỆN LẦN LƯỢT) === */}
                <div className="d-flex justify-content-between align-items-center mb-4 animate-up delay-2">
                    <h4 className="fw-bold text-dark border-start border-5 border-primary ps-3">
                        Kết quả: <span className="text-primary">{filteredProjects.length}</span> dự án
                    </h4>
                </div>

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    <Row className="g-4">
                        {filteredProjects.length > 0 ? filteredProjects.map((item, index) => (
                            // Thêm style animationDelay dựa vào index để các ô hiện lần lượt
                            <Col lg={4} md={6} key={item.id} className="animate-up" style={{ animationDelay: `${0.1 + (index * 0.1)}s` }}>
                                <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden card-hover bg-white">
                                    <div className="position-relative">
                                        {/* Gọi hàm lấy ảnh an toàn */}
                                        <Card.Img 
                                            variant="top" 
                                            src={getProjectImage(item, index)} 
                                            style={{ height: '240px', objectFit: 'cover' }} 
                                            className="img-zoom"
                                        />
                                        
                                        <Badge bg="dark" className="position-absolute top-0 start-0 m-3 px-3 py-2 shadow-sm bg-opacity-75 backdrop-blur">
                                            <i className="bi bi-geo-alt-fill me-1"></i> {item.khu_vuc}
                                        </Badge>

                                        {item.trang_thai === 'trong' && 
                                            <Badge bg="success" className="position-absolute top-0 end-0 m-3 px-3 py-2 shadow-sm">
                                                Mở bán
                                            </Badge>
                                        }
                                    </div>

                                    <Card.Body className="p-4 d-flex flex-column">
                                        <h5 className="fw-bold text-dark mb-2 text-truncate" title={item.ten_du_an || item.ten_can_ho}>
                                            {item.ten_du_an || item.ten_can_ho}
                                        </h5>
                                        {item.ten_du_an && <p className="text-muted small mb-3">{item.ten_can_ho}</p>}
                                        
                                        <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                            <h5 className="text-primary fw-bold mb-0">{formatMoney(item.gia)}</h5>
                                            <Link to={`/du-an/${item.id}`} className="btn btn-outline-primary fw-bold rounded-pill btn-sm px-3">
                                                Xem Chi Tiết
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )) : (
                            <div className="text-center w-100 py-5 animate-up">
                                <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="80" className="opacity-50 mb-3" alt="empty"/>
                                <h5 className="text-muted">Không tìm thấy dự án phù hợp</h5>
                                <Button variant="link" onClick={() => setFilter({ keyword: '', price: '', area: '' })}>Xóa bộ lọc</Button>
                            </div>
                        )}
                    </Row>
                )}
            </Container>

            {/* CSS ANIMATION & STYLE */}
            <style>{`
                /* 1. Animation Keyframes */
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* 2. Classes áp dụng Animation */
                .animate-up {
                    opacity: 0; /* Mặc định ẩn để chờ chạy animation */
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-down {
                    opacity: 0;
                    animation: fadeInDown 0.8s ease-out forwards;
                }
                
                /* Độ trễ cho từng phần tử */
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.4s; }

                /* 3. Hiệu ứng Card Hover */
                .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .card-hover:hover { transform: translateY(-10px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
                
                .img-zoom { transition: transform 0.5s ease; }
                .card-hover:hover .img-zoom { transform: scale(1.1); }

                /* 4. Các tiện ích khác */
                .glass-effect {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                }
                .backdrop-blur { backdrop-filter: blur(4px); }
                .btn-glow:hover { box-shadow: 0 0 15px #0d6efd; transform: translateY(-2px); transition: 0.3s; }
            `}</style>
        </div>
    );
};

export default ProjectList;