import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Apple, CheckCircle2 } from 'lucide-react'

function VerifyPage({ onVerify }) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (code.length !== 6) {
            setError('Iltimos, 6 xonali kodni kiriting')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(data.message || 'Muvaffaqiyatli tasdiqlandi!')
                setTimeout(() => {
                    onVerify(data.token, data.user)
                    navigate('/home')
                }, 800)
            } else {
                setError(data.error || 'Tasdiqlashda xatolik')
            }
        } catch (err) {
            setError('Server bilan aloqa yo\'q')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="verify-screen">
            <div className="verify-logo" style={{ color: 'var(--active-primary)' }}>
                <Apple size={40} />
            </div>
            <h1 className="verify-title">ASRA</h1>
            <p className="verify-subtitle">
                Oziq-ovqatni Tejash Platformasi<br />
                Tasdiqlash kodingizni kiriting
            </p>

            <form className="verify-form" onSubmit={handleSubmit}>
                <input
                    id="verify-code-input"
                    type="text"
                    className="input code-input"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    autoFocus
                    autoComplete="off"
                />

                {error && <div className="verify-error">{error}</div>}
                {success && <div className="verify-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckCircle2 size={18} /> {success}</div>}

                <button
                    id="verify-submit-btn"
                    type="submit"
                    className="btn btn-primary btn-full btn-lg"
                    disabled={loading || code.length !== 6}
                    style={{ opacity: loading || code.length !== 6 ? 0.6 : 1 }}
                >
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                            Tekshirilmoqda...
                        </>
                    ) : (
                        'Tasdiqlash'
                    )}
                </button>
            </form>

            <p style={{ marginTop: 32, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Kodingiz Telegram bot orqali yuborilgan
            </p>
        </div>
    )
}

export default VerifyPage
