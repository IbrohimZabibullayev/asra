import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PendingStores from './pages/PendingStores'
import UserManagement from './pages/UserManagement'
import ProductsPage from './pages/ProductsPage'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
    const [activePage, setActivePage] = useState('dashboard')

    return (
        <BrowserRouter>
            <div className="admin-layout">
                <Sidebar activePage={activePage} onNavigate={setActivePage} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/pending" element={<PendingStores />} />
                        <Route path="/users" element={<UserManagement />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
            <ToastContainer position="bottom-right" theme="colored" />
        </BrowserRouter>
    )
}

export default App
