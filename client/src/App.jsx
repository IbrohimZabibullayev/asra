import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import VerifyPage from './pages/VerifyPage'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import MerchantPage from './pages/MerchantPage'
import AuthChoicePage from './pages/AuthChoicePage'
import RegisterMerchantPage from './pages/RegisterMerchantPage'
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
            setLoading(false)
        }
    }, [token])

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    async function fetchUser() {
        try {
            const res = await fetch('/api/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setUser(data.user)
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

    function handleVerify(newToken, userData) {
        localStorage.setItem('asra_token', newToken)
        setToken(newToken)
        setUser(userData)
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
            <div className="loading-screen">
                <div className="spinner"></div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Yuklanmoqda...</p>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ token, user, setUser: handleSwitchRole, logout: handleLogout, fetchUser, setToken: handleVerify }}>
            <div className={`splash-container ${!splashVisible ? 'hidden' : ''}`}>
                <div className="splash-text">
                    <span className="splash-letter">A</span>
                    <span className="splash-letter">S</span>
                    <span className="splash-letter">R</span>
                    <span className="splash-letter">A</span>
                </div>
            </div>
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '0.9rem', borderRadius: '12px' } }} />
            <CartProvider>
                <ThemeContext.Provider value={theme}>
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                        <div className="app-layout">
                            <Header />
                            <div className="app-content">
                                <Routes>
                                    <Route path="/" element={<Navigate to="/home" replace />} />
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
        </AuthContext.Provider>
    )
}

export default App
