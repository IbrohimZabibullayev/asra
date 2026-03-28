import { User, Store, RefreshCcw } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext, ThemeContext } from '../App'

function RoleSwitcher() {
    const { user, setUser, token } = useContext(AuthContext)
    const currentTheme = useContext(ThemeContext)

    async function handleSwitch(role) {
        if (user.role === role) return

        try {
            const res = await fetch('/api/switch-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (res.ok) {
                setUser(data.user)
            }
        } catch (err) {
            console.error('Role switch error:', err)
        }
    }

    return (
        <div className="role-switcher">
            <button
                className={`role-option ${user.role === 'CUSTOMER' ? 'active' : ''}`}
                onClick={() => handleSwitch('CUSTOMER')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
                <User size={16} />
                Mijoz
            </button>
            <button
                className={`role-option ${user.role === 'MERCHANT' ? 'active' : ''}`}
                onClick={() => handleSwitch('MERCHANT')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
                <Store size={16} />
                Sotuvchi
            </button>
        </div>
    )
}

export default RoleSwitcher
