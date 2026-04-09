import { useState } from 'react'
import { X, Store, MapPin, FileText, Send, Building2, User, Phone, CheckCircle2, ChevronRight, ChevronLeft, Upload } from 'lucide-react'

const REGIONS_DATA = {
    'Toshkent': ['Yunusobod', 'Chilonzor', 'Mirzo Ulug\'bek', 'Yashnobod', 'Mirobod', 'Shayxontohur', 'Olmazor', 'Sergeli', 'Yakkasaroy', 'Uchtepa', 'Bektemir'],
    'Samarqand': ['Samarqand sh.', 'Pastdarg\'om', 'Oqdaryo', 'Bulung\'ur', 'Jomboy', 'Ishtixon', 'Kattaqo\'rg\'on', 'Narpay', 'Payariq', 'Paxtachi', 'Toyloq'],
    'Farg\'ona': ['Farg\'ona sh.', 'Marg\'ilon', 'Qo\'qon', 'Oltiariq', 'Bag\'dod', 'Beshariq', 'Buvayda', 'Dang\'ara', 'Quva', 'Rishton', 'Uchko\'prik'],
    // ... more regions can be added
}

const REGIONS = Object.keys(REGIONS_DATA);

function MerchantForm({ token, onClose, onApplied }) {
    const [step, setStep] = useState(1) // 1: Store Info, 2: Business Info, 3: Success
    const [formData, setFormData] = useState({
        store_name: '',
        store_address: '',
        store_description: '',
        region: 'Toshkent',
        district: '',
        phone: '',
        logo_url: null,
        business_type: 'YTT', // 'YTT' or 'MChJ'
        inn: '',
        company_name: '',
        responsible_person: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        if (e) e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/apply-merchant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (res.ok) {
                setStep(3)
                setTimeout(() => {
                    onApplied(data.user)
                }, 2000)
            } else {
                setError(data.error || 'Xatolik yuz berdi')
            }
        } catch (err) {
            setError('Server bilan aloqa yo\'q')
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    const handleLogoUpload = () => {
        // Mock logo upload for now
        setFormData({ ...formData, logo_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=100' })
    }

    if (step === 3) {
        return (
            <div className="modal-overlay">
                <div className="modal-content" style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <div style={{ color: '#22c55e', marginBottom: 20 }}>
                        <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>So'rov yuborildi!</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        Sizning do'koningiz muvaffaqiyatli yaratildi. Admin tasdiqlagach, mahsulotlaringiz hamma uchun ko'rinadi.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-handle"></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h2 className="modal-title" style={{ marginBottom: 0 }}>Sotuvchi bo'lish</h2>
                    <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Indicator */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <div style={{ flex: 1, h: 4, height: 4, borderRadius: 2, background: step >= 1 ? 'var(--active-primary)' : '#e2e8f0' }}></div>
                    <div style={{ flex: 1, h: 4, height: 4, borderRadius: 2, background: step >= 2 ? 'var(--active-primary)' : '#e2e8f0' }}></div>
                </div>

                {step === 1 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ textAlign: 'center', marginBottom: 10 }}>
                            <div
                                onClick={handleLogoUpload}
                                style={{ width: 80, height: 80, borderRadius: 20, background: '#f8fafc', border: '2px dashed #cbd5e1', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}
                            >
                                {formData.logo_url ? <img src={formData.logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={24} color="#64748b" />}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>DO'KON LOGOTIPI</span>
                        </div>

                        <div className="input-group">
                            <label><Store size={14} /> Do'kon nomi</label>
                            <input className="input" type="text" value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} placeholder="Masalan: Safia Food" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="input-group">
                                <label><MapPin size={14} /> Viloyat</label>
                                <select className="input" value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value, district: '' })}>
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label><MapPin size={14} /> Tuman</label>
                                <select className="input" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })}>
                                    <option value="">Tanlang...</option>
                                    {(REGIONS_DATA[formData.region] || []).map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label><MapPin size={14} /> Aniq manzil</label>
                            <input className="input" type="text" value={formData.store_address} onChange={e => setFormData({ ...formData, store_address: e.target.value })} placeholder="Ko'cha, uy raqami..." />
                        </div>

                        <div className="input-group">
                            <label><Phone size={14} /> Telefon raqam</label>
                            <input className="input" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+998" />
                        </div>

                        <button 
                            onClick={nextStep} 
                            className="btn btn-primary btn-full btn-lg"
                            disabled={!formData.store_name || !formData.store_address || !formData.phone || !formData.district}
                        >
                            Davom etish <ChevronRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="input-group">
                            <label><Building2 size={14} /> Biznes turi</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                <button
                                    className={`btn btn-sm ${formData.business_type === 'YTT' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setFormData({ ...formData, business_type: 'YTT' })}
                                >YTT</button>
                                <button
                                    className={`btn btn-sm ${formData.business_type === 'MChJ' ? 'btn-primary' : 'btn-outline'}`}
                                    onClick={() => setFormData({ ...formData, business_type: 'MChJ' })}
                                >MChJ</button>
                            </div>
                        </div>

                        {formData.business_type === 'YTT' ? (
                            <>
                                <div className="input-group">
                                    <label><User size={14} /> F.I.Sh (YTT egasi)</label>
                                    <input className="input" type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Ism familiyangiz" />
                                </div>
                                <div className="input-group">
                                    <label><FileText size={14} /> INN (STIR)</label>
                                    <input className="input" type="text" value={formData.inn} onChange={e => setFormData({ ...formData, inn: e.target.value })} placeholder="9 xonali son" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="input-group">
                                    <label><Building2 size={14} /> Kompaniya nomi</label>
                                    <input className="input" type="text" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="MChJ to\'liq nomi" />
                                </div>
                                <div className="input-group">
                                    <label><FileText size={14} /> INN (STIR)</label>
                                    <input className="input" type="text" value={formData.inn} onChange={e => setFormData({ ...formData, inn: e.target.value })} placeholder="9 xonali son" />
                                </div>
                                <div className="input-group">
                                    <label><User size={14} /> Mas'ul shaxs</label>
                                    <input className="input" type="text" value={formData.responsible_person} onChange={e => setFormData({ ...formData, responsible_person: e.target.value })} placeholder="Direktor yoki ma'mur" />
                                </div>
                            </>
                        )}

                        {error && <div className="verify-error">{error}</div>}

                        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                            <button onClick={prevStep} className="btn btn-outline btn-lg" style={{ flex: 1 }}>
                                <ChevronLeft size={18} /> Orqaga
                            </button>
                            <button onClick={handleSubmit} className="btn btn-primary btn-lg" style={{ flex: 2 }} disabled={loading}>
                                {loading ? 'Yuborilmoqda...' : <><Send size={18} /> So'rov yuborish</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MerchantForm
