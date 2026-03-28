import { useState } from 'react'
import { X, ExternalLink, Key } from 'lucide-react'
import { toast } from 'react-toastify'

function AuthModal({ onClose, onVerify }) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const BOT_LINK = "https://t.me/asrauz_bot"

    async function handleSubmit(e) {
        e.preventDefault()
        if (code.length !== 6) return

        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success('Xush kelibsiz! Tizimga muvaffaqiyatli kirdingiz.')
                onVerify(data.token, data.user)
            } else {
                setError(data.error || 'Kod noto\'g\'ri')
            }
        } catch (err) {
            setError('Server bilan aloqa yo\'q')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-handle"></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 className="modal-title" style={{ marginBottom: 0 }}>Ro'yxatdan o'tish</h2>
                    <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Buyurtma berish uchun Telegram botimizdan referal kod oling.
                    </p>
                    <a
                        href={BOT_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-full"
                        style={{ display: 'flex', justifyContent: 'center', gap: 10 }}
                    >
                        <ExternalLink size={18} />
                        Telegram Botga o'tish
                    </a>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Key size={14} /> 6 xonali kodni kiriting
                        </label>
                        <input
                            className="input code-input"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={code}
                            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                            required
                            autoFocus
                            style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                        />
                    </div>

                    {error && <div className="verify-error">{error}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading || code.length !== 6}
                    >
                        {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthModal
