import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const SubmitProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [validated, setValidated] = useState(false);
    
    // State Modal Hướng Dẫn
    const [showGuide, setShowGuide] = useState(false);

    // Data API
    const [allApartments, setAllApartments] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        ho_ten: '', ngay_sinh: '', cccd: '', dien_thoai: '', email: '',
        dia_chi: '', thu_nhap: '', nghe_nghiep: '', so_nguoi_o: '',
        can_ho_id: '',
        files: [] // Đổi thành mảng để chứa nhiều file
    });
    const [errors, setErrors] = useState({});

    // 1. LẤY DỮ LIỆU CĂN HỘ
    useEffect(() => {
        axios.get('http://localhost:8080/api/can-ho?limit=100')
            .then(res => {
                if (res.data.success) {
                    let realData = [];
                    if (res.data.data && Array.isArray(res.data.data.rows)) {
                        realData = res.data.data.rows;
                    } else if (Array.isArray(res.data.data)) {
                        realData = res.data.data;
                    }
                    setAllApartments(realData);
                }
            })
            .catch(err => console.error("Lỗi API:", err));
    }, []);

    const uniqueProjects = useMemo(() => {
        const names = allApartments.map(item => item.ten_du_an || "Dự án khác");
        return [...new Set(names)];
    }, [allApartments]);

    const availableApartments = useMemo(() => {
        if (!selectedProjectName) return [];
        return allApartments.filter(item => 
            (item.ten_du_an === selectedProjectName || (!item.ten_du_an && selectedProjectName === "Dự án khác"))
            && item.trang_thai === 'trong'
        );
    }, [selectedProjectName, allApartments]);

    // Handle Input Text
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    // Handle File Input (Multiple PDF)
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        // Validate ngay khi chọn file
        let fileError = null;
        if (selectedFiles.length > 3) {
            fileError = "Vui lòng chỉ chọn tối đa 3 file để đảm bảo hệ thống ổn định.";
        } else {
            const invalidFile = selectedFiles.find(f => f.type !== 'application/pdf');
            if (invalidFile) fileError = "Chỉ chấp nhận file định dạng PDF.";
            
            const oversizedFile = selectedFiles.find(f => f.size > 10 * 1024 * 1024); // 10MB limit
            if (oversizedFile) fileError = "Có file vượt quá dung lượng 10MB.";
        }

        if (fileError) {
            setErrors({ ...errors, files: fileError });
            e.target.value = null; // Reset input
            setFormData({ ...formData, files: [] });
        } else {
            setFormData({ ...formData, files: selectedFiles });
            setErrors({ ...errors, files: null });
        }
    };

    // --- LOGIC VALIDATE CHẶT CHẼ ---
    const validateForm = () => {
        const newErrors = {};

        // 1. Họ tên
        if (!formData.ho_ten.trim()) newErrors.ho_ten = "Vui lòng nhập họ và tên";

        // 2. Tuổi >= 18
        if (!formData.ngay_sinh) {
            newErrors.ngay_sinh = "Vui lòng chọn ngày sinh";
        } else {
            const birthDate = new Date(formData.ngay_sinh);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) newErrors.ngay_sinh = "Bạn chưa đủ 18 tuổi để đăng ký.";
        }

        // 3. CCCD (12 số)
        if (!formData.cccd || !/^\d{12}$/.test(formData.cccd)) {
            newErrors.cccd = "CCCD phải bao gồm đúng 12 chữ số.";
        }

        // 4. Số điện thoại (10 số, bắt đầu bằng 0)
        if (!formData.dien_thoai || !/^0\d{9}$/.test(formData.dien_thoai)) {
            newErrors.dien_thoai = "Số điện thoại không hợp lệ (Phải có 10 số, bắt đầu là 0).";
        }

        // 5. Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Email không hợp lệ.";
        }

        // 6. Căn hộ
        if (!formData.can_ho_id) newErrors.can_ho_id = "Vui lòng chọn căn hộ.";

        // 7. File
        if (formData.files.length === 0) {
            newErrors.files = "Bắt buộc phải đính kèm hồ sơ minh chứng.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidated(true);

        if (!validateForm()) {
            toast.warning("Vui lòng kiểm tra lại các lỗi màu đỏ!");
            return;
        }

        setLoading(true);
        try {
            const dataPayload = new FormData();
            // Append text fields
            Object.keys(formData).forEach(key => {
                if (key !== 'files') dataPayload.append(key, formData[key]);
            });
            // Append files (Duyệt qua mảng file để gửi nhiều file)
            formData.files.forEach(file => {
                dataPayload.append('files', file); 
            });

            // Gửi API
            const res = await axios.post('http://localhost:8080/api/ho-so/nop', dataPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                toast.success("Nộp hồ sơ thành công! Vui lòng kiểm tra email.");
                setTimeout(() => navigate('/'), 2000);
            } else {
                toast.error(res.data.message || "Có lỗi xảy ra");
            }

        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối Server. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="submit-page-wrapper">
            <Container className="py-5 position-relative" style={{ zIndex: 2 }}>
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="glass-form p-5">
                            <div className="text-center mb-5">
                                <h2 className="fw-black text-uppercase text-primary mb-2">
                                    <i className="bi bi-file-earmark-person-fill me-2"></i> Đăng Ký Hồ Sơ NOXH
                                </h2>
                                <p className="text-dark fw-bold opacity-75">Vui lòng điền thông tin chính xác. Hồ sơ sẽ được kiểm tra kỹ lưỡng.</p>
                            </div>

                            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                                {/* NHÓM 1: THÔNG TIN CÁ NHÂN */}
                                <h5 className="text-primary fw-bold border-bottom border-primary pb-2 mb-4">I. THÔNG TIN CÁ NHÂN</h5>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Họ và tên <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required name="ho_ten" value={formData.ho_ten} onChange={handleChange} isInvalid={!!errors.ho_ten} />
                                            <Form.Control.Feedback type="invalid">{errors.ho_ten}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Số CCCD (12 số) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required type="number" name="cccd" value={formData.cccd} onChange={handleChange} isInvalid={!!errors.cccd} />
                                            <Form.Control.Feedback type="invalid">{errors.cccd}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Ngày sinh (Phải &ge; 18 tuổi) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required type="date" name="ngay_sinh" value={formData.ngay_sinh} onChange={handleChange} isInvalid={!!errors.ngay_sinh} />
                                            <Form.Control.Feedback type="invalid">{errors.ngay_sinh}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Số điện thoại (10 số) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required name="dien_thoai" value={formData.dien_thoai} onChange={handleChange} isInvalid={!!errors.dien_thoai} placeholder="09xxxxxxx" />
                                            <Form.Control.Feedback type="invalid">{errors.dien_thoai}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Email (Nhận kết quả) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required type="email" name="email" value={formData.email} onChange={handleChange} isInvalid={!!errors.email} />
                                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-bold small">Địa chỉ thường trú <span className="text-danger">*</span></Form.Label>
                                    <Form.Control required name="dia_chi" value={formData.dia_chi} onChange={handleChange} />
                                </Form.Group>

                                {/* NHÓM 2: THÔNG TIN XÉT DUYỆT */}
                                <h5 className="text-primary fw-bold border-bottom border-primary pb-2 mb-4 mt-5">II. THÔNG TIN XÉT DUYỆT</h5>
                                <Row className="mb-3">
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Thu nhập (VNĐ) <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required type="number" name="thu_nhap" value={formData.thu_nhap} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Nghề nghiệp <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required name="nghe_nghiep" value={formData.nghe_nghiep} onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="fw-bold small">Số người ở <span className="text-danger">*</span></Form.Label>
                                            <Form.Control required type="number" name="so_nguoi_o" value={formData.so_nguoi_o} onChange={handleChange} min="1" />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* NHÓM 3: CHỌN CĂN HỘ */}
                                <h5 className="text-primary fw-bold border-bottom border-primary pb-2 mb-4 mt-5">III. CHỌN CĂN HỘ</h5>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold small">Bước 1: Chọn Dự Án</Form.Label>
                                            <Form.Select value={selectedProjectName} onChange={(e) => { setSelectedProjectName(e.target.value); setFormData({...formData, can_ho_id: ''}); }}>
                                                <option value="">-- Chọn Dự Án --</option>
                                                {uniqueProjects.map((name, idx) => <option key={idx} value={name}>{name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="fw-bold small">Bước 2: Chọn Căn Hộ</Form.Label>
                                            <Form.Select required name="can_ho_id" value={formData.can_ho_id} onChange={handleChange} isInvalid={!!errors.can_ho_id} disabled={!selectedProjectName}>
                                                <option value="">{selectedProjectName ? "-- Chọn căn hộ --" : "-- Chọn dự án trước --"}</option>
                                                {availableApartments.map((item) => (
                                                    <option key={item.id} value={item.id}>{item.ten_can_ho} - Tầng {item.tang || 1} ({new Intl.NumberFormat('vi-VN').format(item.gia)}đ)</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{errors.can_ho_id}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* FILE UPLOAD + HƯỚNG DẪN */}
                                <div className="d-flex justify-content-between align-items-center mb-2 mt-4">
                                    <h5 className="text-primary fw-bold m-0">IV. HỒ SƠ MINH CHỨNG</h5>
                                    <Button variant="outline-info" size="sm" onClick={() => setShowGuide(true)} className="fw-bold">
                                        <i className="bi bi-info-circle-fill me-1"></i> Xem hướng dẫn giấy tờ
                                    </Button>
                                </div>
                                <Form.Group className="mb-5">
                                    <Form.Label className="small text-muted fst-italic">
                                        * Chỉ chấp nhận file <b>PDF</b>. Tối đa <b>3 file</b> (tránh lỗi hệ thống). Tổng dung lượng dưới 10MB.
                                    </Form.Label>
                                    <div className={`upload-box p-4 text-center rounded-3 ${errors.files ? 'border-danger' : ''}`}>
                                        <i className="bi bi-cloud-arrow-up-fill fs-1 text-primary mb-2"></i>
                                        <p className="mb-2 fw-bold text-dark">
                                            {formData.files.length > 0 ? `Đã chọn ${formData.files.length} file` : "Kéo thả hoặc bấm để chọn file"}
                                        </p>
                                        <Form.Control 
                                            type="file" 
                                            multiple // Cho phép chọn nhiều file
                                            onChange={handleFileChange} 
                                            accept=".pdf" // Chỉ nhận PDF
                                            className="d-none" 
                                            id="custom-file-upload"
                                        />
                                        <label htmlFor="custom-file-upload" className="btn btn-outline-primary fw-bold px-4 rounded-pill">
                                            {formData.files.length > 0 ? "Chọn lại" : "Tải File Lên"}
                                        </label>
                                        {/* Hiển thị danh sách file đã chọn */}
                                        {formData.files.length > 0 && (
                                            <ul className="list-unstyled mt-3 text-start d-inline-block bg-light p-2 rounded">
                                                {formData.files.map((f, i) => (
                                                    <li key={i} className="small text-success"><i className="bi bi-check-circle me-1"></i> {f.name}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {errors.files && <div className="text-danger small mt-2 fw-bold">{errors.files}</div>}
                                    </div>
                                </Form.Group>

                                <div className="text-center d-grid gap-2">
                                    <Button type="submit" variant="primary" size="lg" className="fw-bold shadow py-3 btn-gradient" disabled={loading}>
                                        {loading ? <><Spinner size="sm" animation="border" className="me-2"/> ĐANG GỬI...</> : "NỘP HỒ SƠ NGAY"}
                                    </Button>
                                    <Button variant="link" className="text-dark fw-bold text-decoration-none" onClick={() => navigate('/')}>
                                        <i className="bi bi-arrow-left"></i> Quay lại trang chủ
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </Container>

            {/* --- MODAL HƯỚNG DẪN NỘP HỒ SƠ --- */}
            <Modal show={showGuide} onHide={() => setShowGuide(false)} size="lg" scrollable>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title className="fw-bold">Hướng Dẫn Nộp Hồ Sơ NOXH</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-3">
                    <h6 className="fw-bold text-danger">A. Hồ sơ chung (Bắt buộc)</h6>
                    <ul className="small text-muted">
                        <li><b>Đơn đăng ký mua nhà ở xã hội:</b> Theo Mẫu số 01 Phụ lục I Thông tư 05/2024/TT-BXD.</li>
                        <li><b>Giấy tờ tùy thân:</b> Bản sao có chứng thực CCCD/CMND.</li>
                        <li><b>Cư trú:</b> Sổ hộ khẩu hoặc giấy xác nhận tạm trú (nếu có).</li>
                        <li><b>Tình trạng hôn nhân:</b> Giấy đăng ký kết hôn, xác nhận độc thân hoặc quyết định ly hôn.</li>
                        <li><b>Ảnh thẻ:</b> 4x6 (nếu có yêu cầu).</li>
                    </ul>

                    <h6 className="fw-bold text-danger mt-3">B. Giấy tờ chứng minh đối tượng ưu tiên (Chọn 1)</h6>
                    <ul className="small text-muted">
                        <li><b>Người có công/Thân nhân liệt sĩ:</b> Giấy tờ theo quy định Pháp lệnh Ưu đãi người có công.</li>
                        <li><b>Hộ nghèo/Cận nghèo:</b> Giấy chứng nhận do UBND cấp xã/phường cấp.</li>
                        <li><b>Công nhân/NLĐ KCN/Viên chức:</b> Giấy xác nhận theo Mẫu số 03 Phụ lục I, xác nhận bởi cơ quan quản lý.</li>
                        <li><b>Thu nhập thấp đô thị:</b> Giấy xác nhận đối tượng và thực trạng nhà ở (Mẫu 02 hoặc 03).</li>
                        <li><b>Lực lượng vũ trang:</b> Theo hướng dẫn của Bộ Quốc phòng/Công an.</li>
                    </ul>

                    <h6 className="fw-bold text-danger mt-3">C. Giấy tờ chứng minh điều kiện nhà ở (Chọn 1)</h6>
                    <ul className="small text-muted">
                        <li><b>Chưa có nhà ở:</b> Giấy xác nhận tình trạng nhà ở (Mẫu số 02).</li>
                        <li><b>Nhà chật (dưới 10m²/người):</b> Giấy xác nhận (Mẫu số 03).</li>
                    </ul>

                    <h6 className="fw-bold text-danger mt-3">D. Giấy tờ chứng minh thu nhập</h6>
                    <ul className="small text-muted">
                        <li><b>Có HĐLĐ/BHXH:</b> Bảng lương 6 tháng gần nhất và/hoặc xác nhận thu nhập (Mẫu số 04).</li>
                        <li><b>Lao động tự do:</b> Giấy xác nhận thu nhập do UBND xã/phường cấp (Mẫu số 05).</li>
                    </ul>

                    <div className="alert alert-warning small mt-3">
                        <strong><i className="bi bi-exclamation-triangle-fill"></i> Lưu ý quan trọng:</strong><br/>
                        - Tất cả giấy tờ phải là bản sao có chứng thực.<br/>
                        - Bạn có thể nộp nhiều file PDF cùng lúc (Tối đa 3 file).
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowGuide(false)}>Đóng</Button>
                </Modal.Footer>
            </Modal>

            {/* CSS */}
            <style>{`
                .submit-page-wrapper {
                    min-height: 100vh;
                    background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000');
                    background-size: cover;
                    background-attachment: fixed;
                    background-position: center;
                    position: relative;
                    padding-top: 100px;
                }
                .submit-page-wrapper::before {
                    content: ''; position: absolute; inset: 0;
                    background: rgba(0, 0, 0, 0.5); z-index: 1;
                }
                .glass-form {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                .upload-box {
                    background-color: #f8f9fa;
                    border: 2px dashed #0d6efd;
                    transition: 0.3s;
                }
                .upload-box:hover {
                    background-color: #e9ecef;
                    border-color: #0b5ed7;
                }
                .btn-gradient {
                    background: linear-gradient(90deg, #0d6efd, #0dcaf0); border: 0;
                }
            `}</style>
        </div>
    );
};

export default SubmitProfile;