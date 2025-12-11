import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Carousel, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const navigate = useNavigate();
    const [searchKey, setSearchKey] = useState('');

    // State lưu danh sách dự án từ API
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);

    // --- 1. GỌI API LẤY DỮ LIỆU THẬT (ĐÃ FIX LỖI SLICE) ---
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Gọi API backend
                const res = await axios.get('http://localhost:8080/api/can-ho?limit=6');
                
                if (res.data.success) {
                    let realData = [];
                    // [FIX] Kiểm tra kỹ xem dữ liệu trả về là Mảng [] hay Object { rows: [] }
                    // Trường hợp 1: Backend trả về { data: { rows: [...] } }
                    if (res.data.data && Array.isArray(res.data.data.rows)) {
                        realData = res.data.data.rows;
                    } 
                    // Trường hợp 2: Backend trả về { data: [...] }
                    else if (Array.isArray(res.data.data)) {
                        realData = res.data.data;
                    }

                    // Map dữ liệu sang format hiển thị của giao diện
                    if (realData.length > 0) {
                        const formattedData = realData.map(item => ({
                            id: item.id,
                            // Ưu tiên hiện Tên Dự Án, nếu không có thì hiện Tên Căn Hộ
                            name: item.ten_du_an || item.ten_can_ho || "Dự án đang cập nhật",
                            loc: item.dia_chi_du_an || item.khu_vuc || "Đà Nẵng",
                            // Format giá tiền
                            price: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.gia),
                            // Nếu DB chưa có ảnh, dùng ảnh mẫu random để không bị lỗi
                            img: item.hinh_anh || `https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&seed=${item.id}`,
                            // Tạo mô tả ngắn
                            desc: `Căn hộ ${item.ten_can_ho}, Diện tích ${item.dien_tich}m², Tầng ${item.tang || 1}, ${item.so_phong || 1} Phòng ngủ.`,
                            // Lưu dữ liệu gốc để hiển thị chi tiết
                            fullData: item 
                        }));
                        setProjects(formattedData);
                    }
                }
            } catch (error) {
                console.error("Lỗi kết nối API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // --- DỮ LIỆU TĨNH (GIỮ NGUYÊN NHƯ CŨ) ---
    const newsList = [
        { 
            id: 1, title: "Hướng dẫn làm hồ sơ chứng minh thu nhập mới nhất 2025", date: "10/12", 
            content: "Theo Nghị định 100/2024/NĐ-CP, người lao động tự do cần xin xác nhận của UBND cấp xã nơi cư trú về việc không có thu nhập thường xuyên chịu thuế. Đối với người lao động có HĐLĐ, cần xác nhận lương của đơn vị công tác trong 6 tháng gần nhất." 
        },
        { 
            id: 2, title: "Danh sách các ngân hàng hỗ trợ gói vay 4.8%", date: "09/12", 
            content: "Gói tín dụng 120.000 tỷ đồng hiện đang được triển khai tại 4 ngân hàng quốc doanh: Agribank, BIDV, Vietcombank, Vietinbank với lãi suất ưu đãi 4.8%/năm trong 5 năm đầu tiên." 
        },
        { 
            id: 3, title: "Cảnh báo lừa đảo môi giới suất mua NOXH", date: "08/12", 
            content: "Sở Xây dựng Đà Nẵng khuyến cáo người dân KHÔNG nộp tiền cọc, tiền giữ chỗ cho các sàn giao dịch không chính thống. Mọi thủ tục đăng ký phải thực hiện trực tiếp với Chủ đầu tư hoặc qua Cổng thông tin điện tử." 
        },
        { 
            id: 4, title: "Tiến độ thi công dự án Blue Sky tháng 12", date: "07/12", 
            content: "Cập nhật tiến độ: Tòa CT1 đã cất nóc và đang hoàn thiện mặt ngoài. Tòa CT2 đang thi công sàn tầng 15. Hệ thống cảnh quan cây xanh đang được trồng mới." 
        },
    ];

    const faqs = [
        { q: "Điều kiện thu nhập để mua nhà ở xã hội?", a: "Người mua phải không thuộc diện nộp thuế thu nhập cá nhân thường xuyên (thu nhập dưới 11 triệu đồng/tháng sau khi giảm trừ gia cảnh)." },
        { q: "Đối tượng nào được ưu tiên mua NOXH?", a: "Ưu tiên cho người có công với cách mạng, người thu nhập thấp, hộ nghèo, cận nghèo, người lao động đang làm việc tại các doanh nghiệp trong và ngoài khu công nghiệp..." },
        { q: "Lãi suất vay mua NOXH hiện nay là bao nhiêu?", a: "Hiện tại lãi suất vay ưu đãi tại Ngân hàng Chính sách xã hội là 4.8%/năm." },
        { q: "Hồ sơ đăng ký mua NOXH cần những gì?", a: "Bao gồm: Đơn đăng ký, giấy tờ chứng minh đối tượng, điều kiện cư trú, điều kiện thu nhập, và giấy tờ chứng minh chưa có nhà ở." },
        { q: "Thời hạn xét duyệt hồ sơ là bao lâu?", a: "Thời gian xét duyệt hồ sơ thường từ 15-30 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ." },
        { q: "Tôi có thể bán lại NOXH sau khi mua không?", a: "Theo quy định, người mua NOXH không được phép chuyển nhượng nhà ở trong thời gian 05 năm, kể từ thời điểm trả hết tiền mua nhà." },
        { q: "Dự án NOXH nào đang mở bán tại Đà Nẵng?", a: "Bạn có thể xem danh sách các dự án đang mở bán tại mục 'Dự án' trên trang web của chúng tôi." },
        { q: "Tôi có thể đăng ký mua NOXH trực tuyến được không?", a: "Hoàn toàn có thể. Hệ thống của chúng tôi hỗ trợ nộp hồ sơ và theo dõi kết quả xét duyệt trực tuyến." },
        { q: "Nếu không đủ điều kiện mua, tôi có thể thuê NOXH không?", a: "Có. Ngoài việc bán, nhiều dự án NOXH cũng dành một phần quỹ nhà để cho thuê với giá ưu đãi." }
    ];

    const experts = Array(6).fill(null).map((_, i) => ({
        n: `Chuyên gia ${i+1}`, c: "Đây là dự án kiểu mẫu về quy hoạch và chất lượng xây dựng. Mật độ cây xanh lớn giúp cải thiện chất lượng sống cho cư dân.", img: `https://randomuser.me/api/portraits/men/${i+20}.jpg`
    }));

    // Chia nhóm slide
    const chunkArray = (arr, size) => {
        const res = [];
        for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
        return res;
    };
    const expertChunks = chunkArray(experts, 3);
    const faqChunks = chunkArray(faqs, 3);

    // --- ACTIONS ---
    const handleSearch = () => { if (searchKey) navigate(`/du-an?search=${searchKey}`); };
    const handleOpenProject = (p) => { setSelectedProject(p); setShowProjectModal(true); };
    const handleOpenNews = (n) => { setSelectedNews(n); setShowNewsModal(true); };

    return (
        <div style={{ backgroundColor: '#fff', overflowX: 'hidden' }}>

            {/* 1. BANNER SLIDE (7s) */}
            <Carousel fade interval={7000} controls={false} indicators={true} pause={false}>
                {[
                    'https://betaviet.vn/wp-content/uploads/2024/11/thiet-ke-biet-thu-3-tang-phong-cach-hien-dai-luxury-kt23301-3.jpg',
                    'https://betaviet.vn/wp-content/uploads/2024/08/thiet-ke-biet-thu-han-quoc-hien-dai-2000m2-co-be-boi-tai-ha-noi-kt22010-5.jpg',
                    'https://betaviet.vn/wp-content/uploads/2024/12/thiet-ke-kien-truc-biet-thu-hien-dai-luxury-tai-thai-binh-kt9188719-1.jpg'
                ].map((img, i) => (
                    <Carousel.Item key={i} style={{ height: '90vh' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }}></div>
                        <img className="d-block w-100 h-100 animate-zoom" src={img} style={{ objectFit: 'cover' }} alt={`slide-${i}`} />
                        <Carousel.Caption className="d-flex flex-column justify-content-center align-items-center h-100" style={{ zIndex: 2, paddingBottom: '80px' }}>
                            <h5 className="text-uppercase ls-2 mb-3 fw-bold text-info animate-down">CỔNG THÔNG TIN CHÍNH THỨC</h5>
                            <h1 className="display-2 fw-black mb-4 text-uppercase animate-up text-shadow text-center">KIẾN TẠO TỔ ẤM VIỆT</h1>
                        </Carousel.Caption>
                    </Carousel.Item>
                ))}
            </Carousel>

            {/* 2. THANH TÌM KIẾM */}
            <div className="container position-relative" style={{ marginTop: '-40px', zIndex: 10 }}>
                <div className="bg-white p-4 rounded-4 shadow-lg mx-auto d-flex gap-2 align-items-center animate-up delay-1" style={{ maxWidth: '900px' }}>
                    <Form.Control
                        placeholder="Nhập tên dự án, khu vực..."
                        className="border-0 bg-light py-3 px-4 rounded-pill flex-grow-1 shadow-none"
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                    />
                    <Button variant="primary" className="py-3 px-5 fw-bold rounded-pill btn-gradient" onClick={handleSearch}>
                        TÌM KIẾM
                    </Button>
                </div>
            </div>

            {/* 3. DỰ ÁN (HIỂN THỊ DỮ LIỆU TỪ API) */}
            <section className="py-5 mt-4 bg-white">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-primary text-uppercase">Dự án Đang Mở Hồ Sơ</h2>
                        <div className="divider mx-auto bg-primary"></div>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="text-muted mt-2">Đang tải danh sách dự án...</p>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {projects.length > 0 ? projects.map((p) => (
                                <Col md={4} key={p.id}>
                                    <Card className="border-0 shadow-sm h-100 card-hover rounded-4 overflow-hidden">
                                        <div className="position-relative">
                                            <Card.Img variant="top" src={p.img} style={{ height: '240px', objectFit: 'cover' }} />
                                            <Badge bg="success" className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill">Đang nhận hồ sơ</Badge>
                                        </div>
                                        <Card.Body className="p-4">
    {/* Tên dự án */}
    <Card.Title className="fw-bold text-dark text-truncate" title={p.name}>
        <i className="bi bi-building-fill text-primary me-2 opacity-50"></i>{p.name}
    </Card.Title>

    {/* Địa chỉ có icon */}
    <p className="text-muted small mb-3">
        <i className="bi bi-geo-alt-fill text-danger me-1"></i> {p.loc}
    </p>

    {/* --- [MỚI] Dải thông tin chi tiết có Icon --- */}
    <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded-3 small">
        <span title="Diện tích" className="fw-bold text-secondary">
            <i className="bi bi-arrows-fullscreen text-info me-1"></i> 
            {p.fullData?.dien_tich || 0} m²
        </span>
        <span title="Số phòng ngủ" className="fw-bold text-secondary">
            <i className="bi bi-door-open-fill text-warning me-1"></i> 
            {p.fullData?.so_phong || 1} PN
        </span>
        <span title="Tầng" className="fw-bold text-secondary">
            <i className="bi bi-layers-fill text-success me-1"></i> 
            T{p.fullData?.tang || 1}
        </span>
    </div>

    {/* Giá tiền */}
    <h5 className="text-primary fw-bold mb-3">
        {p.price} <small className="fs-6 text-muted fw-normal">/tháng</small>
    </h5>

    {/* Nút bấm có mũi tên */}
    <Button variant="outline-primary" className="w-100 rounded-pill fw-bold shadow-sm" onClick={() => handleOpenProject(p)}>
        Xem chi tiết <i className="bi bi-arrow-right-short fs-5 align-middle"></i>
    </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )) : (
                                <div className="text-center w-100 py-5">
                                    <img src="https://cdn-icons-png.flaticon.com/512/7486/7486744.png" width="80" alt="empty" className="mb-3 opacity-50"/>
                                    <h5 className="text-muted">Chưa có dữ liệu dự án</h5>
                                    <p className="small text-muted">Vui lòng kiểm tra lại kết nối Database hoặc thêm dữ liệu mới.</p>
                                </div>
                            )}
                        </Row>
                    )}
                    <div className="text-center mt-5">
                        <Button variant="dark" className="px-5 py-3 rounded-pill fw-bold" onClick={() => navigate('/du-an')}>Tất cả dự án <i className="bi bi-arrow-right ms-2"></i></Button>
                    </div>
                </Container>
            </section>

            {/* 4. TIN TỨC */}
            <section className="py-5 bg-light">
                <Container>
                    <h2 className="fw-bold mb-5 border-start border-5 border-primary ps-3 text-uppercase">Tin tức & Sự kiện</h2>
                    <Row className="g-4">
                        {/* 4 Tin nhỏ bên trái */}
                        <Col lg={5}>
                            <div className="d-flex flex-column gap-3">
                                {newsList.map((n) => (
                                    <div className="d-flex align-items-center bg-white p-3 rounded-4 shadow-sm card-hover cursor-pointer" key={n.id} onClick={() => handleOpenNews(n)}>
                                        <div className="bg-primary bg-opacity-10 text-primary rounded-3 px-3 py-2 text-center me-3 d-flex flex-column justify-content-center" style={{ minWidth: '70px', height: '60px' }}>
                                            <small className="d-block fw-bold lh-1">{n.date.split('/')[0]}</small>
                                            <small className="d-block lh-1">T{n.date.split('/')[1]}</small>
                                        </div>
                                        <h6 className="mb-0 fw-bold hover-text-primary line-clamp-2">{n.title}</h6>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        {/* 1 Tin lớn bên phải */}
                        <Col lg={7}>
                            <Card className="border-0 shadow-sm h-100 rounded-4 overflow-hidden text-white card-hover cursor-pointer"
                                onClick={() => handleOpenNews({ title: "Lễ công bố danh sách 500 hộ dân...", content: "Ngày 15/12 vừa qua, Sở Xây dựng đã chính thức phê duyệt và công bố danh sách 500 hộ gia đình đủ điều kiện mua nhà đợt 1..." })}>
                                <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800" className="w-100 h-100 object-fit-cover img-zoom" alt="big-news" />
                                <div className="card-img-overlay d-flex flex-column justify-content-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                                    <Badge bg="warning" text="dark" className="align-self-start mb-3 px-3 py-2 rounded-pill">Tiêu điểm</Badge>
                                    <h3 className="fw-bold text-shadow">Lễ công bố danh sách 500 hộ dân được duyệt mua nhà đợt 1</h3>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 5. HỒ SƠ PARALLAX */}
            <section className="py-5 position-relative text-white" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000")',
                backgroundAttachment: 'fixed', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '500px', display: 'flex', alignItems: 'center'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(33, 37, 41, 0.85)', zIndex: 1 }}></div>
                <Container className="position-relative" style={{ zIndex: 2 }}>
                    <Row className="align-items-center justify-content-between">
                        <Col lg={7} className="mb-4 mb-lg-0">
                            <h2 className="fw-bold display-5 mb-4">HỒ SƠ XÉT DUYỆT ONLINE</h2>
                            <p className="lead opacity-90 mb-5">Hệ thống nộp hồ sơ trực tuyến giúp bạn tiết kiệm thời gian và theo dõi kết quả dễ dàng.</p>
                            <div className="d-flex flex-column flex-md-row gap-4">
                                <div className="d-flex align-items-center glass-effect p-3 rounded-pill pe-4">
                                    <i className="bi bi-1-circle-fill fs-3 me-3 text-warning"></i> <span className="fw-bold">Tải Mẫu Đơn</span>
                                </div>
                                <div className="d-flex align-items-center glass-effect p-3 rounded-pill pe-4">
                                    <i className="bi bi-2-circle-fill fs-3 me-3 text-warning"></i> <span className="fw-bold">Chuẩn Bị Giấy Tờ</span>
                                </div>
                                <div className="d-flex align-items-center glass-effect p-3 rounded-pill pe-4">
                                    <i className="bi bi-3-circle-fill fs-3 me-3 text-warning"></i> <span className="fw-bold">Nộp Online</span>
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="text-center">
                            <Card className="bg-transparent border-0">
                                <Card.Body className="p-0">
                                    <Button variant="warning" size="lg" className="rounded-pill px-5 py-4 fw-bold shadow-lg w-100 fs-5 btn-glow" onClick={() => navigate('/nop-ho-so')}>
                                        NỘP HỒ SƠ NGAY <i className="bi bi-arrow-up-right-circle-fill ms-2"></i>
                                    </Button>
                                    <p className="text-white-50 mt-3 small">Bảo mật thông tin tuyệt đối</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* 6. FAQ */}
            <section className="py-5 bg-white">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-primary text-uppercase">CÂU HỎI THƯỜNG GẶP</h2>
                        <div className="divider mx-auto bg-primary"></div>
                    </div>
                    <Carousel indicators={false} interval={5000} variant="dark" controls={true} className="faq-carousel pb-3">
                        {faqChunks.map((chunk, idx) => (
                            <Carousel.Item key={idx}>
                                <Row className="g-4 justify-content-center px-5">
                                    {chunk.map((f, i) => (
                                        <Col md={4} key={i}>
                                            <Card className="border-0 shadow-sm h-100 rounded-4 card-hover bg-light">
                                                <Card.Body className="p-4 text-center">
                                                    <i className="bi bi-question-circle-fill fs-1 text-primary mb-3 d-block"></i>
                                                    <h6 className="fw-bold mb-3">{f.q}</h6>
                                                    <p className="text-muted small mb-0">{f.a}</p>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Container>
            </section>

            {/* 7. CHUYÊN GIA */}
            <section className="py-5 bg-light">
                <Container>
                    <div className="text-center mb-5">
                        <h2 className="fw-bold text-dark text-uppercase">GÓC CHUYÊN GIA</h2>
                        <div className="divider mx-auto bg-dark"></div>
                    </div>
                    <Carousel indicators={true} interval={6000} variant="dark" controls={true} className="feedback-carousel pb-5">
                        {expertChunks.map((chunk, idx) => (
                            <Carousel.Item key={idx}>
                                <Row className="g-4 justify-content-center px-5">
                                    {chunk.map((ex, i) => (
                                        <Col md={4} key={i}>
                                            <Card className="border-0 shadow-sm h-100 p-4 rounded-4 card-hover bg-white text-center">
                                                <img src={ex.img} className="rounded-circle mb-3 border shadow-sm mx-auto" width="70" height="70" alt="expert" />
                                                <h6 className="fw-bold mb-1">{ex.n}</h6>
                                                <div className="text-warning small mb-3">
                                                    <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                                                </div>
                                                <p className="text-muted fst-italic small mb-0">"{ex.c}"</p>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </Container>
            </section>

            {/* 8. SLOGAN */}
            <section className="py-4 text-white text-center" style={{ background: 'linear-gradient(90deg, #0d6efd, #0dcaf0)' }}>
                <Container>
                    <h4 className="fw-bold m-0 text-uppercase ls-1"><i className="bi bi-shield-check me-2"></i> MINH BẠCH - CÔNG BẰNG - ĐÚNG ĐỐI TƯỢNG</h4>
                </Container>
            </section>

            {/* --- MODAL CHI TIẾT DỰ ÁN --- */}
            <Modal show={showProjectModal} onHide={() => setShowProjectModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-primary">{selectedProject?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <img src={selectedProject?.img} className="w-100 rounded mb-3" style={{ height: '300px', objectFit: 'cover' }} alt={selectedProject?.name} />
                    <h5 className="fw-bold">Thông tin chi tiết:</h5>
                    <p>{selectedProject?.desc}</p>
                    <ul className="text-muted">
                        <li><strong>Vị trí:</strong> {selectedProject?.loc}</li>
                        <li><strong>Giá tham khảo:</strong> {selectedProject?.price}</li>
                        <li><strong>Pháp lý:</strong> Sổ hồng lâu dài</li>
                        {/* Hiển thị thêm thông tin nếu có */}
                        {selectedProject?.fullData?.so_phong && <li><strong>Số phòng:</strong> {selectedProject.fullData.so_phong}</li>}
                        {selectedProject?.fullData?.dien_tich && <li><strong>Diện tích:</strong> {selectedProject.fullData.dien_tich}m²</li>}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowProjectModal(false)}>Đóng</Button>
                    <Button variant="warning" className="fw-bold" onClick={() => navigate('/nop-ho-so')}>Đăng Ký Hồ Sơ Ngay</Button>
                </Modal.Footer>
            </Modal>

            {/* --- MODAL TIN TỨC --- */}
            <Modal show={showNewsModal} onHide={() => setShowNewsModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="fw-bold text-dark">{selectedNews?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-3"><i className="bi bi-calendar3 me-2"></i> {selectedNews?.date}/2025</p>
                    <div className="bg-light p-4 rounded-3 text-justify">
                        {selectedNews?.content}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNewsModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* CSS */}
            <style>{`
                .text-shadow { text-shadow: 0 4px 10px rgba(0,0,0,0.5); }
                .divider { height: 4px; width: 60px; border-radius: 2px; margin-top: 10px; margin-bottom: 10px; }
                .hover-text-primary:hover { color: #0d6efd !important; }
                .img-zoom { transition: transform 0.5s; }
                .card-hover:hover .img-zoom { transform: scale(1.05); }
                .animate-zoom { animation: zoomBg 20s infinite alternate; }
                @keyframes zoomBg { from {transform: scale(1);} to {transform: scale(1.1);} }
                .btn-gradient { background: linear-gradient(90deg, #0d6efd, #0dcaf0); border: 0; transition: transform 0.3s; }
                .btn-gradient:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(13, 110, 253, 0.4); }
                .card-hover { transition: all 0.3s ease; }
                .card-hover:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
                .cursor-pointer { cursor: pointer; }
                .ls-1 { letter-spacing: 1px; }
                .ls-2 { letter-spacing: 2px; }
                .lh-1 { line-height: 1; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .glass-effect { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); transition: background 0.3s; }
                .glass-effect:hover { background: rgba(255, 255, 255, 0.2); }
                .btn-glow { animation: glow 2s infinite alternate; }
                @keyframes glow { from { box-shadow: 0 0 10px -5px #ffc107; } to { box-shadow: 0 0 25px -5px #ffc107; } }
                
                /* FIX MŨI TÊN CAROUSEL */
                .faq-carousel .carousel-control-prev-icon, .faq-carousel .carousel-control-next-icon,
                .feedback-carousel .carousel-control-prev-icon, .feedback-carousel .carousel-control-next-icon {
                    filter: invert(1); /* Màu đen */
                    background-color: transparent;
                }
                .faq-carousel .carousel-control-prev, .feedback-carousel .carousel-control-prev { left: -60px; width: 5%; opacity: 1; }
                .faq-carousel .carousel-control-next, .feedback-carousel .carousel-control-next { right: -60px; width: 5%; opacity: 1; }
            `}</style>
        </div>
    );
};

export default HomePage;