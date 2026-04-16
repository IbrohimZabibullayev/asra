import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getApiUrl } from './utils/api'
import VerifyPage from './pages/VerifyPage'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import MerchantPage from './pages/MerchantPage'
import AuthChoicePage from './pages/AuthChoicePage'
import RegisterMerchantPage from './pages/RegisterMerchantPage'
import WaitlistPage from './pages/WaitlistPage'
import AddProductPage from './pages/AddProductPage'
import EditProductPage from './pages/EditProductPage'
import { Toaster } from 'react-hot-toast'
import BottomNav from './components/BottomNav'
import Header from './components/Header'
import { CartProvider } from './context/CartContext'
import TermsModal from './components/TermsModal'

export const AuthContext = createContext(null)
export const ThemeContext = createContext(null)

function App() {
    const [token, setToken] = useState(localStorage.getItem('asra_token'))
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [splashVisible, setSplashVisible] = useState(true)
    const [globalWaitlistMode, setGlobalWaitlistMode] = useState(import.meta.env.VITE_WAITLIST_MODE === 'true')

    const theme = user?.role === 'MERCHANT' ? 'merchant' : 'customer'

    useEffect(() => {
        const timer = setTimeout(() => {
            setSplashVisible(false)
        }, 2200)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (token) {
            fetchUser()
        } else {
            // Check for Telegram Auto-login
            const tg = window.Telegram?.WebApp;
            if (tg?.initData && !token) {
                autoLoginTelegram(tg.initData);
            } else {
                setLoading(false);
            }
        }
    }, [token])

    async function autoLoginTelegram(initData) {
        try {
            const res = await fetch(getApiUrl('/api/auth/telegram'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initData })
            });
            if (res.ok) {
                const data = await res.json();
                handleVerify(data.token, data.user, data.waitlistMode);
            }
        } catch (err) {
            console.error('Telegram auto-login failed:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    async function fetchUser() {
        try {
            const res = await fetch(getApiUrl('/api/me'), {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
                if (data.waitlistMode !== undefined) {
                    setGlobalWaitlistMode(data.waitlistMode)
                }
            } else {
                localStorage.removeItem('asra_token')
                setToken(null)
            }
        } catch (err) {
            console.error('Fetch user error:', err)
        } finally {
            setLoading(false)
        }
    }

    function handleVerify(newToken, userData, waitlistMode) {
        localStorage.setItem('asra_token', newToken)
        setToken(newToken)
        setUser(userData)
        if (waitlistMode !== undefined) {
            setGlobalWaitlistMode(waitlistMode)
        }
    }

    function handleSwitchRole(updatedUser) {
        setUser(updatedUser)
    }

    function handleLogout() {
        localStorage.removeItem('asra_token')
        setToken(null)
        setUser(null)
    }

    const termsKey = user ? `terms_accepted_${user.tg_id}_${user.role}` : null
    const showTermsModal = user && !localStorage.getItem(termsKey)

    function handleAcceptTerms() {
        localStorage.setItem(termsKey, '1')
        setUser({ ...user }) // force re-render
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Yuklanmoqda...</p>
            </div>
        )
    }

    const isWaitlistActive = globalWaitlistMode && user && user.role !== 'MERCHANT';

    return (
        <AuthContext.Provider value={{ token, user, setUser: handleSwitchRole, logout: handleLogout, fetchUser, setToken: handleVerify, globalWaitlistMode }}>
            <div className={`splash-container ${!splashVisible ? 'hidden' : ''}`}>
                <div className="splash-text">
                    <span className="splash-letter">A</span>
                    <span className="splash-letter">S</span>
                    <span className="splash-letter">R</span>
                    <span className="splash-letter">A</span>
                </div>
            </div>
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '0.9rem', borderRadius: '12px' } }} />
            
            {isWaitlistActive ? (
                <ThemeContext.Provider value={theme}>
                    <WaitlistPage />
                </ThemeContext.Provider>
            ) : (
                <CartProvider>
                    <ThemeContext.Provider value={theme}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <div className="app-layout">
                            <Header />
                            <div className="app-content">
                                <Routes>
                                    <Route path="/" element={<Navigate to={(globalWaitlistMode && !token) ? "/auth-choice" : "/home"} replace />} />
                                    <Route path="/home" element={<HomePage />} />
                                    <Route path="/auth-choice" element={<AuthChoicePage />} />
                                    <Route path="/register-merchant" element={<RegisterMerchantPage />} />
                                    <Route path="/verify" element={<VerifyPage onVerify={handleVerify} />} />
                                    <Route path="/add-product" element={<AddProductPage />} />
                                    <Route path="/edit-product/:id" element={<EditProductPage />} />
                                    <Route path="/orders" element={<OrdersPage />} />
                                    <Route path="/profile" element={<ProfilePage />} />
                                    <Route path="/notifications" element={<NotificationsPage />} />
                                    <Route path="/merchant" element={<MerchantPage />} />
                                    <Route path="/cart" element={<CartPage />} />
                                    <Route path="*" element={<Navigate to="/home" replace />} />
                                </Routes>
                            </div>
                            <BottomNav />
                            {showTermsModal && (
                                <TermsModal
                                    role={user.role}
                                    onAccept={handleAcceptTerms}
                                    onCancel={handleLogout}
                                />
                            )}
                        </div>
                    </BrowserRouter>
                </ThemeContext.Provider>
                </CartProvider>
            )}
        </AuthContext.Provider>
    )
}

export default App
