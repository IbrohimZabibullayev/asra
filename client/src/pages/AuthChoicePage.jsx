import { useContext } from 'react'
import { AuthContext } from '../App'
import { useNavigate } from 'react-router-dom'
import { User, Store, ArrowRight, Sparkles } from 'lucide-react'

function AuthChoicePage() {
    const { user, token } = useContext(AuthContext)
    const navigate = useNavigate()

    // If user is already a merchant, go to profile/home
    if (user?.role === 'MERCHANT') {
        navigate('/profile')
        return null
    }

    return (
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', minHeight: '90vh', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: 'var(--active-primary-bg)', color: 'var(--active-primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Sparkles size={28} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>Xush kelibsiz!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 280, margin: '0 auto' }}>
                    ASRA platformasidan qaysi maqsadda foydalanmoqchisiz?
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 400 }}>
                <div
                    onClick={() => navigate('/verify')}
                    style={{
                        background: 'white', padding: 16, borderRadius: 20, border: '2px solid transparent',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--active-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>Mijoz bo'lish</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Telegram orqali kod bilan kirish</div>
                    </div>
                    <ArrowRight size={18} color="var(--text-muted)" />
                </div>

                <div
                    onClick={() => navigate('/register-merchant')}
                    style={{
                        background: 'white', padding: 16, borderRadius: 20, border: '2px solid transparent',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--active-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Store size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>Sotuvchi bo'lish</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shaxsiy do'koningizni oching</div>
                    </div>
                    <ArrowRight size={18} color="var(--text-muted)" />
                </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 280 }}>
                Siz istalgan vaqtda mijoz rejimidan sotuvchi rejimiga o'tishingiz mumkin.
            </p>
        </div>
    )
}

export default AuthChoicePage
