import { useState, useEffect } from 'react'
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
            const res = await fetch('/api/admin/products')
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
            const res = await fetch(`/api/admin/products/${blockModal.product.id}/block`, {
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

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Mahsulot</th>
                            <th>Sotuvchi</th>
                            <th>Narxi</th>
                            <th>Holati</th>
                            <th>Sana</th>
                            <th align="right">Harakat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>Rasmsiz</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.stock} {product.unit}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{product.merchant_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.region}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                        {Math.round(product.price * (1 - product.discount / 100)).toLocaleString()} so'm
                                    </div>
                                    {product.discount > 0 && <div style={{ fontSize: '0.7rem', color: '#ef4444', textDecoration: 'line-through' }}>{product.price.toLocaleString()} so'm</div>}
                                </td>
                                <td>
                                    {product.is_moderated ? (
                                        <span className="badge badge-danger">Bloklangan</span>
                                    ) : product.is_active ? (
                                        <span className="badge badge-success">Faol</span>
                                    ) : (
                                        <span className="badge badge-warning">Nofaol</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(product.created_at).toLocaleDateString()}<br/>
                                        <span style={{ fontSize: '0.7rem' }}>{new Date(product.created_at).toLocaleTimeString().slice(0, 5)}</span>
                                    </div>
                                </td>
                                <td align="right">
                                    <button
                                        className="btn"
                                        style={{ background: product.is_moderated ? 'var(--border)' : '#fef2f2', color: product.is_moderated ? 'var(--text-muted)' : '#dc2626', padding: '6px 12px', fontSize: '0.8rem', opacity: product.is_moderated ? 0.5 : 1 }}
                                        disabled={product.is_moderated}
                                        onClick={() => setBlockModal({ isOpen: true, product, reason: '' })}
                                    >
                                        <Ban size={14} /> Bloklash
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredProducts.length === 0 && (
                            <tr>
                                <td colSpan="6" align="center" style={{ padding: 40, color: 'var(--text-muted)' }}>
                                    Mahsulotlar topilmadi
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
