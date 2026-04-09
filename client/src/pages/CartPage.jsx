import { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../App'
import { Trash2, Plus, Minus, ShoppingBag, ChevronRight, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

function CartPage() {
    const { cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useContext(CartContext)
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()

    async function handleCheckout() {
        if (!token) {
            toast.info('Iltimos, buyurtma berish uchun tizimga kiring')
            navigate('/profile')
            return
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems,
                    total: totalPrice
                })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Buyurtmangiz qabul qilindi!')
                clearCart()
                navigate('/orders')
            } else {
                toast.error(data.error || 'Xatolik yuz berdi')
            }
        } catch (err) {
            toast.error('Server bilan aloqa yo\'q')
        }
    }

    if (cartItems.length === 0) {
        return (
            <div>
                <div className="empty-state" style={{ marginTop: 80 }}>
                    <div className="empty-state-icon" style={{ background: 'var(--active-primary-bg)', color: 'var(--active-primary)', opacity: 1 }}>
                        <ShoppingBag size={40} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: 12 }}>Savatingiz bo'sh</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                        Hali hech narsa qo'shmadingiz. Mazali shirinliklarni tanlang!
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/home')}>
                        Xarid qilishni boshlash
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{ paddingBottom: 100 }}>
            <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cartItems.map(item => {
                    const price = item.discount > 0
                        ? Math.round(item.price * (1 - item.discount / 100))
                        : item.price

                    return (
                        <div key={item.id} className="card" style={{ display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
                            <img src={item.image_url} alt={item.name} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 4 }}>{item.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--active-primary)', fontWeight: 600 }}>
                                    {price.toLocaleString()} so'm
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                    Sotuvchi: {item.merchant_name}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                <button
                                    style={{ background: 'none', border: 'none', color: '#ef4444', padding: 4, cursor: 'pointer' }}
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: 8, padding: '2px 4px' }}>
                                    <button onClick={() => updateQuantity(item.id, -1, item.stock)} style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer' }}>
                                        <Minus size={14} />
                                    </button>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1, item.stock)}
                                        style={{ border: 'none', background: 'none', padding: 4, cursor: 'pointer', opacity: item.quantity >= (item.stock || 99) ? 0.3 : 1 }}
                                        disabled={item.quantity >= (item.stock || 99)}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{
                position: 'fixed', bottom: 80, left: 0, right: 0,
                background: 'white', padding: '16px 20px',
                borderTop: '1px solid var(--border-light)',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Umumiy summa:</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalPrice.toLocaleString()} so'm</span>
                </div>
                <button
                    className="btn btn-primary btn-full"
                    style={{ height: 52, borderRadius: 16, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={handleCheckout}
                >
                    <CreditCard size={20} /> Rasmiylashtirish <ChevronRight size={18} />
                </button>
            </div>
        </div>
    )
}

export default CartPage
