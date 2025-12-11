import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

const UserBills = () => {
    const [bills, setBills] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all'); // all, unpaid, paid

    // Dữ liệu giả lập (Sau này gọi API: /hoa-don/my-bills)
    useEffect(() => {
        setBills([
            { id: 101, thang: '12/2025', tien_phong: 3000000, dien: 500000, nuoc: 100000, dich_vu: 150000, tong_tien: 3750000, trang_thai: 'chua_thanh_toan', han_dong: '15/12/2025' },
            { id: 98, thang: '11/2025', tien_phong: 3000000, dien: 420000, nuoc: 90000, dich_vu: 150000, tong_tien: 3660000, trang_thai: 'da_thanh_toan', han_dong: '15/11/2025' },
            { id: 85, thang: '10/2025', tien_phong: 3000000, dien: 380000, nuoc: 85000, dich_vu: 150000, tong_tien: 3615000, trang_thai: 'da_thanh_toan', han_dong: '15/10/2025' },
        ]);
    }, []);

    // Hàm format tiền tệ
    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    // Tính tổng nợ
    const totalUnpaid = bills.filter(b => b.trang_thai === 'chua_thanh_toan').reduce((sum, b) => sum + b.tong_tien, 0);

    // Xử lý thanh toán (Giả lập)
    const handlePayment = (id) => {
        if(window.confirm("Xác nhận thanh toán hóa đơn này qua cổng VNPAY/Momo?")) {
            toast.success("Đang chuyển sang cổng thanh toán...");
            // Thực tế sẽ redirect sang URL thanh toán
        }
    };

    // Lọc hiển thị
    const filteredBills = bills.filter(b => filterStatus === 'all' || b.trang_thai === filterStatus);

    return (
        <Container>
            <h3 className="fw-bold text-dark mb-4">Hóa đơn & Thanh toán</h3>

            {/* 1. THẺ TỔNG QUAN NỢ */}
            <Card className="border-0 shadow-sm bg-primary text-white mb-4">
                <Card.Body className="d-flex justify-content-between align-items-center p-4">
                    <div>
                        <h6 className="opacity-75 mb-1">Tổng tiền cần thanh toán</h6>
                        <h2 className="fw-bold mb-0">{formatCurrency(totalUnpaid)}</h2>
                    </div>
                    {totalUnpaid > 0 ? (
                        <Button variant="light" className="text-primary fw-bold px-4 py-2 rounded-pill shadow-sm" onClick={() => toast.info("Tính năng thanh toán hàng loạt đang phát triển")}>
                            Thanh toán tất cả
                        </Button>
                    ) : (
                        <div className="d-flex align-items-center bg-white bg-opacity-25 px-3 py-2 rounded-pill">
                            <i className="bi bi-check-circle-fill me-2"></i> Không có dư nợ
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* 2. DANH SÁCH HÓA ĐƠN */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3">
                    <Row className="align-items-center">
                        <Col md={6}><h6 className="mb-0 fw-bold text-primary">Lịch sử hóa đơn</h6></Col>
                        <Col md={6}>
                            <div className="d-flex justify-content-md-end gap-2">
                                <Form.Select size="sm" style={{width: '150px'}} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">Tất cả</option>
                                    <option value="chua_thanh_toan">Chưa thanh toán</option>
                                    <option value="da_thanh_toan">Đã thanh toán</option>
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>
                </Card.Header>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Tháng</th>
                                    <th>Chi tiết dịch vụ</th>
                                    <th>Tổng tiền</th>
                                    <th>Hạn đóng</th>
                                    <th>Trạng thái</th>
                                    <th className="text-end pe-4">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.map(item => (
                                    <tr key={item.id}>
                                        <td className="ps-4 fw-bold text-primary">{item.thang}</td>
                                        <td>
                                            <small className="d-block text-muted">Tiền phòng: {formatCurrency(item.tien_phong)}</small>
                                            <small className="d-block text-muted">Điện: {formatCurrency(item.dien)} | Nước: {formatCurrency(item.nuoc)}</small>
                                        </td>
                                        <td className="fw-bold text-danger fs-6">{formatCurrency(item.tong_tien)}</td>
                                        <td>{item.han_dong}</td>
                                        <td>
                                            {item.trang_thai === 'chua_thanh_toan' ? (
                                                <Badge bg="danger" className="px-2 py-1">Chưa đóng</Badge>
                                            ) : (
                                                <Badge bg="success" className="px-2 py-1">Đã đóng</Badge>
                                            )}
                                        </td>
                                        <td className="text-end pe-4">
                                            {item.trang_thai === 'chua_thanh_toan' ? (
                                                <Button size="sm" variant="outline-primary" onClick={() => handlePayment(item.id)}>
                                                    <i className="bi bi-credit-card me-1"></i> Đóng tiền
                                                </Button>
                                            ) : (
                                                <Button size="sm" variant="light" disabled className="text-muted">
                                                    <i className="bi bi-check2-all me-1"></i> Xong
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {filteredBills.length === 0 && <div className="text-center py-5 text-muted">Không tìm thấy hóa đơn nào</div>}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default UserBills;