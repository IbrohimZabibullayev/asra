import { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { Store, MapPin, Building2, Phone, ChevronLeft, Upload, CheckCircle2, Building, User } from 'lucide-react'
import { toast } from 'react-toastify'
import { UZ_REGIONS } from '../data/regions'

function RegisterMerchantPage() {
    const { token, setToken, setUser } = useContext(AuthContext)
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [logoPreview, setLogoPreview] = useState(null)
    const [logoFile, setLogoFile] = useState(null)

    const [formData, setFormData] = useState({
        store_name: '',
        store_logo: '',
        region: '',
        district: '',
        store_address: '',
        phone: '',
        verification_code: '',
        business_type: 'YTT',
        inn: '',
        full_name: '',
        company_name: '',
        responsible_person: ''
    })

    const districts = formData.region ? UZ_REGIONS[formData.region] : []

    function handleLogoChange(e) {
        const file = e.target.files[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    async function uploadImage(file) {
        const fd = new FormData()
        fd.append('image', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) return data.url
        throw new Error(data.error)
    }

    async function handleSubmit() {
        if (!token && formData.verification_code.length !== 6) {
            toast.error('Iltimos, 6 xonali tasdiqlash kodini kiriting')
            return
        }

        setLoading(true)
        try {
            let logoUrl = formData.store_logo
            if (logoFile) {
                logoUrl = await uploadImage(logoFile)
            }

            const headers = { 'Content-Type': 'application/json' }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/apply-merchant', {
                method: 'POST',
                headers,
                body: JSON.stringify({ ...formData, logo_url: logoUrl })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('So\'rov yuborildi! Admin tasdiqlashini kuting.')
                if (data.token) {
                    localStorage.setItem('asra_token', data.token)
                    setToken(data.token)
                }
                setUser(data.user)
                navigate('/profile')
            } else {
                toast.error(data.error || 'Xatolik yuz berdi')
            }
        } catch (err) {
            toast.error('Server bilan aloqa yo\'q')
        } finally {
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-light)',
        background: '#f9fafb', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s'
    }

    const labelStyle = {
        display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 700,
        color: 'var(--text-secondary)', marginLeft: 4
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            {/* Header */}
            <div style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Sotuvchi bo'lish</div>
            </div>

            <div style={{ padding: '24px 20px' }}>
                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 1 ? 'var(--active-primary)' : '#e2e8f0' }}></div>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? 'var(--active-primary)' : '#e2e8f0' }}></div>
                </div>

                {step === 1 ? (
                    <div className="fade-in">
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Do'kon ma'lumotlari</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>O'z do'koningiz haqidagi asosiy ma'lumotlarni kiriting.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div>
                                <label style={labelStyle}>Do'kon nomi</label>
                                <input style={inputStyle} value={formData.store_name} onChange={e => setFormData({ ...formData, store_name: e.target.value })} placeholder="ASRA Sweets" />
                            </div>

                            <div style={{ display: 'flex', gap: 16, alignItems: 'center', background: 'white', padding: 16, borderRadius: 16, border: '1px solid var(--border-light)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: 12, border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f9fafb', overflow: 'hidden' }}>
                                    {logoPreview ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={24} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Logo yuklash</div>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--active-primary-bg)', color: 'var(--active-primary)', borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                                        <Upload size={14} /> Rasm tanlash
                                        <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={labelStyle}>Viloyat</label>
                                    <select style={inputStyle} value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value, district: '' })}>
                                        <option value="">Tanlang</option>
                                        {Object.keys(UZ_REGIONS).map(reg => <option key={reg} value={reg}>{reg}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Tuman</label>
                                    <select style={inputStyle} value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} disabled={!formData.region}>
                                        <option value="">Tanlang</option>
                                        {districts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Aniq manzil</label>
                                <input style={inputStyle} value={formData.store_address} onChange={e => setFormData({ ...formData, store_address: e.target.value })} placeholder="Ko'cha, uy raqami, mo'ljal" />
                            </div>

                            <div>
                                <label style={labelStyle}>Telefon raqam</label>
                                <input style={inputStyle} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+998 90 123 45 67" />
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', height: 56, borderRadius: 16, marginTop: 40, fontSize: '1rem', fontWeight: 800 }}
                            onClick={() => setStep(2)}
                            disabled={!formData.store_name || !formData.region || !formData.district || !formData.phone || !formData.store_address}
                        >
                            Keyingisi <ArrowRight size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="fade-in">
                        <div style={{ marginBottom: 32 }}>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                <button
                                    onClick={() => setFormData({ ...formData, business_type: 'YTT' })}
                                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${formData.business_type === 'YTT' ? 'var(--active-primary)' : 'var(--border-light)'}`, background: 'white', fontWeight: 700, color: formData.business_type === 'YTT' ? 'var(--active-primary)' : 'var(--text-secondary)' }}
                                >
                                    YTT
                                </button>
                                <button
                                    onClick={() => setFormData({ ...formData, business_type: 'MChJ' })}
                                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: `2px solid ${formData.business_type === 'MChJ' ? 'var(--active-primary)' : 'var(--border-light)'}`, background: 'white', fontWeight: 700, color: formData.business_type === 'MChJ' ? 'var(--active-primary)' : 'var(--text-secondary)' }}
                                >
                                    MChJ
                                </button>
                            </div>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>Biznes ma'lumotlari</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formData.business_type} sifatida ro'yxatdan o'tish uchun quyidagilarni to'ldiring.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {formData.business_type === 'YTT' ? (
                                <>
                                    <div>
                                        <label style={labelStyle}>F.I.Sh (Sotuvchi)</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: 16, top: 16, color: '#94a3b8' }} />
                                            <input style={{ ...inputStyle, paddingLeft: 48 }} value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Alijon Valiyev" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>INN (STIR)</label>
                                        <input style={inputStyle} value={formData.inn} onChange={e => setFormData({ ...formData, inn: e.target.value })} placeholder="123456789" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={labelStyle}>Kompaniya nomi</label>
                                        <div style={{ position: 'relative' }}>
                                            <Building size={18} style={{ position: 'absolute', left: 16, top: 16, color: '#94a3b8' }} />
                                            <input style={{ ...inputStyle, paddingLeft: 48 }} value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} placeholder="ASRA LLC" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>INN (STIR)</label>
                                        <input style={inputStyle} value={formData.inn} onChange={e => setFormData({ ...formData, inn: e.target.value })} placeholder="123456789" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Mas'ul shaxs</label>
                                        <input style={inputStyle} value={formData.responsible_person} onChange={e => setFormData({ ...formData, responsible_person: e.target.value })} placeholder="Alijon Valiyev" />
                                    </div>
                                </>
                            )}

                            {!token && (
                                <div style={{ marginTop: 12, padding: 20, background: 'var(--active-primary-bg)', borderRadius: 16, border: '1px dashed var(--active-primary)' }}>
                                    <label style={{ ...labelStyle, color: 'var(--active-primary)' }}>Telegram Tasdiqlash Kodi</label>
                                    <input
                                        style={{ ...inputStyle, border: '1px solid var(--active-primary)', background: 'white' }}
                                        value={formData.verification_code}
                                        onChange={e => setFormData({ ...formData, verification_code: e.target.value })}
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--active-primary)', marginTop: 8, fontWeight: 600 }}>
                                        Kodingizni @asrauz_bot Telegram botidan oling.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
                            <button
                                className="btn btn-outline"
                                style={{ flex: 1, height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800 }}
                                onClick={() => setStep(1)}
                            >
                                Ortga
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, height: 56, borderRadius: 16, fontSize: '1rem', fontWeight: 800, gap: 10 }}
                                onClick={handleSubmit}
                                disabled={loading || !formData.inn}
                            >
                                {loading ? 'Yuborilmoqda...' : 'So\'rov yuborish'} <CheckCircle2 size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const ArrowRight = ({ size, color }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>

export default RegisterMerchantPage
