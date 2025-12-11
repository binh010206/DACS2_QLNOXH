import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const RequestManager = () => {
    const [contacts, setContacts] = useState([]); // Liên hệ khách
    const [reports, setReports] = useState([]);   // Phản ánh cư dân
    const [loading, setLoading] = useState(true);
    
    // State Modal Trả lời
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyType, setReplyType] = useState(""); 

    // --- 1. LẤY DỮ LIỆU ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const resContact = await api.get('/admin/lien-he');
            if(resContact.data.success) setContacts(resContact.data.data);

            const resReport = await api.get('/admin/phan-anh');
            if(resReport.data.success) setReports(resReport.data.data);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    // --- TÍNH TOÁN SỐ LƯỢNG CẦN XỬ LÝ ---
    // 1. Phản ánh: Đếm số tin có trạng thái 'cho_xu_ly'
    const pendingReportsCount = reports.filter(r => r.trang_thai === 'cho_xu_ly').length;
    
    // 2. Liên hệ: Đếm tổng số tin hiện có (Vì liên hệ thường là đọc xong -> Xóa)
    // Nếu bạn muốn giữ tin lại mà vẫn tính là "đã xem", thì cần thêm cột 'trang_thai' vào bảng lien_he trong DB.
    // Hiện tại mình sẽ tính: Còn tin trong hộp thư = Chưa xử lý (Màu đỏ). Hết sạch tin = Xanh.
    const pendingContactsCount = contacts.length; 

    // --- CÁC HÀM XỬ LÝ ---
    const handleDelete = (id, type) => {
        Swal.fire({
            title: 'Xóa tin này?', text: "Xóa xong sẽ không khôi phục được!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Xóa ngay'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.delete(`/admin/lien-he/${id}`); 
                    toast.success("Đã xóa.");
                    fetchData();
                } catch (e) { toast.error("Lỗi xóa tin."); }
            }
        });
    };

    const openReply = (item, type) => {
        setSelectedItem(item);
        setReplyType(type);
        setReplyText("");
        setShowModal(true);
    };

    const handleSendReply = async () => {
        if(!replyText) return toast.warning("Nhập nội dung trả lời!");
        try {
            if (replyType === 'COMMENT') {
                await api.post(`/admin/phan-anh/${selectedItem.id}/tra-loi`, { noi_dung_tra_loi: replyText });
                toast.success("Đã phản hồi!");
            } else {
                window.open(`mailto:${selectedItem.email}?subject=Phản hồi từ BQL DEKA&body=${replyText}`);
            }
            setShowModal(false);
            fetchData();
        } catch (e) { toast.error("Lỗi gửi phản hồi"); }
    };

    // Component hiển thị Tin nhắn
    const MessageCard = ({ item, isReport }) => {
        // Nếu là Phản ánh -> Check trạng thái. Nếu là Liên hệ -> Luôn coi là mới (để hiện viền đỏ)
        const isPending = isReport ? (item.trang_thai === 'cho_xu_ly') : true;

        return (
            <Card className={`mb-3 border-0 shadow-sm card-hover ${isPending ? 'border-start border-5 border-danger bg-warning bg-opacity-10' : ''}`}>
                <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                        <h6 className="fw-bold m-0 text-primary d-flex align-items-center">
                            {/* Chấm đỏ nhỏ ở tên người gửi nếu chưa xử lý */}
                            {isPending && <span className="status-dot-blink me-2"></span>}
                            {isReport ? item.nguoi_gui : item.ho_ten}
                        </h6>
                        <small className="text-muted">{new Date(item.created_at).toLocaleDateString('vi-VN')}</small>
                    </div>
                    
                    <div className="mb-2 small text-secondary">
                        <i className="bi bi-envelope me-1"></i> {item.email}
                        {!isReport && <span className="ms-3"><i className="bi bi-phone"></i> {item.sdt}</span>}
                    </div>

                    <div className="bg-white p-3 rounded mb-3 text-dark fst-italic border">
                        "{item.noi_dung}"
                    </div>

                    {isReport && item.phan_hoi && (
                        <div className="bg-success bg-opacity-10 p-2 rounded mb-2 small text-success border border-success">
                            <strong><i className="bi bi-check-circle-fill"></i> Đã trả lời:</strong> {item.phan_hoi}
                        </div>
                    )}

                    <div className="d-flex gap-2 justify-content-end">
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(item.id, isReport ? 'report' : 'contact')}>
                            <i className="bi bi-trash"></i> Xóa
                        </Button>
                        <Button variant={isPending ? "danger" : "primary"} size="sm" onClick={() => openReply(item, isReport ? 'COMMENT' : 'EMAIL')}>
                            <i className={`bi ${isReport ? 'bi-chat-text' : 'bi-envelope'}`}></i> {isReport ? 'Trả lời' : 'Gửi Mail'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <div className="container-fluid animate-fade-in">
            <h3 className="fw-bold text-primary mb-4">Trung Tâm Phản Hồi</h3>
            
            {loading ? <div className="text-center py-5"><Spinner animation="border"/></div> : (
                <Row className="g-4 h-100">
                    {/* CỘT TRÁI: KHÁCH LIÊN HỆ */}
                    <Col md={6}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100 border">
                            <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                                <div className="bg-warning bg-opacity-25 p-2 rounded-circle me-3 text-warning fw-bold"><i className="bi bi-people-fill fs-4"></i></div>
                                <div>
                                    <h5 className="m-0 fw-bold">Khách Liên Hệ</h5>
                                    <small className="text-muted">Thắc mắc, xem phòng</small>
                                </div>
                                
                                {/* LOGIC ĐÈN BÁO KHÁCH */}
                                {pendingContactsCount > 0 ? (
                                    <Badge bg="danger" className="ms-auto rounded-pill fs-6 animate-pulse">
                                        {pendingContactsCount} chờ xử lý
                                    </Badge>
                                ) : (
                                    <Badge bg="success" className="ms-auto rounded-pill">
                                        <i className="bi bi-check-lg"></i> Sạch sẽ
                                    </Badge>
                                )}
                            </div>
                            <div className="overflow-auto custom-scroll" style={{maxHeight: '70vh'}}>
                                {contacts.length > 0 ? contacts.map(c => <MessageCard key={c.id} item={c} isReport={false} />) 
                                : <div className="text-center py-5 text-muted">Hộp thư trống</div>}
                            </div>
                        </div>
                    </Col>

                    {/* CỘT PHẢI: PHẢN ÁNH CƯ DÂN */}
                    <Col md={6}>
                        <div className="p-3 bg-white rounded-4 shadow-sm h-100 border">
                            <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                                <div className="bg-primary bg-opacity-25 p-2 rounded-circle me-3 text-primary fw-bold"><i className="bi bi-house-heart-fill fs-4"></i></div>
                                <div>
                                    <h5 className="m-0 fw-bold">Cư Dân Chính Thức</h5>
                                    <small className="text-muted">Báo sự cố, khiếu nại</small>
                                </div>

                                {/* LOGIC ĐÈN BÁO CƯ DÂN */}
                                {pendingReportsCount > 0 ? (
                                    <Badge bg="danger" className="ms-auto rounded-pill fs-6 animate-pulse">
                                        {pendingReportsCount} chưa trả lời
                                    </Badge>
                                ) : (
                                    <Badge bg="success" className="ms-auto rounded-pill">
                                        <i className="bi bi-check-lg"></i> Xong hết
                                    </Badge>
                                )}
                            </div>
                            <div className="overflow-auto custom-scroll" style={{maxHeight: '70vh'}}>
                                {reports.length > 0 ? reports.map(r => <MessageCard key={r.id} item={r} isReport={true} />) 
                                : <div className="text-center py-5 text-muted">Không có phản ánh nào</div>}
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {/* MODAL TRẢ LỜI */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold">💬 Gửi Phản Hồi</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Nội dung gửi tới <strong>{selectedItem?.nguoi_gui || selectedItem?.ho_ten}</strong>:</Form.Label>
                        <Form.Control as="textarea" rows={5} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Nhập nội dung..." />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="success" onClick={handleSendReply}>Gửi Ngay</Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .status-dot-blink { display: inline-block; width: 10px; height: 10px; background: red; border-radius: 50%; animation: blink 1s infinite; }
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
                
                /* Hiệu ứng nhấp nháy cho Badge đỏ */
                .animate-pulse { animation: pulse 1.5s infinite; box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(220, 53, 69, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }
                
                .custom-scroll::-webkit-scrollbar { width: 6px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                .card-hover:hover { transform: translateY(-3px); transition: 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.1)!important; }
            `}</style>
        </div>
    );
};

export default RequestManager;