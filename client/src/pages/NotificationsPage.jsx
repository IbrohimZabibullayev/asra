import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { getApiUrl } from '../utils/api'
import { Bell, BellOff, ChevronRight, Package, Info, AlertCircle, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function NotificationsPage() {
    const { token, user } = useContext(AuthContext)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (token) fetchNotifications()
    }, [token])

    async function fetchNotifications() {
        try {
            const res = await fetch(getApiUrl('/api/notifications'), {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
            }
        } catch (err) {
            console.error('Fetch notifications error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function markAsRead(id) {
        try {
            await fetch(getApiUrl(`/api/notifications/read/${id}`), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        } catch (err) {
            console.error('Mark read error:', err)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <ShoppingCart size={20} />;
            case 'PRODUCT': return <Package size={20} />;
            case 'SYSTEM': return <AlertCircle size={20} />;
            default: return <Info size={20} />;
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <div className="spinner"></div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yuklanmoqda...</div>
            </div>
        )
    }

    return (
        <div style={{ paddingBottom: 100 }}>
            <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Xabarlar</h2>

                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            className="card"
                            style={{
                                padding: 16,
                                background: 'white',
                                display: 'flex',
                                gap: 16,
                                opacity: notif.is_read ? 0.7 : 1,
                                borderLeft: notif.is_read ? '4px solid transparent' : '4px solid var(--active-primary)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: notif.is_read ? '#f1f5f9' : 'var(--active-primary-bg)',
                                color: notif.is_read ? '#94a3b8' : 'var(--active-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {getIcon(notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{notif.title}</h3>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(notif.created_at).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state" style={{ marginTop: 60 }}>
                        <div className="empty-state-icon" style={{ opacity: 0.2 }}><BellOff size={48} /></div>
                        <p>Hozircha yangi xabarlar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NotificationsPage
