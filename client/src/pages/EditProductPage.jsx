import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'
import { getApiUrl, getImageUrl } from '../utils/api'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Package, Image as ImageIcon, Check, Upload, Scale, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

function EditProductPage() {
    const { token } = useContext(AuthContext)
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        current_price: '',
        stock: '',
        unit: 'dona',
        is_active: true
    })

    useEffect(() => {
        fetchProduct()
    }, [])

    async function fetchProduct() {
        try {
            const res = await fetch(getApiUrl(`/api/products/${id}`))
            if (res.ok) {
                const { product } = await res.json()
                setFormData({
                    name: product.name,
                    price: product.price,
                    current_price: Math.round(product.price * (1 - product.discount / 100)),
                    stock: product.stock,
                    unit: product.unit,
                    is_active: product.is_active
                })
                if (product.image_url) {
                    setImagePreview(product.image_url)
                }
            } else {
                toast.error("Mahsulot topilmadi")
                navigate(-1)
            }
        } catch (err) {
            toast.error("Xatolik yuz berdi")
        } finally {
            setFetching(false)
        }
    }

    function handleImageChange(e) {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!formData.name || !formData.price || !formData.current_price || formData.stock === '') {
            toast.error('Barcha maydonlarni to\'ldiring')
            return
        }

        setLoading(true)
        try {
            let imageUrl = undefined
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

            const res = await fetch(getApiUrl(`/api/products/${id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    image_url: imageUrl
                })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Mahsulot tahrirlandi!')
                navigate(-1)
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

    if (fetching) return <div style={{ padding: 40, textAlign: 'center' }}>Yuklanmoqda...</div>

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
            <div style={{ background: 'white', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid var(--border-light)', position: 'sticky', top: 0, zIndex: 100 }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <ChevronLeft size={24} />
                </button>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Tahrirlash</div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ textAlign: 'center', background: 'white', padding: 20, borderRadius: 20, border: '1px solid var(--border-light)' }}>
                    <div style={{
                        width: '100%', height: 180, borderRadius: 16, background: '#f9fafb', border: '2px dashed #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 16
                    }}>
                        {imagePreview ? (
                            <img src={getImageUrl(imagePreview)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                <ImageIcon size={40} style={{ marginBottom: 8 }} />
                                <div style={{ fontSize: '0.75rem' }}>Mahsulot rasmini yuklang</div>
                            </div>
                        )}
                    </div>
                    <label className="btn btn-primary" style={{ display: 'inline-flex', padding: '12px 24px', cursor: 'pointer', fontWeight: 700 }}>
                        <Upload size={16} /> Rasmni o'zgartirish
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </label>
                </div>

                <div className="card" style={{ padding: 20, background: 'white', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Mahsulot nomi</label>
                        <input className="input" style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Asl narxi (so'm)</label>
                            <input type="number" className="input" style={inputStyle} value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label style={labelStyle}>Chegirmali narxi (so'm)</label>
                            <input type="number" className="input" style={inputStyle} value={formData.current_price} onChange={e => setFormData({ ...formData, current_price: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Qiymat turi</label>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                            {[
                                { key: 'dona', label: <><Package size={16} style={{ marginRight: 6 }} /> Dona</> },
                                { key: 'kg', label: <><Scale size={16} style={{ marginRight: 6 }} /> Kg</> }
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyle}>Ombordagi qoldiq</label>
                            <input
                                type="number"
                                step={formData.unit === 'kg' ? '0.1' : '1'}
                                className="input"
                                style={inputStyle}
                                value={formData.stock}
                                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Holati</label>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`btn btn-full ${formData.is_active ? 'btn-primary' : 'btn-outline'}`}
                            >
                                {formData.is_active ? <><Check size={18} /> Sotuvda</> : 'Zaxirada'}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-full btn-lg"
                    style={{ marginTop: 12 }}
                    disabled={loading}
                >
                    {loading ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'} <Check size={20} />
                </button>
            </form>
        </div>
    )
}

export default EditProductPage
