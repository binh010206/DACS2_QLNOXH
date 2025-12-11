import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Spinner, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Lấy danh sách thông báo của tôi (dùng route /thong-bao/my)
            const res = await api.get('/thong-bao/my'); 
            if (res.data.success) {
                setNotifications(res.data.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                // Đếm số thông báo chưa đọc
                setUnreadCount(res.data.data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            toast.error("Không thể tải thông báo.");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            // Dùng route PUT /thong-bao/:id/read
            await api.put(`/thong-bao/${id}/read`);
            fetchNotifications(); // Tải lại để cập nhật trạng thái
        } catch (error) {
            console.error("Lỗi đánh dấu đã đọc:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0">Thông báo từ BQL</h3>
                <Badge bg="primary" className="p-2 fs-6">Chưa đọc: {unreadCount}</Badge>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    {loading ? (
                        <div className="text-center py-5"><Spinner animation="border" size="sm" /> Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-5 text-muted">Bạn không có thông báo nào.</div>
                    ) : (
                        <ListGroup variant="flush">
                            {notifications.map(n => (
                                <ListGroup.Item 
                                    key={n.id} 
                                    className={`d-flex justify-content-between align-items-center cursor-pointer ${n.is_read ? 'bg-white' : 'bg-light fw-bold'}`}
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                >
                                    <div className="d-flex align-items-center">
                                        <i className={`bi bi-bell-fill me-3 ${n.is_read ? 'text-muted' : 'text-primary'}`}></i>
                                        <div>
                                            <div className={!n.is_read ? 'text-dark' : 'text-muted'}>{n.content}</div>
                                            <small className="text-secondary">{formatDate(n.created_at)}</small>
                                        </div>
                                    </div>
                                    {!n.is_read && <Badge bg="info" className="ms-3">MỚI</Badge>}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Notifications;