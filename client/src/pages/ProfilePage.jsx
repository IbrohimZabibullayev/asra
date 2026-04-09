import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../App'
import RoleSwitcher from '../components/RoleSwitcher'
import MerchantForm from '../components/MerchantForm'
import AuthModal from '../components/AuthModal'
import { User, LogOut, ChevronRight, Store, ShieldCheck, Mail, LogIn, Bell, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
    const { user, logout, token, setToken, setUser } = useContext(AuthContext)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [orders, setOrders] = useState([])
    const [stats, setStats] = useState({ productsCount: 0, totalOrders: 0, totalTurnover: 0 })
    const navigate = useNavigate()

    useEffect(() => {
        if (token) {
            fetchNotifications()
            fetchOrders()
            if (user?.role === 'MERCHANT') {
                fetchMerchantStats()
            }
        }
    }, [token, user?.role])

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setNotifications(data.notifications)
            }
        } catch (err) {
            console.error('Fetch notifications error:', err)
        }
    }

    async function fetchOrders() {
        try {
            const res = await fetch('/api/orders/my', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setOrders(data.orders)
            }
        } catch (err) {
            console.error('Fetch orders error:', err)
        }
    }

    async function fetchMerchantStats() {
        try {
            const res = await fetch('/api/orders/stats/merchant', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (err) {
            console.error('Fetch stats error:', err)
        }
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    const [showLogoutModal, setShowLogoutModal] = useState(false)

    if (!token) {
        return (
            <div>
                <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                    <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: 400 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f3f4f6', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <User size={40} />
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>Xush kelibsiz!</h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
                            Profil sozlamalari, buyurtmalar tarixi va sotuvchi rejimi uchun tizimga kiring.
                        </p>
                        <button
                            className="btn btn-primary btn-full btn-lg"
                            onClick={() => navigate('/auth-choice')}
                        >
                            <LogIn size={20} /> Tizimga kirish
                        </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Hali ro'yxatdan o'tmaganmisiz?</p>
                        <button
                            style={{ background: 'none', border: 'none', color: 'var(--active-primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                            onClick={() => window.open('https://t.me/asrauz_bot', '_blank')}
                        >
                            @asrauz_bot orqali ro'yxatdan o'tish
                        </button>
                    </div>
                </div>

                {showAuthModal && (
                    <AuthModal
                        onClose={() => setShowAuthModal(false)}
                        onVerify={(tk, ur) => {
                            setToken(tk, ur)
                            setShowAuthModal(false)
                        }}
                    />
                )}
            </div>
        )
    }

    const avatarUrl = user?.tg_id ? `/api/users/photo/${user.tg_id}` : null
    const isMerchant = user?.role === 'MERCHANT'

    if (isMerchant) {
        return (
            <div style={{ paddingBottom: 100 }}>
                <div style={{ margin: '20px', borderRadius: 24, padding: '32px 24px', background: 'white', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, margin: '0 auto 16px', borderRadius: 20, background: 'var(--active-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user.store_logo ? <img src={user.store_logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={40} color="var(--active-primary)" />}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: 4 }}>{user.store_name}</h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>{user.region}, {user.district}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: '#dcfce7', color: '#15803d', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Tasdiqlangan do'kon
                    </div>
                </div>

                <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    <div className="card" style={{ padding: 16, background: '#f0f9ff', border: 'none' }}>
                        <div style={{ color: '#0369a1', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Aylanma</div>
                        <div style={{ color: '#0c4a6e', fontSize: '1.2rem', fontWeight: 900 }}>{stats.totalTurnover.toLocaleString()} so'm</div>
                    </div>
                    <div className="card" style={{ padding: 16, background: '#f5f3ff', border: 'none' }}>
                        <div style={{ color: '#6d28d9', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Buyurtmalar</div>
                        <div style={{ color: '#4c1d95', fontSize: '1.2rem', fontWeight: 900 }}>{stats.totalOrders} ta</div>
                    </div>
                    <div className="card" style={{ padding: 16, gridColumn: 'span 2', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Mahsulotlar</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 900 }}>{stats.productsCount} dona</div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/add-product')}>
                            <Plus size={16} /> Qo'shish
                        </button>
                    </div>
                </div>

                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="card" onClick={() => navigate('/add-product')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'white', cursor: 'pointer' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--active-primary-bg)', color: 'var(--active-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Yangi mahsulot</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platformaga shirinlik yuklash</div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>

                    <div className="card" onClick={() => navigate('/merchant')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'white', cursor: 'pointer' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Store size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>Mahsulotlarim</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mavjud assortimentni boshqarish</div>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>

                    <div className="card" onClick={() => setShowLogoutModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'white', cursor: 'pointer', marginTop: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LogOut size={22} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#dc2626' }}>Chiqish</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dashboarddan chiqish</div>
                        </div>
                    </div>
                </div>

                {showLogoutModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                        <div className="card" style={{ background: 'white', padding: 24, width: '100%', maxWidth: 320, textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <LogOut size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Chiqish</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Dashboarddan chiqmoqchimisiz?</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>Yo'q</button>
                                <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={logout}>Ha</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div style={{ paddingBottom: 100 }}>
            <div className="profile-card" style={{ margin: '20px', borderRadius: 24, padding: '32px 24px', background: 'linear-gradient(135deg, var(--active-primary), var(--active-primary-dark))', color: 'white', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 16px' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={40} />
                        )}
                    </div>
                </div>

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>{user?.full_name || 'Foydalanuvchi'}</h2>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: 16 }}>ID: {user?.tg_id}</p>

                {user?.is_verified && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'rgba(255,255,255,0.15)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                        <ShieldCheck size={14} /> Tasdiqlangan profil
                    </div>
                )}
            </div>

            <div style={{ padding: '0 20px', marginBottom: 24 }}>
                <div className="card" onClick={() => navigate('/orders')} style={{ padding: '20px', textAlign: 'center', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Mening Buyurtmalarim</div>
                    <div style={{ color: 'var(--active-primary)', fontSize: '1.5rem', fontWeight: 900 }}>{orders.length} ta</div>
                </div>
            </div>

            <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                <div className="card" onClick={() => navigate('/register-merchant')} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'white', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Sotuvchi bo'lish</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shaxsiy do'koningizni oching</div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                </div>

                <div className="card" onClick={() => setShowLogoutModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'white', cursor: 'pointer', marginTop: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LogOut size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626' }}>Chiqish</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hisobdan chiqish</div>
                    </div>
                </div>
            </div>

            {showLogoutModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div className="card" style={{ background: 'white', padding: 24, width: '100%', maxWidth: 320, textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <LogOut size={24} />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>Chiqish</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>Rostdan akkauntdan chiqmoqchimisiz?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>Yo'q</button>
                            <button className="btn btn-primary" style={{ background: '#dc2626', borderColor: '#dc2626' }} onClick={logout}>Ha</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePage
