import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Breadcrumb, Table, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/can-ho/${id}`);
                if (res.data.success) setProject(res.data.data);
            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) return <div className="text-center py-5 mt-5"><Spinner animation="border" variant="primary"/></div>;
    if (!project) return <div className="text-center py-5 mt-5"><h3>Dự án không tồn tại</h3></div>;

    const formatMoney = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    const isAvailable = project.trang_thai === 'trong';

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
            <Container>
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item onClick={() => navigate('/')}>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item onClick={() => navigate('/du-an')}>Danh sách dự án</Breadcrumb.Item>
                    <Breadcrumb.Item active>{project.ten_du_an || project.ten_can_ho}</Breadcrumb.Item>
                </Breadcrumb>

                <Row className="g-4">
                    {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
                    <Col lg={8}>
                        <div className="rounded-4 overflow-hidden shadow-sm mb-4 bg-white position-relative">
                            <img src={project.hinh_anh || `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&seed=${id}`} className="w-100 object-fit-cover" style={{height: '500px'}} alt="main" />
                            <div className="position-absolute bottom-0 start-0 w-100 p-4" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'}}>
                                <h2 className="text-white fw-bold mb-1">{project.ten_du_an || "Dự án Nhà ở xã hội"}</h2>
                                <p className="text-white-50 mb-0"><i className="bi bi-geo-alt me-2"></i>{project.dia_chi_du_an || project.khu_vuc}</p>
                            </div>
                        </div>

                        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h4 className="fw-bold text-primary mb-3 text-uppercase border-bottom pb-2">Thông tin chi tiết căn hộ</h4>
                            
                            <Table hover responsive className="mb-4">
                                <tbody>
                                    <tr><td className="fw-bold text-muted w-25">Tên căn hộ</td><td className="fw-bold">{project.ten_can_ho}</td></tr>
                                    <tr><td className="fw-bold text-muted">Khu vực</td><td>{project.khu_vuc}</td></tr>
                                    <tr><td className="fw-bold text-muted">Diện tích</td><td>{project.dien_tich} m²</td></tr>
                                    <tr><td className="fw-bold text-muted">Số phòng ngủ</td><td>{project.so_phong || 2} PN</td></tr>
                                    <tr><td className="fw-bold text-muted">Tầng</td><td>Tầng {project.tang || 1}</td></tr>
                                    <tr><td className="fw-bold text-muted">Giá niêm yết</td><td className="text-danger fw-bold fs-5">{formatMoney(project.gia)}</td></tr>
                                    <tr><td className="fw-bold text-muted">Trạng thái</td>
                                        <td>
                                            {isAvailable ? 
                                                <Badge bg="success">Đang mở bán</Badge> : 
                                                <Badge bg="secondary">Đã hết suất</Badge>
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                            <h5 className="fw-bold text-dark mt-3">Mô tả thêm</h5>
                            <p className="text-muted text-justify">
                                {project.mo_ta || "Dự án nằm ở vị trí thuận lợi, gần trường học, bệnh viện và chợ. Thiết kế căn hộ hiện đại, tối ưu công năng sử dụng, phù hợp với các gia đình trẻ và người lao động thu nhập thấp."}
                            </p>
                        </Card>
                    </Col>

                    {/* CỘT PHẢI: HÀNH ĐỘNG */}
                    <Col lg={4}>
                        <div className="sticky-top" style={{top: '100px', zIndex: 1}}>
                            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
                                <div className="bg-primary text-white p-4 text-center">
                                    <h5 className="mb-0 text-uppercase">Đăng ký mua / Thuê</h5>
                                </div>
                                <Card.Body className="p-4">
                                    {isAvailable ? (
                                        <div className="d-grid gap-3">
                                            <div className="alert alert-success small mb-3">
                                                <i className="bi bi-check-circle-fill me-2"></i> Hồ sơ đang được tiếp nhận
                                            </div>
                                            <Button variant="warning" size="lg" className="fw-bold shadow-sm" onClick={() => navigate('/nop-ho-so')}>
                                                <i className="bi bi-file-earmark-text me-2"></i> NỘP HỒ SƠ NGAY
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="alert alert-secondary text-center fw-bold">
                                            <i className="bi bi-lock-fill me-2"></i> CĂN HỘ ĐÃ CÓ CHỦ
                                        </div>
                                    )}

                                    <hr className="my-4 opacity-25"/>
                                    
                                    <div className="text-center">
                                        <p className="text-muted small mb-2">Cần tư vấn thêm?</p>
                                        <Button variant="outline-primary" className="w-100 fw-bold rounded-pill" onClick={() => navigate('/lien-he')}>
                                            <i className="bi bi-telephone me-2"></i> GỌI HOTLINE
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default ProjectDetail;