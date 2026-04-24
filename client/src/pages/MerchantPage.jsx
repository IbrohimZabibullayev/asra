import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { getApiUrl, getImageUrl } from '../utils/api'
import { ChevronLeft, Plus, Package, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function MerchantPage() {
    const { user, token } = useContext(AuthContext)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const [inviteCode, setInviteCode] = useState(null)
    const [generatingInvite, setGeneratingInvite] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            const res = await fetch(getApiUrl('/api/products/my'), {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products)
            }
        } catch (err) {
            console.error('Fetch my products error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleGenerateInvite() {
        setGeneratingInvite(true)
        try {
            const res = await fetch(getApiUrl('/api/merchant/invite-code'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setInviteCode(data.invite_code)
                setTimeLeft(120) // 2 minutes
            }
        } catch (err) {
            console.error('Generate invite error:', err)
        } finally {
            setGeneratingInvite(false)
        }
    }

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
            return () => clearTimeout(timer)
        } else {
            setInviteCode(null)
        }
    }, [timeLeft])

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <div style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100, marginBottom: 16 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Mahsulotlarim</div>
            </div>

            {user?.merchant_status === 'PENDING' && (
                <div style={{ padding: '0 20px', marginBottom: 20 }}>
                    <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ color: '#d97706', marginTop: 2 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#92400e', marginBottom: 4 }}>Tasdiqlanmagan do'kon</div>
                            <div style={{ fontSize: '0.8rem', color: '#b45309', lineHeight: 1.4, fontWeight: 500 }}>
                                Do'koningiz hozirda admin tasdiqlashini kutmoqda. Siz mahsulot qo'shib borishingiz mumkin, ammo ular tasdiqlangandan so'ng xaridorlarga ko'rinadi.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ padding: '0 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => navigate('/add-product')} className="btn btn-primary" style={{ flex: 2, gap: 10 }}>
                        <Plus size={18} /> Mahsulot Qo'shish
                    </button>
                    <button 
                        onClick={handleGenerateInvite} 
                        className="btn btn-outline" 
                        style={{ flex: 1, gap: 6, fontSize: '0.8rem', padding: '0 10px', whiteSpace: 'nowrap' }} 
                        disabled={generatingInvite || timeLeft > 0}
                    >
                        {timeLeft > 0 ? (
                            <span style={{ fontWeight: 800 }}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        ) : (
                            <><UserPlus size={16} /> Sotuvchi</>
                        )}
                    </button>
                </div>
                
                {inviteCode && (
                    <div className="fade-in" style={{ marginTop: 12, padding: 16, background: 'var(--active-primary-bg)', borderRadius: 16, border: '1px dashed var(--active-primary)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--active-primary)', fontWeight: 600, marginBottom: 4 }}>Sotuvchi qo'shish kodi:</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: 4, color: 'var(--active-primary)' }}>{inviteCode}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Ushbu kodni 2 daqiqa ichida yangi sotuvchiga bering.</div>
                    </div>
                )}
            </div>

            <div style={{ padding: '0 20px' }}>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: 16 }}>
                        <div className="spinner"></div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Yuklanmoqda...</div>
                    </div>
                ) : products.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {products.map(p => (
                            <div key={p.id} onClick={() => navigate(`/edit-product/${p.id}`)} className="card" style={{ display: 'flex', gap: 12, padding: 12, cursor: 'pointer' }}>
                                <div style={{ width: 60, height: 60, background: 'var(--active-primary-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {p.image_url ? (
                                        <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Package size={24} color="var(--active-primary)" />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{p.name}</h4>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--active-primary)', fontWeight: 700 }}>{p.price.toLocaleString()} so'm</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {p.stock <= 0 ? (
                                        <span className="status-badge status-finished">Tugagan</span>
                                    ) : p.is_active ? (
                                        <span className="status-badge status-active">Sotuvda</span>
                                    ) : (
                                        <span className="status-badge status-disabled">Noaktiv</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state" style={{ background: 'white', borderRadius: 20, padding: 40 }}>
                        <div className="empty-state-icon" style={{ opacity: 0.2, marginBottom: 16 }}>
                            <Package size={48} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hozircha mahsulotlar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MerchantPage
