import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Table, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Đảm bảo đã import API

const UserRequests = () => {
    const [history, setHistory] = useState([]);
    const [formData, setFormData] = useState({ tieu_de: '', loai: 'Sửa chữa / Bảo trì', noi_dung: '' });
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. LẤY LỊCH SỬ PHẢN ÁNH CỦA TÔI ---
    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            // Dùng route /phan-anh/my (đã có trong routes/phan_anh.route.js)
            const res = await api.get('/phan-anh/my');
            if (res.data.success) {
                // Sắp xếp theo ngày mới nhất
                setHistory(res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
            }
        } catch (error) {
            toast.error("Không tải được lịch sử phản ánh.");
            setHistory([]); // Vẫn giữ mảng rỗng nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- 2. GỬI PHẢN ÁNH MỚI ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/phan-anh', formData);
            toast.success("Đã gửi phản ánh thành công! BQL sẽ sớm xử lý.");
            setFormData({ tieu_de: '', loai: 'Sửa chữa / Bảo trì', noi_dung: '' }); // Reset form
            fetchMyRequests(); // Tải lại lịch sử sau khi gửi
        } catch (error) {
            toast.error("Gửi thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm chuyển đổi trạng thái (cho hiển thị)
    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning" text="dark" className="px-2 py-1">Đang chờ</Badge>;
            case 'in_progress':
                return <Badge bg="info" className="px-2 py-1">Đang xử lý</Badge>;
            case 'resolved':
                return <Badge bg="success" className="px-2 py-1">Đã hoàn tất</Badge>;
            default:
                return <Badge bg="secondary" className="px-2 py-1">Mới</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <Container>
            <h3 className="fw-bold text-dark mb-4">Phản ánh & Yêu cầu</h3>

            <Row className="g-4">
                {/* 1. FORM GỬI YÊU CẦU */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-primary text-white fw-bold py-3">
                            <i className="bi bi-send-plus me-2"></i> Gửi yêu cầu mới
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Loại yêu cầu</Form.Label>
                                    <Form.Select 
                                        name="loai"
                                        value={formData.loai}
                                        onChange={handleChange}
                                    >
                                        <option>Sửa chữa / Bảo trì</option>
                                        <option>Khiếu nại an ninh / Tiếng ồn</option>
                                        <option>Đăng ký dịch vụ (Thẻ xe, Internet)</option>
                                        <option>Khác</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Tiêu đề</Form.Label>
                                    <Form.Control 
                                        name="tieu_de"
                                        placeholder="Ví dụ: Hỏng đèn hành lang" 
                                        required 
                                        value={formData.tieu_de}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold">Nội dung chi tiết</Form.Label>
                                    <Form.Control 
                                        as="textarea" rows={5} 
                                        name="noi_dung"
                                        placeholder="Mô tả chi tiết vấn đề..." 
                                        required
                                        value={formData.noi_dung}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Button type="submit" variant="primary" className="w-100 fw-bold shadow-sm" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner size="sm" animation="border" /> : "GỬI NGAY"}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* 2. LỊCH SỬ YÊU CẦU */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h6 className="mb-0 fw-bold text-primary"><i className="bi bi-clock-history me-2"></i> Lịch sử phản ánh của tôi</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading ? (
                                <div className="text-center py-5"><Spinner animation="border" size="sm" /> Đang tải...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-5 text-muted">Bạn chưa gửi yêu cầu nào.</div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="mb-0 align-middle">
                                        <thead className="bg-light">
                                            <tr>
                                                <th className="ps-4">Tiêu đề</th>
                                                <th>Phân loại</th>
                                                <th>Ngày gửi</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map(item => (
                                                <tr key={item.id}>
                                                    <td className="ps-4 fw-bold text-dark">{item.tieu_de}</td>
                                                    <td><Badge bg="light" text="dark" className="border">{item.loai}</Badge></td>
                                                    <td className="text-muted small">{formatDate(item.created_at)}</td>
                                                    <td>{getStatusBadge(item.trang_thai)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserRequests;