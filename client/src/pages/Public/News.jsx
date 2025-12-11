import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Modal, Button } from 'react-bootstrap';

const News = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);

    const newsData = [
        { id: 1, title: "Lễ động thổ dự án NOXH Hòa Khánh Bắc quy mô 2000 căn", date: "10/12/2025", cat: "Sự kiện", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800", content: "Sáng nay, lễ động thổ dự án trọng điểm..." },
        { id: 2, title: "Chính thức giảm lãi suất vay mua nhà xuống còn 4.5%", date: "09/12/2025", cat: "Chính sách", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800", content: "Ngân hàng nhà nước vừa công bố..." },
        { id: 3, title: "Cảnh báo chiêu trò 'cò mồi' suất ngoại giao", date: "08/12/2025", cat: "Cảnh báo", img: "https://i.ex-cdn.com/nhadautu.vn/files/content/2025/12/04/img_2659-1-0820.jpg", content: "Sở Xây dựng khuyến cáo người dân..." },
        { id: 4, title: "Hướng dẫn làm hồ sơ chứng minh thu nhập 2025", date: "07/12/2025", cat: "Hướng dẫn", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800", content: "Chi tiết các bước xin xác nhận..." },
        { id: 5, title: "Bàn giao 500 căn hộ EcoHome đợt 1", date: "05/12/2025", cat: "Tiến độ", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800", content: "Niềm vui của cư dân ngày nhận nhà..." },
        { id: 6, title: "Giải đáp: Độc thân có được mua NOXH?", date: "04/12/2025", cat: "Hỏi đáp", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800", content: "Điều kiện cụ thể cho người độc thân..." },
        { id: 7, title: "Quy định mới về sang nhượng sau 5 năm", date: "03/12/2025", cat: "Luật", img: "https://image3.luatvietnam.vn/uploaded/665twebp/images/original/2025/05/02/ban-nha-o-xa-hoi-sau-5-nam-khong-mat-phi-nao-_0205161227.png", content: "Những thay đổi người dân cần biết..." },
        { id: 8, title: "Top 3 dự án đáng mua nhất Đà Nẵng", date: "02/12/2025", cat: "Review", img: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=800", content: "Đánh giá chi tiết vị trí, giá bán..." },
        { id: 9, title: "Thủ tục vay vốn ngân hàng chính sách", date: "01/12/2025", cat: "Tài chính", img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800", content: "Hồ sơ vay vốn bao gồm..." },
        { id: 10, title: "Hội nghị cư dân chung cư Blue Sky", date: "30/11/2025", cat: "Cộng đồng", img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800", content: "Thảo luận về phí quản lý và tiện ích..." },
    ];

    const openModal = (news) => { setSelectedNews(news); setShowModal(true); };

    return (
        <Container className="py-5" style={{ marginTop: '60px' }}>
            <h2 className="fw-bold text-uppercase border-start border-5 border-primary ps-3 mb-4">Tin Tức Nổi Bật</h2>
            
            {/* Layout Tin Lớn & List */}
            <Row className="mb-5">
                <Col lg={8}>
                    <Card className="border-0 text-white shadow-lg rounded-4 overflow-hidden h-100 cursor-pointer" onClick={() => openModal(newsData[0])}>
                        <Card.Img src={newsData[0].img} className="h-100 object-fit-cover hover-zoom" />
                        <div className="card-img-overlay d-flex flex-column justify-content-end bg-gradient-overlay">
                            <Badge bg="danger" className="align-self-start mb-2">{newsData[0].cat}</Badge>
                            <h3 className="fw-bold">{newsData[0].title}</h3>
                            <p className="small mb-0">{newsData[0].date} - {newsData[0].content.substring(0, 100)}...</p>
                        </div>
                    </Card>
                </Col>
                <Col lg={4}>
                    <div className="d-flex flex-column gap-3 h-100 overflow-auto">
                        {newsData.slice(1, 5).map(news => (
                            <div key={news.id} className="d-flex gap-3 align-items-center p-2 bg-light rounded-3 cursor-pointer hover-shadow" onClick={() => openModal(news)}>
                                <img src={news.img} width="80" height="80" className="rounded object-fit-cover" alt="" />
                                <div>
                                    <Badge bg="secondary" className="mb-1" style={{fontSize:'10px'}}>{news.cat}</Badge>
                                    <h6 className="fw-bold small mb-1 line-clamp-2">{news.title}</h6>
                                    <small className="text-muted" style={{fontSize:'11px'}}>{news.date}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
            </Row>

            {/* Grid Tin Khác */}
            <h4 className="fw-bold mb-4">Tin Tức Mới Nhất</h4>
            <Row className="g-4">
                {newsData.slice(5).map(news => (
                    <Col md={4} key={news.id}>
                        <Card className="h-100 border-0 shadow-sm rounded-4 hover-up cursor-pointer" onClick={() => openModal(news)}>
                            <Card.Img variant="top" src={news.img} height="200" className="object-fit-cover" />
                            <Card.Body>
                                <Badge bg="info" className="mb-2">{news.cat}</Badge>
                                <Card.Title className="fw-bold fs-6">{news.title}</Card.Title>
                                <Card.Text className="small text-muted line-clamp-2">{news.content}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Modal Chi Tiết */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold">{selectedNews?.title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <img src={selectedNews?.img} className="w-100 rounded mb-3" alt="" />
                    <p className="fw-bold text-muted"><i className="bi bi-clock"></i> {selectedNews?.date}</p>
                    <div className="content-body" style={{textAlign: 'justify'}}>
                        <p>{selectedNews?.content} (Nội dung chi tiết bài viết sẽ được hiển thị đầy đủ tại đây. Đây là dữ liệu mẫu mô phỏng hệ thống tin tức điện tử chuyên nghiệp.)</p>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .hover-zoom { transition: transform 0.5s; }
                .card:hover .hover-zoom { transform: scale(1.05); }
                .bg-gradient-overlay { background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .hover-shadow:hover { background: #fff !important; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                .hover-up { transition: transform 0.3s; }
                .hover-up:hover { transform: translateY(-5px); }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </Container>
    );
};

export default News;