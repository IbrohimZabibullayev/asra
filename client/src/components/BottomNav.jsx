import { useLocation, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'
import { CartContext } from '../context/CartContext'
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react'

function BottomNav() {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, token, globalWaitlistMode } = useContext(AuthContext)
    const { totalItems } = useContext(CartContext)
    const [pendingCount, setPendingCount] = useState(0)

    const isMerchant = user?.role === 'MERCHANT'
    const merchantStatus = user?.merchant_status || 'NONE'

    useEffect(() => {
        if (!isMerchant || !token) return;
        const fetchPending = async () => {
            try {
                const res = await fetch('/api/orders/merchant', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const count = data.orders.filter(o => o.status === 'PENDING').length;
                    setPendingCount(count);
                }
            } catch (err) { }
        };
        fetchPending();
        const interval = setInterval(fetchPending, 15000);
        return () => clearInterval(interval);
    }, [isMerchant, token]);

    const items = [
        { path: '/home', icon: Home, label: 'Asosiy' },
        ...(!isMerchant ? [{ path: '/cart', icon: ShoppingBag, label: 'Savat', badge: totalItems }] : []),
        { path: '/orders', icon: ClipboardList, label: 'Buyurtmalar', badge: isMerchant ? pendingCount : 0 },
        { path: '/profile', icon: User, label: isMerchant ? 'Do\'kon' : 'Profil' },
    ]

    if (globalWaitlistMode && !token) {
        return null;
    }

    return (
        <nav className="bottom-nav">
            {items.map(item => {
                const isActive = location.pathname === item.path || (item.path === '/profile' && location.pathname === '/merchant');
                const Icon = item.icon;

                return (
                    <button
                        key={item.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    >
                        <div style={{ position: 'relative' }}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            {item.badge > 0 && (
                                <span className="badge" style={{
                                    position: 'absolute', top: -5, right: -10,
                                    background: '#ef4444', color: 'white',
                                    fontSize: '0.65rem', padding: '2px 5px',
                                    borderRadius: 10, minWidth: 15, textAlign: 'center',
                                    fontWeight: 700, border: '2px solid white'
                                }}>
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span>{item.label}</span>
                    </button>
                )
            })}
        </nav>
    )
}

export default BottomNav
