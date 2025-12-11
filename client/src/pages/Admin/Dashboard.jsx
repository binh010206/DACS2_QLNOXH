import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Spinner, ProgressBar, Card, Row, Col } from 'react-bootstrap';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/thong-ke').then(res => {
            if(res.data.success) setStats(res.data.data.summary);
            setLoading(false);
        }).catch(err => { console.error(err); setLoading(false); });
    }, []);

    // --- COMPONENT VẼ BIỂU ĐỒ TRÒN (CSS) ---
    const PieChart = ({ data }) => {
        if (!data) return null;
        const total = data.reduce((sum, item) => sum + item.count, 0);
        let currentAngle = 0;
        const colors = { approved: '#198754', pending: '#ffc107', rejected: '#dc3545' };
        const labels = { approved: 'Đã duyệt', pending: 'Chờ duyệt', rejected: 'Từ chối' };

        const gradient = data.map(item => {
            const percentage = (item.count / total) * 100;
            const endAngle = currentAngle + percentage;
            const str = `${colors[item.trang_thai] || '#ccc'} ${currentAngle}% ${endAngle}%`;
            currentAngle = endAngle;
            return str;
        }).join(', ');

        return (
            <div className="d-flex align-items-center justify-content-around">
                <div style={{
                    width: '150px', height: '150px', borderRadius: '50%',
                    background: `conic-gradient(${gradient || '#eee 0% 100%'})`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}></div>
                <div>
                    {data.map((item, idx) => (
                        <div key={idx} className="mb-2 small d-flex align-items-center">
                            <span style={{width:12, height:12, background: colors[item.trang_thai], display:'inline-block', marginRight:8, borderRadius:2}}></span>
                            <strong>{labels[item.trang_thai] || item.trang_thai}</strong>: {item.count} ({Math.round(item.count/total*100)}%)
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // --- COMPONENT VẼ BIỂU ĐỒ CỘT (CSS) ---
    const BarChart = ({ data }) => {
        if (!data) return null;
        const max = Math.max(...data, 1); // Tránh chia cho 0
        return (
            <div className="d-flex align-items-end justify-content-between" style={{height: '200px', paddingBottom: '20px'}}>
                {data.map((val, idx) => (
                    <div key={idx} className="d-flex flex-column align-items-center" style={{width: '6%'}}>
                        <div className="bg-primary rounded-top" 
                             style={{
                                 width: '100%', 
                                 height: `${(val / max) * 100}%`, 
                                 minHeight: val > 0 ? '4px' : '0',
                                 transition: 'height 0.5s',
                                 opacity: 0.8
                             }} 
                             title={`${val} Hợp đồng`}>
                        </div>
                        <small className="text-muted mt-1" style={{fontSize: '10px'}}>T{idx + 1}</small>
                    </div>
                ))}
            </div>
        );
    };

    // Card thống kê số liệu
    const StatCard = ({ title, value, icon, gradient, delay }) => (
        <Col md={3} className="mb-4 animate-up" style={{ animationDelay: delay }}>
            <Card className="border-0 shadow-lg h-100 text-white overflow-hidden" style={{ background: gradient }}>
                <Card.Body className="position-relative p-4">
                    <div className="position-absolute end-0 top-50 translate-middle-y me-3 opacity-25">
                        <i className={`bi ${icon}`} style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h6 className="text-uppercase fw-bold opacity-75 mb-1">{title}</h6>
                    <h2 className="display-5 fw-bold">{value}</h2>
                </Card.Body>
            </Card>
        </Col>
    );

    if (loading || !stats) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;

    // Tính % lấp đầy (cho thanh progress)
    const percentFilled = stats.totalCanHo > 0 ? Math.round(((stats.totalCanHo - stats.canHoTrong) / stats.totalCanHo) * 100) : 0;

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <h3 className="fw-bold text-dark mb-4">Tổng Quan Dự Án</h3>
            
            {/* 1. SỐ LIỆU TỔNG QUAN */}
            <Row className="g-4 mb-4">
                <StatCard title="Tổng Căn Hộ" value={stats.totalCanHo} icon="bi-buildings" gradient="linear-gradient(135deg, #0d6efd, #0043a8)" delay="0s" />
                <StatCard title="Còn Trống" value={stats.canHoTrong} icon="bi-house-check" gradient="linear-gradient(135deg, #20c997, #0f7d5c)" delay="0.1s" />
                <StatCard title="Hồ Sơ Chờ" value={stats.hoSoChoDuyet} icon="bi-file-earmark-person" gradient="linear-gradient(135deg, #fd7e14, #d65b00)" delay="0.2s" />
                <StatCard title="Cư Dân" value={stats.totalCuDan} icon="bi-people" gradient="linear-gradient(135deg, #6f42c1, #481a96)" delay="0.3s" />
            </Row>

            {/* 2. BIỂU ĐỒ & THÔNG TIN CHI TIẾT */}
            <Row className="g-4 mb-4">
                {/* Biểu đồ Tròn: Tình trạng hồ sơ */}
                <Col lg={4} className="animate-up" style={{animationDelay: '0.4s'}}>
                    <Card className="border-0 shadow-sm h-100 rounded-4">
                        <Card.Header className="bg-white border-0 pt-4 px-4"><h6 className="fw-bold">📊 Tỉ lệ Hồ sơ</h6></Card.Header>
                        <Card.Body>
                            <PieChart data={stats.pieChart} />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Biểu đồ Cột: Hợp đồng theo tháng */}
                <Col lg={5} className="animate-up" style={{animationDelay: '0.5s'}}>
                    <Card className="border-0 shadow-sm h-100 rounded-4">
                        <Card.Header className="bg-white border-0 pt-4 px-4"><h6 className="fw-bold">📈 Hợp đồng mới (Năm nay)</h6></Card.Header>
                        <Card.Body>
                            <BarChart data={stats.barChart} />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tỉ lệ lấp đầy */}
                <Col lg={3} className="animate-up" style={{animationDelay: '0.6s'}}>
                    <Card className="border-0 shadow-sm h-100 rounded-4 bg-primary text-white" style={{background: 'linear-gradient(to bottom, #0d6efd, #0a58ca)'}}>
                        <Card.Body className="d-flex flex-column justify-content-center text-center">
                            <h6 className="opacity-75">Tỉ lệ lấp đầy</h6>
                            <h1 className="display-3 fw-bold my-3">{percentFilled}%</h1>
                            <ProgressBar variant="warning" now={percentFilled} style={{height: '8px', background: 'rgba(255,255,255,0.3)'}} />
                            <small className="mt-3 opacity-75">Mục tiêu: 100%</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 3. HOẠT ĐỘNG GẦN ĐÂY */}
            <Card className="border-0 shadow-sm rounded-4 animate-up" style={{animationDelay: '0.7s'}}>
                <Card.Header className="bg-white border-0 pt-4 px-4"><h6 className="fw-bold">⏱️ Hoạt động mới nhất</h6></Card.Header>
                <Card.Body className="p-0">
                    <div className="list-group list-group-flush">
                        {stats.recent && stats.recent.length > 0 ? stats.recent.map((item, idx) => (
                            <div key={idx} className="list-group-item border-0 px-4 py-3 d-flex align-items-center">
                                <div className={`rounded-circle p-2 me-3 ${item.type === 'application' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-success bg-opacity-10 text-success'}`}>
                                    <i className={`bi ${item.type === 'application' ? 'bi-file-earmark-plus' : 'bi-pen'}`}></i>
                                </div>
                                <div>
                                    <span className="fw-bold text-dark">{item.title}</span> 
                                    <span className="text-muted mx-1">{item.type === 'application' ? 'vừa nộp hồ sơ' : 'vừa ký hợp đồng'}</span>
                                    <br/>
                                    <small className="text-muted" style={{fontSize:'11px'}}>{new Date(item.created_at).toLocaleString('vi-VN')}</small>
                                </div>
                            </div>
                        )) : <div className="p-4 text-center text-muted">Chưa có hoạt động nào</div>}
                    </div>
                </Card.Body>
            </Card>

            <style>{`
                .animate-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.8s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default Dashboard;