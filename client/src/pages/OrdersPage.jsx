import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { getApiUrl } from '../utils/api'
import { ClipboardList, ShoppingBag, Clock, QrCode, MapPin, Store, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toaster from 'react-hot-toast'

function OrdersPage() {
    const { token, user } = useContext(AuthContext)
    const [orders, setOrders] = useState([])
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, orderId: null })

    const isMerchant = user?.role === 'MERCHANT'

    useEffect(() => {
        if (token) {
            fetchOrders()
        }
    }, [token, isMerchant])

    async function fetchOrders() {
        try {
            const endpoint = isMerchant ? '/api/orders/merchant' : '/api/orders/my'
            const res = await fetch(getApiUrl(endpoint), {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setOrders(data.orders)
            }
        } catch (err) {
            console.error('Fetch orders error:', err)
        } finally {
            setLoading(false)
        }
    }

    function requestOrderStatusChange(orderId, action) {
        setConfirmModal({ isOpen: true, orderId, action })
    }

    async function handleOrderStatus() {
        const { orderId, action } = confirmModal;
        setConfirmModal({ isOpen: false, orderId: null, action: null });
        if (!orderId) return;

        try {
            const res = await fetch(getApiUrl(`/api/orders/${orderId}/${action}`), {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            if (res.ok) {
                toaster.success(data.message)
                const newStatus = action === 'accept' ? 'ACCEPTED' :
                    action === 'reject' ? 'REJECTED' :
                        action === 'receive' ? 'COMPLETED' :
                            action === 'cancel' ? 'CANCELLED' : 'PENDING';
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            } else {
                toaster.error(data.error)
            }
        } catch (err) {
            toaster.error("Server bilan xatolik")
        }
    }

    if (loading && token) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
                <div className="spinner"></div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yuklanmoqda...</div>
            </div>
        )
    }

    if (!token) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 320 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--active-primary-bg)', color: 'var(--active-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <ShoppingBag size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Buyurtmalar tarixi</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                        Xaridlaringizni kuzatish va yangi buyurtmalar berish uchun tizimga kiring.
                    </p>
                    <button
                        className="btn btn-primary btn-full"
                        style={{ height: 48, borderRadius: 12, fontWeight: 700 }}
                        onClick={() => window.open('https://t.me/asrauz_bot', '_blank')}
                    >
                        @asrauz_bot orqali kirish
                    </button>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="section">
                <div className="empty-state" style={{ marginTop: 80, textAlign: 'center' }}>
                    <div className="empty-state-icon" style={{ background: 'var(--active-primary-bg)', color: 'var(--active-primary)', borderRadius: '50%', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <ClipboardList size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Hozircha buyurtmalar yo'q</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                        {isMerchant ? 'Mijozlardan hali buyurtmalar kelmadi.' : 'Platformada birinchi xaridingizni amalga oshiring!'}
                    </p>
                    {!isMerchant && (
                        <button className="btn btn-outline btn-lg" onClick={() => navigate('/home')}>
                            Asosiy sahifaga o'tish
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div style={{ paddingBottom: 100 }}>
            <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {isMerchant ? 'Kelgan buyurtmalar' : 'Mening buyurtmalarim'}
                </h2>
                {orders.map(order => (
                    <div key={order.id} className="card" style={{ background: 'white', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ background: 'var(--active-primary-bg)', color: 'var(--active-primary)', padding: 8, borderRadius: 10 }}>
                                    {isMerchant ? <Store size={18} /> : <Clock size={18} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Buyurtma #{order.id.toString().slice(-4)}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className={`status-badge status-${order.status.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                                {order.status === 'PENDING' ? 'Kutilmoqda' :
                                    order.status === 'ACCEPTED' ? 'Tayyorlanmoqda' :
                                        order.status === 'COMPLETED' ? 'Qabul qilindi' :
                                            order.status === 'REJECTED' ? 'Rad etildi' :
                                                order.status === 'CANCELLED' ? 'Bekor qilindi' : order.status}
                            </div>
                        </div>

                        {/* Customer Info for Merchants */}
                        {isMerchant && order.customer && (
                            <div style={{ background: '#f0f9ff', padding: '12px', borderRadius: 12, marginBottom: 4 }}>
                                <div style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Xaridor</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0c4a6e' }}>{order.customer.full_name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>{order.customer.phone}</div>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {JSON.parse(order.items).map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                                        <span>{item.quantity}x {item.name}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()} so'm</span>
                                    </div>
                                    {!isMerchant && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                <Store size={14} /> <span>{item.merchant_name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <MapPin size={14} /> <span>{item.merchant_address}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: 12, marginTop: 4 }}>
                            <div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Umumiy</div>
                                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--active-primary)' }}>{order.total.toLocaleString()} so'm</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {isMerchant ? 'Mijoz Kodi' : 'Referal Kod'}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: 2 }}>{order.code}</div>
                            </div>
                        </div>

                        {!isMerchant && order.status === 'PENDING' && (
                            <button
                                onClick={() => requestOrderStatusChange(order.id, 'cancel')}
                                className="btn btn-outline btn-full"
                                style={{ color: '#dc2626', background: '#fef2f2', borderColor: '#fee2e2' }}
                            >
                                <XCircle size={16} /> Buyurtmani bekor qilish
                            </button>
                        )}
                        {!isMerchant && order.status === 'ACCEPTED' && (
                            <button
                                onClick={() => requestOrderStatusChange(order.id, 'receive')}
                                className="btn btn-primary btn-full"
                                style={{ background: '#22c55e' }}
                            >
                                Qabul qildim
                            </button>
                        )}
                        {isMerchant && order.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                <button
                                    onClick={() => requestOrderStatusChange(order.id, 'accept')}
                                    className="btn btn-primary"
                                    style={{ flex: 1, background: '#22c55e' }}
                                >
                                    Qabul qilish
                                </button>
                                <button
                                    onClick={() => requestOrderStatusChange(order.id, 'reject')}
                                    className="btn btn-primary"
                                    style={{ flex: 1, background: '#ef4444' }}
                                >
                                    Rad etish
                                </button>
                            </div>
                        )}

                        {!isMerchant && order.status !== 'CANCELLED' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--active-primary-bg)', padding: '10px 12px', borderRadius: 10, border: '1px dashed var(--active-primary)', marginTop: order.status === 'PENDING' ? 4 : 0 }}>
                                <QrCode size={16} color="var(--active-primary)" />
                                <span>Mahsulotni olishda ushbu kodni sotuvchiga ayting.</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {confirmModal.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card fade-in" style={{ background: 'white', padding: 24, width: '100%', maxWidth: 320, textAlign: 'center', borderRadius: 20 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <ClipboardList size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Amaliyotni tasdiqlaysizmi?</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Buyurtma holatini o'zgartirish bo'yicha so'rov yuborilmoqda.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button
                                className="btn btn-outline"
                                style={{ height: 48, borderRadius: 12, fontWeight: 700 }}
                                onClick={() => setConfirmModal({ isOpen: false, orderId: null, action: null })}
                            >
                                Bekor qilish
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ height: 48, borderRadius: 12, fontWeight: 700 }}
                                onClick={handleOrderStatus}
                            >
                                Ha, tasdiqlayman
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersPage
