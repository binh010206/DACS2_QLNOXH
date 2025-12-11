import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Modal, Button, Form, Row, Col, Badge, InputGroup, Card, Spinner, Pagination } from 'react-bootstrap';

const ApartmentManager = () => {
    const [apartments, setApartments] = useState([]); // Dữ liệu gốc
    const [loading, setLoading] = useState(false);
    
    // --- PHÂN TRANG ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 

    // State Modal
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    // Form dữ liệu 
    const [currentApt, setCurrentApt] = useState({
        ten_du_an: '', ten_can_ho: '', dia_chi_du_an: '', 
        khu_vuc: 'Liên Chiểu', hinh_anh: '',
        tang: 1, dien_tich: 0, so_phong: 1, gia: 0,
        trang_thai: 'trong'
    });

    const [filters, setFilters] = useState({ keyword: '', khu_vuc: '', trang_thai: '' });

    // 1. LẤY DỮ LIỆU
    const fetchApartments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await api.get(`/can-ho?${params}`);
            if(res.data.success) {
                setApartments(res.data.data);
                setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
            }
        } catch (error) { toast.error("Lỗi tải dữ liệu"); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchApartments(); }, []);

    // --- LOGIC TÍNH TOÁN PHÂN TRANG ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = apartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(apartments.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 2. XỬ LÝ MODAL
    const handleOpenModal = (apt = null) => {
        if (apt) {
            setIsEdit(true);
            setCurrentApt(apt);
        } else {
            setIsEdit(false);
            setCurrentApt({
                ten_du_an: '', ten_can_ho: '', dia_chi_du_an: '', 
                khu_vuc: 'Liên Chiểu', hinh_anh: '',
                tang: 1, dien_tich: 50, so_phong: 2, gia: 0,
                trang_thai: 'trong'
            });
        }
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if(!currentApt.ten_can_ho || !currentApt.gia) return toast.warning("Nhập tên và giá!");
            
            if (isEdit) {
                await api.put(`/can-ho/${currentApt.id}`, currentApt);
                toast.success("Đã cập nhật!");
            } else {
                await api.post('/can-ho', currentApt);
                toast.success("Thêm mới thành công!");
            }
            setShowModal(false);
            fetchApartments();
        } catch (error) { toast.error("Lỗi lưu dữ liệu"); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Xóa căn hộ này?")) {
            try {
                await api.delete(`/can-ho/${id}`);
                toast.success("Đã xóa!");
                fetchApartments();
            } catch (e) { toast.error("Không thể xóa!"); }
        }
    };

    return (
        <div className="container-fluid animate-fade-in">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary m-0"><i className="bi bi-buildings-fill me-2"></i>Quản Lý Căn Hộ</h3>
                <Button variant="primary" className="rounded-pill px-4 fw-bold shadow-sm" onClick={() => handleOpenModal(null)}>
                    <i className="bi bi-plus-lg me-1"></i> Thêm Mới
                </Button>
            </div>

            {/* Thanh Tìm Kiếm */}
            <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                <Card.Body className="bg-light p-4">
                    <Row className="g-3">
                        <Col md={4}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-0"><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control 
                                    className="border-0 shadow-none" 
                                    placeholder="Tìm tên dự án, mã căn..." 
                                    value={filters.keyword} 
                                    onChange={e => setFilters({...filters, keyword: e.target.value})}
                                    onKeyPress={e => e.key === 'Enter' && fetchApartments()} // Enter là tìm luôn
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3}>
                            <Form.Select className="border-0 shadow-none" value={filters.khu_vuc} onChange={e => setFilters({...filters, khu_vuc: e.target.value})}>
                                <option value="">-- Tất cả khu vực --</option>
                                <option value="Liên Chiểu">Liên Chiểu</option>
                                <option value="Hải Châu">Hải Châu</option>
                                <option value="Sơn Trà">Sơn Trà</option>
                                <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option>
                                <option value="Cẩm Lệ">Cẩm Lệ</option>
                                <option value="Hòa Vang">Hòa Vang</option>
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Select className="border-0 shadow-none" value={filters.trang_thai} onChange={e => setFilters({...filters, trang_thai: e.target.value})}>
                                <option value="">-- Trạng thái --</option>
                                <option value="trong">Còn trống</option>
                                <option value="da_thue">Đã thuê</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" className="w-100 fw-bold rounded-pill" onClick={fetchApartments}>Tìm Kiếm</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Danh sách Card */}
            {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> : (
                <>
                    <Row className="g-4 mb-4">
                        {currentItems.map((apt, idx) => (
                            <Col md={6} lg={4} xl={3} key={apt.id} className="animate-up" style={{animationDelay: `${idx * 0.05}s`}}>
                                <Card className="h-100 border-0 shadow-sm hover-card rounded-4 overflow-hidden">
                                    {/* Ảnh */}
                                    <div className="position-relative">
                                        <Card.Img 
                                            variant="top" 
                                            src={apt.hinh_anh || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=600"} 
                                            style={{height: '180px', objectFit: 'cover'}}
                                        />
                                        <Badge bg={apt.trang_thai === 'trong' ? 'success' : 'secondary'} className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
                                            {apt.trang_thai === 'trong' ? 'Còn trống' : 'Đã thuê'}
                                        </Badge>
                                    </div>

                                    <Card.Body className="d-flex flex-column">
                                        <h6 className="fw-bold text-dark text-truncate mb-1">{apt.ten_du_an || "Dự án NOXH"}</h6>
                                        <h5 className="fw-bold text-primary mb-2">{apt.ten_can_ho}</h5>
                                        
                                        <div className="d-flex align-items-center text-muted small mb-2 text-truncate">
                                            <i className="bi bi-geo-alt-fill text-danger me-2"></i>{apt.dia_chi_du_an || apt.khu_vuc}
                                        </div>

                                        <div className="d-flex justify-content-between bg-light rounded-3 p-2 small fw-bold text-secondary mb-3">
                                            <span><i className="bi bi-rulers"></i> {apt.dien_tich}m²</span>
                                            <span><i className="bi bi-door-open"></i> {apt.so_phong}PN</span>
                                            <span><i className="bi bi-layers"></i> T{apt.tang}</span>
                                        </div>

                                        <h5 className="text-danger fw-bold mb-0 mt-auto">
                                            {new Intl.NumberFormat('vi-VN').format(apt.gia)} đ
                                        </h5>
                                    </Card.Body>

                                    <Card.Footer className="bg-white border-0 pt-0 pb-3 d-flex justify-content-end gap-2">
                                        <Button variant="outline-primary" size="sm" className="rounded-circle" onClick={() => handleOpenModal(apt)}><i className="bi bi-pencil-fill"></i></Button>
                                        <Button variant="outline-danger" size="sm" className="rounded-circle" onClick={() => handleDelete(apt.id)}><i className="bi bi-trash-fill"></i></Button>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* THANH PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center pb-5">
                            <Pagination>
                                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => paginate(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}

            {/* Modal Form */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0"><Modal.Title className="fw-bold text-primary">{isEdit ? "Cập Nhật" : "Thêm Mới"}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row className="g-3">
                            <Col md={6}><Form.Group><Form.Label>Tên Dự Án</Form.Label><Form.Control value={currentApt.ten_du_an} onChange={e => setCurrentApt({...currentApt, ten_du_an: e.target.value})} /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Mã Căn *</Form.Label><Form.Control value={currentApt.ten_can_ho} onChange={e => setCurrentApt({...currentApt, ten_can_ho: e.target.value})} required /></Form.Group></Col>
                            <Col md={3}><Form.Group><Form.Label>Giá Thuê *</Form.Label><Form.Control type="number" value={currentApt.gia} onChange={e => setCurrentApt({...currentApt, gia: e.target.value})} required /></Form.Group></Col>
                            
                            <Col md={12}><Form.Group><Form.Label>Địa chỉ chi tiết</Form.Label><Form.Control value={currentApt.dia_chi_du_an} onChange={e => setCurrentApt({...currentApt, dia_chi_du_an: e.target.value})} /></Form.Group></Col>
                            
                            <Col md={4}><Form.Group><Form.Label>Khu vực</Form.Label>
                                <Form.Select value={currentApt.khu_vuc} onChange={e => setCurrentApt({...currentApt, khu_vuc: e.target.value})}>
                                    <option value="Liên Chiểu">Liên Chiểu</option><option value="Hải Châu">Hải Châu</option><option value="Sơn Trà">Sơn Trà</option>
                                    <option value="Ngũ Hành Sơn">Ngũ Hành Sơn</option><option value="Cẩm Lệ">Cẩm Lệ</option><option value="Hòa Vang">Hòa Vang</option>
                                </Form.Select>
                            </Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Trạng thái</Form.Label><Form.Select value={currentApt.trang_thai} onChange={e => setCurrentApt({...currentApt, trang_thai: e.target.value})}><option value="trong">Còn trống</option><option value="da_thue">Đã thuê</option></Form.Select></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Link Ảnh</Form.Label><Form.Control value={currentApt.hinh_anh} onChange={e => setCurrentApt({...currentApt, hinh_anh: e.target.value})} placeholder="URL ảnh..." /></Form.Group></Col>

                            <Col md={4}><Form.Group><Form.Label>Diện tích (m²)</Form.Label><Form.Control type="number" value={currentApt.dien_tich} onChange={e => setCurrentApt({...currentApt, dien_tich: e.target.value})} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Số phòng</Form.Label><Form.Control type="number" value={currentApt.so_phong} onChange={e => setCurrentApt({...currentApt, so_phong: e.target.value})} /></Form.Group></Col>
                            <Col md={4}><Form.Group><Form.Label>Tầng</Form.Label><Form.Control type="number" value={currentApt.tang} onChange={e => setCurrentApt({...currentApt, tang: e.target.value})} /></Form.Group></Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" onClick={handleSave}>Lưu thông tin</Button>
                </Modal.Footer>
            </Modal>

            <style>{`.hover-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1)!important; transition: 0.3s; }`}</style>
        </div>
    );
};

export default ApartmentManager;