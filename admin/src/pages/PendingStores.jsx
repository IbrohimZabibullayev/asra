import { useState, useEffect } from 'react'
import { getApiUrl, getImageUrl } from '../utils/api'
import { Clock, Check, X, Store, User, MapPin, FileText, BadgeCheck, Building2, Phone, ArrowUpRight, AlertCircle } from 'lucide-react'

function PendingStores() {
    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStores()
    }, [])

    async function fetchStores() {
        try {
            const res = await fetch(getApiUrl('/api/admin/pending-stores'))
            if (res.ok) {
                const data = await res.json()
                setStores(data.stores)
            }
        } catch (err) {
            console.error('Fetch stores error:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(id) {
        if (!confirm('Ushbu do\'konni tasdiqlaysizmi?')) return
        try {
            const res = await fetch(getApiUrl(`/api/admin/approve/${id}`), { method: 'POST' })
            if (res.ok) {
                setStores(stores.filter(s => s.id !== id))
            }
        } catch (err) {
            console.error('Approve error:', err)
        }
    }

    async function handleReject(id) {
        if (!confirm('Ushbu arizani rad etasizmi?')) return
        try {
            const res = await fetch(getApiUrl(`/api/admin/reject/${id}`), { method: 'POST' })
            if (res.ok) {
                setStores(stores.filter(s => s.id !== id))
            }
        } catch (err) {
            console.error('Reject error:', err)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Arizalar yuklanmoqda...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h1>Moderatsiya</h1>
                <p>Yangi do'konlar va biznes sub'ektlaridan kelgan arizalarni ko'rib chiqing.</p>
            </div>

            {stores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {stores.map(store => (
                        <div key={store.id} className="viz-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                                        {store.store_logo ? (
                                            <img src={getImageUrl(store.store_logo)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                                        ) : (
                                            <Store size={28} />
                                        )}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{store.store_name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} color="var(--primary)" /> {store.region}, {store.district}</span>
                                            <span style={{ color: '#e2e8f0' }}>|</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {store.phone}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => handleReject(store.id)} className="btn btn-outline" style={{ borderColor: '#fee2e2', color: '#dc2626' }}>
                                        <X size={16} /> Rad etish
                                    </button>
                                    <button onClick={() => handleApprove(store.id)} className="btn btn-primary">
                                        <Check size={16} /> Tasdiqlash
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                                <div style={{ background: '#f8fafc', padding: '24px', borderRadius: 20 }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 20, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building2 size={16} /> Biznes Ma'lumotlari
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Shakl:</span>
                                            <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{store.business_type}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: 8 }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>INN (STIR):</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{store.inn}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{store.business_type === 'MChJ' ? 'Kompaniya:' : 'F.I.Sh:'}</span>
                                            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', textAlign: 'right' }}>{store.business_type === 'MChJ' ? store.company_name : store.full_name}</span>
                                        </div>
                                        {store.business_type === 'MChJ' && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Mas'ul shaxs:</span>
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{store.responsible_person}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <MapPin size={16} /> Do'kon Manzili
                                        </h4>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                                            {store.store_address}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FileText size={16} /> Do'kon Tavsifi
                                        </h4>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                            {store.store_description || 'Tavsif berilmagan'}
                                        </p>
                                    </div>
                                    <div style={{ marginTop: 'auto', padding: '12px 16px', background: 'var(--primary-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <AlertCircle size={18} color="var(--primary)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 600 }}>Tuman: {store.district}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state" style={{ padding: '100px 0' }}>
                    <div className="empty-state-icon" style={{ opacity: 0.1, width: 100, height: 100, background: '#f1f5f9' }}>
                        <BadgeCheck size={60} />
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Hozircha arizalar yo'q</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Barcha yangi do'konlar ko'rib chiqilgan.</p>
                </div>
            )}
        </div>
    )
}

export default PendingStores
