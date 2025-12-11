import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Spinner, Card } from 'react-bootstrap';
import api from '../../services/api';
import Swal from 'sweetalert2';

const ContractManager = () => {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. LẤY DỮ LIỆU TỪ DB
    const fetchContracts = async () => {
        try {
            const res = await api.get('/admin/hop-dong');
            if (res.data.success) setContracts(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchContracts(); }, []);

    // 2. XỬ LÝ BAN (CHẤM DỨT) HỢP ĐỒNG
    const handleBan = (id, name) => {
        Swal.fire({
            title: 'Chấm dứt hợp đồng?',
            text: `Bạn có chắc muốn hủy hợp đồng của ${name}? Căn hộ sẽ bị thu hồi!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Đồng ý Hủy',
            cancelButtonText: 'Thoát'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await api.post(`/admin/hop-dong/${id}/ban`);
                    Swal.fire('Đã hủy!', 'Hợp đồng đã bị chấm dứt.', 'success');
                    fetchContracts(); // Load lại danh sách
                } catch (e) { Swal.fire('Lỗi', 'Không thể hủy hợp đồng.', 'error'); }
            }
        });
    };

    // 3. XỬ LÝ IN HỢP ĐỒNG (LẤY DATA TỪ DB ĐIỀN VÀO MẪU)
    const handlePrint = (c) => {
        const printWindow = window.open('', '_blank');
        // Nội dung HTML mẫu hợp đồng chuẩn
        printWindow.document.write(`
            <html>
            <head>
                <title>Hợp Đồng Thuê Nhà - ${c.chu_ho}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; font-size: 14pt; }
                    h1, h2, h3 { text-align: center; margin: 0; }
                    .header { font-weight: bold; text-align: center; margin-bottom: 20px; }
                    .title { font-size: 18pt; font-weight: bold; margin: 20px 0; }
                    .section { margin-bottom: 15px; text-align: justify; }
                    .bold { font-weight: bold; }
                    .sign { display: flex; justify-content: space-between; margin-top: 50px; }
                    .sign div { text-align: center; width: 45%; }
                </style>
            </head>
            <body>
                <div class="header">
                    CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br>
                    Độc lập - Tự do - Hạnh phúc<br>
                    -------------------
                </div>
                
                <h2 class="title">HỢP ĐỒNG THUÊ NHÀ Ở XÃ HỘI</h2>
                <p style="text-align:center; font-style:italic;">Số: ${c.id}/HĐ-NOXH/2025</p>
                <p style="text-align:center; font-style:italic;">Hôm nay, ngày ${new Date().getDate()} tháng ${new Date().getMonth() + 1} năm ${new Date().getFullYear()}</p>
                
                <div class="section">
                    <span class="bold">BÊN CHO THUÊ (BÊN A): BAN QUẢN LÝ DỰ ÁN DEKA BUILDING</span><br>
                    - Địa chỉ: 470 Trần Đại Nghĩa, Ngũ Hành Sơn, Đà Nẵng.<br>
                    - Điện thoại: 1900 1080<br>
                    - Đại diện: Ông Nguyễn Văn A - Chức vụ: Giám đốc
                </div>

                <div class="section">
                    <span class="bold">BÊN THUÊ (BÊN B): ÔNG/BÀ ${c.chu_ho.toUpperCase()}</span><br>
                    - Điện thoại: ${c.phone || '....................'}<br>
                    - Email: ${c.email}<br>
                    - CMND/CCCD: (Đang cập nhật)
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</span><br>
                    Bên A đồng ý cho Bên B thuê căn hộ nhà ở xã hội thuộc sở hữu nhà nước với chi tiết sau:<br>
                    - Căn hộ số: <span class="bold">${c.ten_can_ho}</span><br>
                    - Diện tích: ${c.dien_tich} m²<br>
                    - Địa chỉ: ${c.dia_chi_du_an}
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 2: GIÁ THUÊ VÀ THỜI HẠN</span><br>
                    - Giá thuê: <span class="bold">${new Intl.NumberFormat('vi-VN').format(c.gia)} VNĐ/tháng</span> (Chưa bao gồm điện, nước, phí dịch vụ).<br>
                    - Thời hạn thuê: <span class="bold">05 năm</span><br>
                    - Từ ngày: ${new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN')} đến ngày ${new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 3: TRÁCH NHIỆM CỦA BÊN B</span><br>
                    1. Sử dụng căn hộ đúng mục đích để ở cho bản thân và gia đình.<br>
                    2. Không được chuyển nhượng, cho thuê lại, thế chấp dưới mọi hình thức.<br>
                    3. Thanh toán tiền thuê và các chi phí sinh hoạt đúng hạn.<br>
                    4. Nếu vi phạm, Bên A có quyền đơn phương chấm dứt hợp đồng và thu hồi căn hộ mà không cần bồi thường.
                </div>

                <div class="section">
                    <span class="bold">ĐIỀU 4: CAM KẾT CHUNG</span><br>
                    Hai bên cam kết thực hiện đúng các điều khoản đã ghi trong hợp đồng. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.
                </div>

                <div class="sign">
                    <div>
                        <strong>ĐẠI DIỆN BÊN B</strong><br>
                        (Ký, ghi rõ họ tên)<br><br><br><br><br>
                        ${c.chu_ho}
                    </div>
                    <div>
                        <strong>ĐẠI DIỆN BÊN A</strong><br>
                        (Ký, đóng dấu)<br><br><br><br><br>
                        GIÁM ĐỐC BQL
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="container-fluid animate-fade-in">
            <h3 className="fw-bold text-primary mb-4">Quản Lý Hợp Đồng Cư Dân</h3>
            
            {loading ? <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div> : (
                <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                    <Card.Body className="p-0">
                        <Table hover responsive className="mb-0 align-middle">
                            <thead className="bg-light text-secondary">
                                <tr>
                                    <th className="ps-4">Mã HĐ</th>
                                    <th>Căn Hộ</th>
                                    <th>Chủ Hộ</th>
                                    <th>Thời Hạn (5 Năm)</th>
                                    <th>Trạng Thái</th>
                                    <th className="text-end pe-4">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.length > 0 ? contracts.map(c => (
                                    <tr key={c.id}>
                                        <td className="ps-4 fw-bold">#{c.id}</td>
                                        <td><Badge bg="primary">{c.ten_can_ho}</Badge></td>
                                        <td>
                                            <div className="fw-bold">{c.chu_ho}</div>
                                            <small className="text-muted">{c.phone}</small>
                                        </td>
                                        <td>
                                            <small>
                                                {new Date(c.ngay_bat_dau).toLocaleDateString('vi-VN')} 
                                                <i className="bi bi-arrow-right mx-1"></i> 
                                                {new Date(c.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                                            </small>
                                        </td>
                                        <td><Badge bg="success">Hiệu lực</Badge></td>
                                        <td className="text-end pe-4">
                                            <Button variant="outline-dark" size="sm" className="me-2 rounded-pill" onClick={() => handlePrint(c)}>
                                                <i className="bi bi-printer me-1"></i> In HĐ
                                            </Button>
                                            <Button variant="danger" size="sm" className="rounded-pill" onClick={() => handleBan(c.id, c.chu_ho)}>
                                                <i className="bi bi-slash-circle me-1"></i> Ban (Hủy)
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-4 text-muted">Chưa có hợp đồng nào</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default ContractManager;