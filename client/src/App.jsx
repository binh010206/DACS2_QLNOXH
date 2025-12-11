// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Import Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './pages/Admin/AdminLayout';
import UserLayout from './pages/User/UserLayout'; 

// Import Pages (Public)
import HomePage from './pages/Public/HomePage';
import Login from './pages/Login';
import ProjectList from './pages/Public/ProjectList';
import ProjectDetail from './pages/Public/ProjectDetail';
import News from './pages/Public/News';
import Contact from './pages/Public/Contact';
import SubmitProfile from './pages/Public/SubmitProfile';
import Notifications from './pages/User/Notifications';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={2000} />
      <Routes>
        {/* === KHU VỰC CÔNG KHAI === */}
        <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="du-an" element={<ProjectList />} />
            <Route path="/du-an/:id" element={<ProjectDetail />} />
            <Route path="tin-tuc" element={<News />} />
            <Route path="lien-he" element={<Contact />} />
            <Route path="nop-ho-so" element={<SubmitProfile />} />
        </Route>

        {/* === ĐĂNG NHẬP === */}
        <Route path="/login" element={<Login />} />

        {/* === ADMIN === */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* === USER === */}
        <Route path="/user/*" element={<UserLayout />} />
            <Route path="notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;