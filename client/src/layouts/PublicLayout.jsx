import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
// Import logo (Lùi 1 cấp ra src -> vào assets)
import logoDeka from '../assets/deka-logo.jpg'; 

const PublicLayout = () => {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Header />
            
            {/* Nội dung chính các trang con sẽ hiện ở đây */}
            <main className="flex-grow-1">
                <Outlet />
            </main>

            {/* FOOTER DEKA BUILDING */}
            <footer className="bg-dark text-white py-5 mt-auto" style={{borderTop: '4px solid #0d6efd'}}>
                <div className="container">
                    <div className="row">
                        {/* Cột 1: Logo & Giới thiệu */}
                        <div className="col-md-4 mb-4">
                            <div className="d-flex align-items-center mb-3">
                                {/* Logo nền trắng nhỏ */}
                                <img src={logoDeka} alt="Logo" height="50" className="bg-white rounded p-1 me-3" />
                                <div>
                                    <h5 className="text-primary fw-black m-0 text-uppercase" style={{letterSpacing:'1px'}}>DEKA BUILDING</h5>
                                    <small className="text-white-50" style={{fontSize:'0.7rem'}}>CỔNG THÔNG TIN ĐIỆN TỬ</small>
                                </div>
                            </div>
                            <p className="small text-white-50 text-justify pe-3">
                                Hệ thống quản lý và xét duyệt hồ sơ nhà ở xã hội trực tuyến hàng đầu. Cam kết minh bạch, công bằng và hỗ trợ tối đa cho người dân có thu nhập thấp.
                            </p>
                        </div>

                        {/* Cột 2: Liên hệ (Khớp với trang Liên hệ) */}
                        <div className="col-md-4 mb-4">
                            <h6 className="fw-bold text-warning mb-3 text-uppercase">Thông Tin Liên Hệ</h6>
                            <ul className="list-unstyled small text-white-50">
                                <li className="mb-2 d-flex align-items-start">
                                    <i className="bi bi-geo-alt-fill me-2 text-danger mt-1"></i> 
                                    <span>123 Nguyễn Văn Linh, Đà Nẵng</span>
                                </li>
                                <li className="mb-2">
                                    <i className="bi bi-telephone-fill me-2 text-success"></i> 
                                    <span>111 222 666</span>
                                </li>
                                <li className="mb-2">
                                    <i className="bi bi-envelope-fill me-2 text-primary"></i> 
                                    <span>hotro@deka.vn</span>
                                </li>
                                <li>
                                    <i className="bi bi-clock-fill me-2 text-info"></i> 
                                    <span>Thứ 2 - Thứ 6: 07:30 - 17:00</span>
                                </li>
                            </ul>
                        </div>

                        {/* Cột 3: Đăng ký nhận tin (Giao diện) */}
                        <div className="col-md-4">
                            <h6 className="fw-bold text-info mb-3 text-uppercase">Đăng Ký Nhận Tin</h6>
                            <p className="small text-white-50">Nhận thông báo mới nhất về các dự án mở bán và chính sách vay vốn.</p>
                            <div className="input-group mb-3">
                                <input type="text" className="form-control shadow-none border-0" placeholder="Email của bạn..." style={{borderRadius: '20px 0 0 20px'}} />
                                <button className="btn btn-primary fw-bold border-0" type="button" style={{borderRadius: '0 20px 20px 0'}}>Đăng Ký</button>
                            </div>
                            <div className="d-flex gap-3 mt-3">
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-facebook fs-5"></i></a>
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-youtube fs-5"></i></a>
                                <a href="#" className="text-white-50 hover-white"><i className="bi bi-tiktok fs-5"></i></a>
                            </div>
                        </div>
                    </div>
                    
                    <hr className="border-secondary opacity-25 my-4" />
                    
                    <div className="text-center small text-white-50">
                        © 2025 Bản quyền thuộc về <span className="text-white fw-bold">DEKA BUILDING TEAM</span>. All rights reserved.
                    </div>
                </div>
            </footer>
            
            <style>{`
                .hover-white:hover { color: #fff !important; transition: 0.3s; }
            `}</style>
        </div>
    );
};

export default PublicLayout;