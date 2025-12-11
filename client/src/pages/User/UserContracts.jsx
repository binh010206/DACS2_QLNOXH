import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button, ListGroup, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import Swal from 'sweetalert2';

const UserContracts = () => {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    // 1. Lấy dữ liệu hợp đồng
    useEffect(() => {
        api.get('/users/my-contract').then(res => {
            if(res.data.success) {
                setContract(res.data.data);
            }
        }).catch(e => console.error(e))
        .finally(() => setLoading(false));
    }, []);

    // 2. Xử lý In Hợp Đồng (Tái sử dụng mẫu đã code cho Admin)
    const handlePrint = (c) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Hợp Đồng - ${c.chu_ho}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; font-size: 13pt; }
                    h3, h4 { margin: 0; text-align: center; text-transform: uppercase; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .bold { font-weight: bold; }
                    .section { margin-bottom: 15px; }
                    .sign { display: flex; justify-content: space-between; margin-top: 50px; }
                    .sign div { text-align: center; width: 45%; }
                </style>
            </head>
            <body>
                <div class="header">
                    <p style="margin:0">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p style="margin:0; text-decoration: underline;">Độc lập - Tự do - Hạnh phúc</p>
                </div>
                
                <p style="text-align: right; font-style: italic;">Số: ${c.id}/HĐ-NOXH/2025</p>
                
                <div class="section">
                    <span class="bold">BÊN CHO THUÊ (BÊN A): BAN QUẢN LÝ DỰ ÁN DEKA BUILDING</span><br>
                    Địa chỉ: 470 Trần Đại Nghĩa, Ngũ Hành Sơn, Đà Nẵng.<br>
                    Điện thoại: 1900 1080
                </div>

                <div class="section">
                    <span class="bold">BÊN THUÊ (BÊN B): ÔNG/BÀ ${c.chu_ho.toUpperCase()}</span><br>
                    Điện thoại: ${c.phone || '....................'}<br>
                    Email: ${c.email}
                </div>

                <h3 style="margin: 20px 0;">HỢP ĐỒNG THUÊ NHÀ Ở XÃ HỘI</h3>

                <div class="section">
                    <span class="bold">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</span><br>
                    Bên A đồng ý cho Bên B thuê căn hộ nhà ở xã hội thuộc sở hữu nhà nước với chi tiết sau:<br>
                    - Căn hộ số: <span class="bold">${c.ten_can_ho}</span><br>
                    - Diện tích: ${c.dien_tich} m²<br>
                    - Địa chỉ: ${c.dia_chi_du_an}
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 2: GIÁ THUÊ VÀ THỜI HẠN</span><br>
                    - Giá thuê: <span class="bold">${formatCurrency(c.gia)}/tháng</span><br>
                    - Thời hạn thuê: <span class="bold">05 năm</span><br>
                    - Từ ngày: ${new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN')} đến ngày ${new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 3: CAM KẾT</span><br>
                    Bên B cam kết sử dụng căn hộ đúng mục đích để ở, không chuyển nhượng, cho thuê lại dưới mọi hình thức.
                    Nếu vi phạm, Bên A có quyền đơn phương chấm dứt hợp đồng và thu hồi căn hộ.
                </div>

                <div class="sign">
                    <div>
                        <span class="bold">ĐẠI DIỆN BÊN B</span><br>
                        (Ký, ghi rõ họ tên)<br><br><br><br>
                        ${c.chu_ho}
                    </div>
                    <div>
                        <span class="bold">ĐẠI DIỆN BÊN A</span><br>
                        (Ký, đóng dấu)<br><br><br><br>
                        GIÁM ĐỐC BQL
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;
    
    // Nếu không có hợp đồng
    if (!contract) return (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5 mt-4">
            <h4 className="text-primary fw-bold">CHƯA CÓ HỢP ĐỒNG NÀO HIỆU LỰC</h4>
            <p className="text-muted">Vui lòng kiểm tra lại hồ sơ đăng ký hoặc liên hệ Ban Quản lý.</p>
        </Card>
    );

    return (
        <Container fluid className="p-0 animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0">Hợp đồng thuê nhà</h3>
                <Button variant="primary" size="sm" className="rounded-pill px-3 fw-bold shadow-sm" onClick={() => handlePrint(contract)}>
                    <i className="bi bi-printer me-2"></i> In Hợp Đồng
                </Button>
            </div>

            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                <Card.Body className="p-5">
                    {/* Header Hợp đồng */}
                    <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-4">
                        <div>
                            <h5 className="fw-bold text-primary mb-1">CĂN HỘ: {contract.ten_can_ho}</h5>
                            <small className="text-muted">Mã Hợp Đồng: HD-{contract.id}/NOXH/2025</small>
                        </div>
                        <Badge bg="success" className="px-3 py-2 text-uppercase fw-bold shadow-sm">
                            <i className="bi bi-check-circle-fill me-1"></i> Đang hiệu lực
                        </Badge>
                    </div>

                    <Row className="g-4">
                        {/* Cột trái: Thông tin chính */}
                        <Col md={6}>
                            <h6 className="fw-bold text-muted mb-3 text-uppercase small border-bottom pb-2">Thông tin tài chính & căn hộ</h6>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="px-0 d-flex justify-content-between bg-white">
                                    <span>Giá thuê:</span> <strong className="text-danger">{formatCurrency(contract.gia)}/tháng</strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between bg-white">
                                    <span>Diện tích:</span> <strong>{contract.dien_tich} m²</strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between bg-white">
                                    <span>Khu vực:</span> <strong>{contract.khu_vuc}</strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="px-0 d-flex justify-content-between bg-white">
                                    <span>Địa chỉ chi tiết:</span> <strong>{contract.dia_chi_du_an}</strong>
                                </ListGroup.Item>
                            </ListGroup>
                        </Col>

                        {/* Cột phải: Thời hạn */}
                        <Col md={6}>
                            <h6 className="fw-bold text-muted mb-3 text-uppercase small border-bottom pb-2">Thời hạn hợp đồng</h6>
                            <div className="bg-light p-3 rounded-3 border">
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span className="text-dark fw-bold">Người đứng tên:</span>
                                    <span className="fw-bold text-primary">{contract.chu_ho}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span>Ngày ký:</span>
                                    <span className="fw-bold">{new Date(contract.ngay_ky).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 small">
                                    <span>Ngày hết hạn:</span>
                                    <span className="fw-bold text-danger">{new Date(contract.ngay_ket_thuc).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="d-flex justify-content-between small">
                                    <span>Tổng thời gian:</span>
                                    <span className="fw-bold text-success">5 Năm</span>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h6 className="fw-bold text-muted mb-2 text-uppercase small">Lưu ý quan trọng</h6>
                                <ul className="small text-dark ps-3">
                                    <li>Thời hạn thuê là 5 năm, không được gia hạn thêm.</li>
                                    <li>Không được chuyển nhượng hoặc cho thuê lại.</li>
                                    <li>Vi phạm điều khoản có thể dẫn đến chấm dứt hợp đồng ngay lập tức.</li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
                <Card.Footer className="bg-white text-center py-3 text-muted small border-0">
                    Bạn có thể tải bản PDF chính thức từ Ban Quản Lý (Tính năng đang phát triển).
                </Card.Footer>
            </Card>
        </Container>
    );
};

export default UserContracts;