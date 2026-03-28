import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Clock, Users, Leaf, Shield, Moon, Sun } from 'lucide-react'

function Sidebar({ activePage, onNavigate }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const savedTheme = localStorage.getItem('asra_admin_theme') || 'light'
        setTheme(savedTheme)
        document.documentElement.setAttribute('data-theme', savedTheme)
    }, [])

    function toggleTheme() {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('asra_admin_theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    const items = [
        { key: 'dashboard', path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
        { key: 'pending', path: '/pending', icon: Clock, label: 'Kutilayotgan arizalar', badge: true },
        { key: 'users', path: '/users', icon: Users, label: 'Foydalanuvchilar' },
    ]

    function handleClick(item) {
        onNavigate(item.key)
        navigate(item.path)
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon" style={{ background: 'var(--primary-bg)', color: 'var(--primary)', width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>ASRA</h2>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Boshqaruv paneli</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {items.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.key}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleClick(item)}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </nav>

            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={toggleTheme}
                    className="sidebar-item"
                    style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', display: 'flex', justifyContent: 'center' }}
                >
                    {theme === 'light' ? (
                        <><Moon size={20} /> <span>Tungi rejim</span></>
                    ) : (
                        <><Sun size={20} /> <span>Kunduzgi rejim</span></>
                    )}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--primary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <Shield size={18} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Admin</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Platform egasi</div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
