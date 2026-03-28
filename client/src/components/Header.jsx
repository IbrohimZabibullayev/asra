import { useContext } from 'react'
import { AuthContext } from '../App'
import { User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function Header() {
    const { user, token } = useContext(AuthContext)
    const navigate = useNavigate()

    const avatarUrl = user?.tg_id ? `/api/users/photo/${user.tg_id}` : null

    return (
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'var(--bg-glass)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-light)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/logo.png" alt="ASRA Logo" style={{ width: 50, height: 50, objectFit: 'contain' }} />

            </div>

            {token && user ? (
                <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '4px 12px', background: 'var(--active-primary-bg)', borderRadius: 20 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--active-primary)' }}>
                        {user.role === 'MERCHANT' ? (user.store_name || user.full_name) : user.full_name}
                    </span>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', border: '2px solid white', background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {user.role === 'MERCHANT' ? (
                            user.store_logo ? (
                                <img src={user.store_logo} alt="Store Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={18} color="var(--active-primary)" />
                            )
                        ) : (
                            avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={18} color="var(--active-primary)" />
                            )
                        )}
                    </div>
                </div>
            ) : (
                <div onClick={() => navigate('/auth-choice')} style={{ cursor: 'pointer', padding: '4px 12px', background: 'var(--active-primary-bg)', borderRadius: 20, color: 'var(--active-primary)', fontSize: '0.8rem', fontWeight: 700 }}>
                    Kirish
                </div>
            )}
        </header>
    )
}

export default Header
