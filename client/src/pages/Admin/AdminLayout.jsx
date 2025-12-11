import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Dashboard from './Dashboard';
import ApartmentManager from './ApartmentManager';
import HoSoManager from './HoSoManager';
import RequestManager from './RequestManager';
import ContractManager from './ContractManager';

const AdminLayout = () => {
    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            
            {/* Sidebar (Cố định width, chiều cao tự giãn) */}
            <div style={{ width: '280px', flexShrink: 0 }}>
                <Sidebar />
            </div>
            
            {/* Content (Giãn hết phần còn lại) */}
            <div className="flex-grow-1 p-4" style={{ 
                backgroundImage: 'linear-gradient(to bottom right, rgba(240,242,245,0.9), rgba(240,242,245,0.95)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000")',
                backgroundSize: 'cover', 
                backgroundPosition: 'center', 
                backgroundAttachment: 'fixed',
                minHeight: '100vh'
            }}>
                <div className="bg-white bg-opacity-75 p-4 rounded-4 shadow-lg h-100 border border-white" style={{backdropFilter: 'blur(10px)'}}>
                    <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="apartments" element={<ApartmentManager />} />
                        <Route path="applications" element={<HoSoManager />} />
                        <Route path="requests" element={<RequestManager />} />
                        <Route path="contracts" element={<ContractManager />} />
                        <Route path="*" element={<Dashboard />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;