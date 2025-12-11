import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal, Form, Spinner, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Swal from 'sweetalert2'; // Import thư viện đẹp

const HoSoManager = () => {
    const [listHoSo, setListHoSo] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State Modal Xem Chi Tiết
    const [showModal, setShowModal] = useState(false);
    const [selectedHoSo, setSelectedHoSo] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = listHoSo.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(listHoSo.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Load dữ liệu
    const fetchHoSo = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/ho-so');
            if (res.data.success) setListHoSo(res.data.data);
        } catch (error) {
            toast.error("Lỗi tải danh sách");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHoSo(); }, []);

    // --- XỬ LÝ DUYỆT (POPUP ĐẸP) ---
    const handleApprove = () => {
        // 1. Hỏi xác nhận đẹp
        Swal.fire({
            title: 'Xác nhận duyệt?',
            html: `Hệ thống sẽ cấp tài khoản cho <b>${selectedHoSo.ho_ten}</b>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#198754', // Màu xanh
            cancelButtonColor: '#d33',
            confirmButtonText: 'Duyệt ngay!',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                try {
                    const res = await api.post(`/admin/ho-so/${selectedHoSo.id}/duyet`);
                    
                    if (res.data.success) {
                        setShowModal(false);
                        fetchHoSo(); // Load lại bảng
                        
                        // 2. Thông báo thành công + Hiện tài khoản
                        Swal.fire({
                            title: 'Đã cấp tài khoản!',
                            html: `
                                <div class="text-start bg-light p-3 rounded">
                                    <p class="mb-1">👤 <strong>User:</strong> ${selectedHoSo.email}</p>
                                    <p class="mb-0">🔑 <strong>Pass:</strong> ${selectedHoSo.dien_thoai}</p>
                                </div>
                                <p class="small text-muted mt-2">Đã gửi email thông báo cho cư dân.</p>
                            `,
                            icon: 'success'
                        });
                    }
                } catch (error) {
                    Swal.fire('Lỗi', error.response?.data?.message || "Lỗi hệ thống", 'error');
                } finally {
                    setProcessing(false);
                }
            }
        });
    };

    // --- XỬ LÝ TỪ CHỐI ---
    const handleReject = async () => {
        if (!rejectReason) return toast.warning("Vui lòng nhập lý do từ chối!");
        
        setProcessing(true);
        try {
            await api.post(`/admin/ho-so/${selectedHoSo.id}/tu-choi`, { ly_do: rejectReason });
            toast.info("Đã từ chối hồ sơ.");
            setShowModal(false);
            fetchHoSo();
        } catch (error) {
            toast.error("Lỗi hệ thống");
        } finally {
            setProcessing(false);
        }
    };

    const openDetail = (hoso) => {
        setSelectedHoSo(hoso);
        setRejectReason("");
        setShowModal(true);
    };

    return (
        <div className="container-fluid">
            <h3 className="fw-bold text-primary mb-4">Quản Lý Xét Duyệt Hồ Sơ</h3>

            {loading ? <div className="text-center py-5"><Spinner animation="border"/></div> : (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <Table hover responsive className="table-nowrap mb-0 align-middle">
                            <thead className="bg-light text-primary">
                                <tr>
                                    <th className="ps-4">ID</th>
                                    <th>Họ Tên</th>
                                    <th>Căn Hộ ĐK</th>
                                    <th>Ngày Nộp</th>
                                    <th>Điểm Ưu Tiên</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="ps-4 fw-bold">#{item.id}</td>
                                        <td>
                                            <div className="fw-bold">{item.ho_ten}</div>
                                            <small className="text-muted">{item.dien_thoai}</small>
                                        </td>
                                        <td>
                                            <span className="badge bg-light text-dark border">{item.ten_can_ho}</span>
                                        </td>
                                        <td>{new Date(item.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <Badge bg={item.diem_uu_tien > 50 ? "danger" : "info"} className="fs-6 rounded-pill">
                                                {item.diem_uu_tien} điểm
                                            </Badge>
                                        </td>
                                        <td>
                                            {item.trang_thai === 'pending' && <Badge bg="warning" text="dark">Chờ duyệt</Badge>}
                                            {item.trang_thai === 'approved' && <Badge bg="success">Đã duyệt</Badge>}
                                            {item.trang_thai === 'rejected' && <Badge bg="secondary">Đã từ chối</Badge>}
                                        </td>
                                        <td>
                                            <Button size="sm" variant="outline-primary" className="rounded-pill px-3 fw-bold" onClick={() => openDetail(item)}>
                                                <i className="bi bi-eye me-1"></i> Xem
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center py-3">
                            <Pagination className="mb-0">
                                <Pagination.Prev 
                                    onClick={() => paginate(currentPage - 1)} 
                                    disabled={currentPage === 1} 
                                />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item 
                                        key={i + 1} 
                                        active={i + 1 === currentPage} 
                                        onClick={() => paginate(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => paginate(currentPage + 1)} 
                                    disabled={currentPage === totalPages} 
                                />
                            </Pagination>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL CHI TIẾT */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold text-primary">Chi tiết hồ sơ #{selectedHoSo?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedHoSo && (
                        <div className="row g-3">
                            {/* Cột trái */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded h-100">
                                    <h6 className="fw-bold text-uppercase text-secondary mb-3">Thông tin cá nhân</h6>
                                    <p className="mb-2">👤 <strong>Họ tên:</strong> {selectedHoSo.ho_ten}</p>
                                    <p className="mb-2">🆔 <strong>CCCD:</strong> {selectedHoSo.cccd}</p>
                                    <p className="mb-2">📞 <strong>SĐT:</strong> {selectedHoSo.dien_thoai}</p>
                                    <p className="mb-2">📧 <strong>Email:</strong> {selectedHoSo.email}</p>
                                    <p className="mb-0">💼 <strong>Nghề nghiệp:</strong> {selectedHoSo.nghe_nghiep}</p>
                                </div>
                            </div>
                            {/* Cột phải */}
                            <div className="col-md-6">
                                <div className="p-3 bg-light rounded h-100">
                                    <h6 className="fw-bold text-uppercase text-secondary mb-3">Thông tin xét duyệt</h6>
                                    <p className="mb-2">🏠 <strong>Căn hộ:</strong> {selectedHoSo.ten_can_ho}</p>
                                    <p className="mb-2">💰 <strong>Thu nhập:</strong> {new Intl.NumberFormat('vi-VN').format(selectedHoSo.thu_nhap)} đ</p>
                                    <p className="mb-2">👨‍👩‍👧 <strong>Số người ở:</strong> {selectedHoSo.so_nguoi_o}</p>
                                    <div className="d-flex align-items-center mt-3">
                                        <div className="bg-white px-3 py-2 rounded border border-warning">
                                            <span className="text-muted small">Điểm ưu tiên:</span>
                                            <h4 className="m-0 text-warning fw-bold">{selectedHoSo.diem_uu_tien}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* File đính kèm */}
                            <div className="col-12">
                                <h6 className="fw-bold mt-2">File minh chứng:</h6>
                                {selectedHoSo.file_dinh_kem ? (
                                    JSON.parse(selectedHoSo.file_dinh_kem).map((file, idx) => (
                                        <a key={idx} href={`http://localhost:8080/uploads/${file}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-light border me-2 text-primary">
                                            <i className="bi bi-file-earmark-pdf-fill text-danger me-1"></i> {file}
                                        </a>
                                    ))
                                ) : <span className="text-muted fst-italic">Không có file đính kèm</span>}
                            </div>

                            {/* Khu vực Xử lý */}
                            {selectedHoSo.trang_thai === 'pending' && (
                                <div className="col-12 mt-3 pt-3 border-top">
                                    <h6 className="fw-bold mb-3">Quyết định xét duyệt:</h6>
                                    <div className="row align-items-end">
                                        <div className="col-md-8">
                                            <Form.Control 
                                                as="textarea" 
                                                rows={1} 
                                                placeholder="Lý do từ chối (bắt buộc)..." 
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 d-flex gap-2 justify-content-end mt-2 mt-md-0">
                                            <Button variant="success" className="flex-grow-1 fw-bold" onClick={handleApprove} disabled={processing}>
                                                {processing ? <Spinner size="sm"/> : "DUYỆT"}
                                            </Button>
                                            <Button variant="outline-danger" className="fw-bold" onClick={handleReject} disabled={processing}>
                                                TỪ CHỐI
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {selectedHoSo.trang_thai === 'rejected' && (
                                <div className="col-12 mt-2">
                                    <div className="alert alert-danger mb-0">
                                        <strong>Lý do từ chối:</strong> {selectedHoSo.note}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default HoSoManager;