import { useState, useContext } from 'react'
import { AuthContext } from '../App'
import { getApiUrl } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Package, Image as ImageIcon, Plus, Upload, Scale } from 'lucide-react'
import { toast } from 'react-toastify'

function AddProductPage() {
    const { token } = useContext(AuthContext)
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        current_price: '',
        stock: '',
        unit: 'dona' // dona or kg
    })

    function handleImageChange(e) {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!formData.name || !formData.price || !formData.current_price || !formData.stock) {
            toast.error('Barcha maydonlarni to\'ldiring')
            return
        }

        setLoading(true)
        try {
            let imageUrl = ''
            if (imageFile) {
                const fd = new FormData()
                fd.append('image', imageFile)
                const uploadRes = await fetch(getApiUrl('/api/upload'), { method: 'POST', body: fd })
                const uploadData = await uploadRes.json()
                if (uploadRes.ok) {
                    imageUrl = uploadData.url
                } else {
                    toast.error(uploadData.error || 'Rasm yuklanmadi')
                    setLoading(false)
                    return
                }
            }

            const res = await fetch(getApiUrl('/api/products'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: formData.price,
                    current_price: formData.current_price,
                    image_url: imageUrl,
                    stock: formData.stock,
                    unit: formData.unit
                })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Mahsulot qo\'shildi!')
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
        background: 'white', fontSize: '0.9rem', outline: 'none'
    }

    const labelStyle = {
        display: 'block', marginBottom: 8, fontSize: '0.8rem', fontWeight: 700,
        color: 'var(--text-secondary)', marginLeft: 4
    }

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <div style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Mahsulot qo'shish</div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Image Upload */}
                <div style={{ textAlign: 'center', background: 'white', padding: 20, borderRadius: 20, border: '1px solid var(--border-light)' }}>
                    <div style={{
                        width: '100%', height: 180, borderRadius: 16, background: '#f9fafb', border: '2px dashed #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16
                    }}>
                        {imagePreview ? (
                            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ImageIcon size={40} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: '0.75rem' }}>Mahsulot rasmini yuklang</div>
                            </div>
                        )}
                    </div>
                    <label className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', cursor: 'pointer', fontWeight: 700 }}>
                        <Upload size={16} /> Rasm tanlash
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                </div>

                {/* Product Info */}
                <div className="card" style={{ padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Mahsulot nomi</label>
                        <input style={inputStyle} placeholder="Napoleon torti" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Asl narxi (so'm)</label>
                            <input type="number" style={inputStyle} placeholder="100000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Hozirgi narxi (so'm)</label>
                            <input type="number" style={inputStyle} placeholder="75000" value={formData.current_price} onChange={e => setFormData({ ...formData, current_price: e.target.value })} />
                        </div>
                    </div>

                    {/* Unit Selector */}
                    <div>
                        <label style={labelStyle}>Qiymat turi</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            {[
                                { key: 'dona', label: <><Package size={16} style={{ marginRight: 6 }} /> Dona</> },
                                { key: 'kg', label: <><Scale size={16} style={{ marginRight: 6 }} /> Kilogramm</> }
                            ].map(u => (
                                <button
                                    key={u.key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, unit: u.key, stock: '' })}
                                    className={`btn ${formData.unit === u.key ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1 }}
                                >
                                    {u.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Miqdori ({formData.unit === 'kg' ? 'kg' : 'dona'})</label>
                        <input
                            type="number"
                            step={formData.unit === 'kg' ? '0.1' : '1'}
                            min="0"
                            style={inputStyle}
                            placeholder={formData.unit === 'kg' ? '3.5' : '10'}
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        />
                        {formData.unit === 'kg' && (
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, marginLeft: 4 }}>
                                Masalan: 3.5, 1.2, 0.5
                            </p>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full btn-lg"
                    style={{ marginTop: 12 }}
                    disabled={loading}
                >
                    {loading ? 'Saqlanmoqda...' : 'Mahsulotni yuklash'} <Plus size={20} />
                </button>
            </form>
        </div>
    )
}

export default AddProductPage
