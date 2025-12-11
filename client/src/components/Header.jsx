import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';
    const isTransparent = isHome && !scrolled;
    const textColor = isTransparent ? '#fff' : '#333';
    const logoFill = isTransparent ? '#fff' : '#0d6efd';

    return (
        <Navbar 
            expand="lg" 
            fixed="top"
            className="py-3 transition-all"
            style={{ 
                backgroundColor: isTransparent ? 'transparent' : '#ffffff',
                boxShadow: isTransparent ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.4s ease',
            }}
        >
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M45 20L55 15V90H45V20Z" fill={logoFill}/>
                        <path d="M30 40L40 35V90H30V40Z" fill={logoFill} fillOpacity="0.8"/>
                        <path d="M60 35L70 40V90H60V35Z" fill={logoFill} fillOpacity="0.8"/>
                        <rect x="15" y="90" width="70" height="4" fill={logoFill}/>
                    </svg>
                    <div className="d-flex flex-column" style={{lineHeight: 1}}>
                        <span className="fw-black fs-5" style={{fontWeight: 900, color: logoFill, letterSpacing: '0.5px'}}>
                            DEKA BUILDING
                        </span>
                        <span style={{fontSize: '0.65rem', letterSpacing: '1px', color: textColor}}>CỔNG THÔNG TIN</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbarScroll" />
                
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="mx-auto fw-bold gap-4">
                        {[
                            {t: 'Trang chủ', p: '/'}, {t: 'Dự án', p: '/du-an'}, 
                            {t: 'Tin tức', p: '/tin-tuc'}, {t: 'Liên hệ', p: '/lien-he'}
                        ].map((item, idx) => (
                            <Nav.Link 
                                key={idx} as={Link} to={item.p} 
                                className={`nav-link-custom ${location.pathname === item.p ? 'active' : ''}`}
                                style={{color: textColor, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px'}}
                            >
                                {item.t}
                            </Nav.Link>
                        ))}
                    </Nav>

                    <div className="d-flex gap-2">
                        <Button 
                            variant="warning"
                            className="px-3 rounded-pill fw-bold text-dark shadow-sm"
                            onClick={() => navigate('/nop-ho-so')}
                        >
                            <i className="bi bi-file-earmark-arrow-up me-1"></i> Nộp Hồ Sơ
                        </Button>

                        <Button 
                            className="px-4 rounded-pill fw-bold shadow-sm"
                            style={{backgroundColor: '#0d6efd', border: 'none'}}
                            onClick={() => navigate('/login')}
                        >
                            <i className="bi bi-person-circle me-1"></i> Login
                        </Button>
                    </div>
                </Navbar.Collapse>
            </Container>
            <style>{`
                .nav-link-custom { position: relative; transition: color 0.3s; }
                .nav-link-custom::after {
                    content: ''; position: absolute; width: 0; height: 2px;
                    bottom: -2px; left: 0; background-color: #0d6efd;
                    transition: width 0.3s;
                }
                .nav-link-custom:hover::after, .nav-link-custom.active::after { width: 100%; }
            `}</style>
        </Navbar>
    );
};

export default Header;