import { useState, useEffect } from 'react'
import { getApiUrl, getImageUrl } from '../utils/api'
import { toast } from 'react-toastify'
import { Search, Ban, X, Check } from 'lucide-react'

function ProductsPage() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [blockModal, setBlockModal] = useState({ isOpen: false, product: null, reason: '' })
    const [blockLoading, setBlockLoading] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            const res = await fetch(getApiUrl('/api/admin/products'))
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products)
            }
        } catch (err) {
            console.error(err)
            toast.error('Xatolik yuz berdi')
        } finally {
            setLoading(false)
        }
    }

    async function handleBlock() {
        if (!blockModal.reason.trim()) {
            toast.warning('Iltimos, sababni (izoh) kiriting')
            return
        }

        setBlockLoading(true)
        try {
            const res = await fetch(getApiUrl(`/api/admin/products/${blockModal.product.id}/block`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: blockModal.reason })
            })

            const data = await res.json()
            if (res.ok) {
                toast.success('Mahsulot bloklandi')
                setProducts(prev => prev.map(p => p.id === blockModal.product.id ? { ...p, is_moderated: true, is_active: false } : p))
                setBlockModal({ isOpen: false, product: null, reason: '' })
            } else {
                toast.error(data.error || 'Bloklashda xatolik')
            }
        } catch (err) {
            toast.error('Server xatosi')
        } finally {
            setBlockLoading(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.merchant_name?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="loading-state"><div className="spinner"></div> Yuklanmoqda...</div>

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2>Mahsulotlar</h2>
                    <p className="text-muted">Platformadagi barcha mahsulotlarni nazorat qilish</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', width: 250 }}>
                        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)' }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px', marginTop: '24px' }}>
                {filteredProducts.map(product => (
                    <div 
                        key={product.id} 
                        style={{ 
                            background: 'var(--bg-card)', 
                            borderRadius: '16px', 
                            padding: '20px', 
                            boxShadow: 'var(--shadow-sm)', 
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                            e.currentTarget.style.border = '1px solid var(--border)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            e.currentTarget.style.border = '1px solid var(--border-light)';
                        }}
                    >
                        {/* Status absolute indicator */}
                        <div style={{ position: 'absolute', top: 16, right: 16 }}>
                            {product.is_moderated ? (
                                <span className="badge" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }}>Bloklangan</span>
                            ) : product.is_active ? (
                                <span className="badge" style={{ background: '#ecfdf5', color: '#166534', border: '1px solid #bbf7d0' }}>Faol</span>
                            ) : (
                                <span className="badge" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>Nofaol</span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {product.image_url ? (
                                <img src={getImageUrl(product.image_url)} alt={product.name} style={{ width: 80, height: 80, borderRadius: '12px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
                            ) : (
                                <div style={{ width: 80, height: 80, borderRadius: '12px', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>Rasmsiz</div>
                            )}
                            <div style={{ flex: 1, paddingRight: '60px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.3' }}>{product.name}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{product.stock} {product.unit} qoldiq</div>
                            </div>
                        </div>

                        <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Sotuvchi</span>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{product.merchant_name || 'Noma\'lum do\'kon'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {product.region || 'Viloyat ko\'rsatilmagan'}</div>
                            </div>

                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Narx</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} so'm
                                </div>
                                {product.discount > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444', textDecoration: 'line-through', fontWeight: 600 }}>
                                        {product.price.toLocaleString()} so'm
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {new Date(product.created_at).toLocaleDateString()} yil
                            </span>
                            <button
                                onClick={() => setBlockModal({ isOpen: true, product, reason: '' })}
                                disabled={product.is_moderated}
                                style={{ 
                                    background: product.is_moderated ? 'transparent' : '#fef2f2', 
                                    color: product.is_moderated ? 'var(--text-muted)' : '#dc2626', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px',
                                    fontSize: '0.85rem', 
                                    fontWeight: 700,
                                    border: product.is_moderated ? '1px dashed var(--border)' : '1px solid transparent',
                                    cursor: product.is_moderated ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s',
                                    opacity: product.is_moderated ? 0.6 : 1
                                }}
                            >
                                {product.is_moderated ? <Check size={16} /> : <Ban size={16} />} 
                                {product.is_moderated ? 'Bloklangan' : 'Bloklash'}
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredProducts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                            <Search size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: 8 }}>Mahsulotlar topilmadi</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Boshqa qidiruv so'zini kiritib ko'ring yoki birozdan so'ng qayta tekshiring.</p>
                    </div>
                )}
            </div>

            {blockModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ width: '100%', maxWidth: 400, padding: 24, animation: 'fadeInUp 0.3s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Ban size={20} /> Mahsulotni bloklash
                            </h3>
                            <button onClick={() => setBlockModal({ isOpen: false, product: null, reason: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            <strong>{blockModal.product.name}</strong> mahsulotini bloklash uchun izoh qoldiring. Bu xabar sotuvchining telegram botiga yuboriladi.
                        </p>
                        <textarea
                            placeholder="Bloklash sababini batafsil yozing..."
                            value={blockModal.reason}
                            onChange={e => setBlockModal({ ...blockModal, reason: e.target.value })}
                            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)', minHeight: 100, marginBottom: 16, fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn" style={{ flex: 1, background: 'var(--border)', color: 'var(--text-primary)' }} onClick={() => setBlockModal({ isOpen: false, product: null, reason: '' })}>
                                Bekor qilish
                            </button>
                            <button className="btn" style={{ flex: 1, background: '#dc2626', color: 'white' }} onClick={handleBlock} disabled={blockLoading}>
                                {blockLoading ? 'Kuting...' : 'Bloklash'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsPage
