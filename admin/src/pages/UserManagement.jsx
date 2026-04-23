import { useState, useEffect } from 'react'
import { getApiUrl } from '../utils/api'
import { Users, User, Store, ShieldCheck, ShieldAlert, Phone, AtSign, MapPin, Check, X, Search, Filter, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            setLoading(true)
            const res = await fetch(getApiUrl('/api/admin/users'))
            const data = await res.json()
            
            if (res.ok) {
                setUsers(data.users || [])
            } else {
                const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Foydalanuvchilarni yuklab bo\'lmadi');
                toast.error(errorMsg)
            }
        } catch (err) {
            console.error('Fetch users error:', err)
            toast.error('Server bilan bog\'lanishda xatolik')
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusToggle(user) {
        const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${user.id}/status`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                toast.success(data.message);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Server bilan aloqa yo\'q');
        }
    }

    async function handleDeleteUser() {
        if (!selectedUser) return;
        try {
            const res = await fetch(getApiUrl(`/api/admin/users/${selectedUser.id}`), {
                method: 'DELETE'
            });

            const data = await res.json();
            if (res.ok) {
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setShowDeleteModal(false);
                setSelectedUser(null);
                toast.success(data.message);
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Server bilan aloqa yo\'q');
        }
    }

    const filteredUsers = users.filter(u => {
        const userRole = (u.role || '').toUpperCase()
        const matchesFilter = filter === 'all' ||
            (filter === 'merchant' && userRole === 'MERCHANT') ||
            (filter === 'customer' && userRole === 'CUSTOMER')
        
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = !searchTerm || 
            u.full_name?.toLowerCase().includes(searchLower) ||
            u.phone?.includes(searchTerm) ||
            u.tg_id?.toString().includes(searchTerm)
            
        return matchesFilter && matchesSearch
    })

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Foydalanuvchilar ro'yxati yuklanmoqda...</p>
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h1>Foydalanuvchilar</h1>
                <p>Platforma foydalanuvchilari ro'yxati, rollari va faollik holati.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16 }}>
                <div style={{ display: 'flex', gap: 10, background: 'white', padding: '6px', borderRadius: 16, border: '1px solid var(--border-light)' }}>
                    {[
                        { key: 'all', label: 'Hammasi', icon: Users },
                        { key: 'customer', label: 'Mijozlar', icon: User },
                        { key: 'merchant', label: 'Sotuvchilar', icon: Store }
                    ].map(f => {
                        const Icon = f.icon;
                        const active = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 12,
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: active ? 'var(--primary-bg)' : 'transparent',
                                    color: active ? 'var(--primary-dark)' : 'var(--text-secondary)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={16} /> {f.label}
                            </button>
                        )
                    })}
                </div>

                <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                    <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        placeholder="Ism, telefon yoki ID bo'yicha qidirish..."
                        style={{
                            width: '100%',
                            height: 48,
                            paddingLeft: 48,
                            paddingRight: 16,
                            borderRadius: 16,
                            border: '1px solid var(--border)',
                            background: 'white',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Foydalanuvchi</th>
                            <th>Aloqa va ID</th>
                            <th>Hudud</th>
                            <th>Rol</th>
                            <th>Holat</th>
                            <th>Ro'yxatdan o'tgan</th>
                            <th style={{ textAlign: 'right' }}>Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                            <tr key={user.id} style={{ opacity: user.status === 'BLOCKED' ? 0.6 : 1 }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: user.status === 'BLOCKED' ? '#f1f5f9' : 'var(--primary-bg)', color: user.status === 'BLOCKED' ? '#94a3b8' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800 }}>
                                            {user.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.full_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username || 'username_yoq'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.phone || 'Tel kiritilmagan'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TG ID: {user.tg_id}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                        <MapPin size={14} color="var(--primary)" />
                                        <span style={{ fontWeight: 600 }}>{user.region}</span>
                                    </div>
                                    {(user.district || user.store_address) && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 20, maxWidth: 200 }}>
                                            {[user.district, user.store_address].filter(Boolean).join(', ')}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                                        <span className={user.role === 'MERCHANT' ? 'badge badge-warning' : 'badge badge-primary'} style={{ fontSize: '0.65rem' }}>
                                            {user.role === 'MERCHANT' ? 'SOTUVCHI' : 'MIJOZ'}
                                        </span>
                                        {user.is_waitlisted && (
                                            <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#9333ea', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>
                                                WAITLIST
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: user.status === 'BLOCKED' ? '#ef4444' : '#22c55e' }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: user.status === 'BLOCKED' ? '#991b1b' : '#166534' }}>
                                            {user.status === 'BLOCKED' ? 'Bloklangan' : 'Faol'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {new Date(user.created_at).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                        <button
                                            onClick={() => handleStatusToggle(user)}
                                            style={{
                                                padding: '6px 12px', borderRadius: 10, border: 'none',
                                                background: user.status === 'BLOCKED' ? '#f0fdf4' : '#fff1f2',
                                                color: user.status === 'BLOCKED' ? '#16a34a' : '#e11d48',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 700
                                            }}
                                            title={user.status === 'BLOCKED' ? 'Blokdan chiqarish' : 'Bloklash'}
                                        >
                                            {user.status === 'BLOCKED' ? <Check size={14} /> : <ShieldAlert size={14} />}
                                            {user.status === 'BLOCKED' ? 'Aktiv' : 'Blok'}
                                        </button>
                                        <button
                                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                            style={{
                                                width: 32, height: 32, borderRadius: 10, border: 'none',
                                                background: '#fee2e2', color: '#dc2626',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                            title="Butunlay o'chirish"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <Users size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Foydalanuvchilar topilmadi</div>
                                    <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                        {users.length > 0 
                                            ? `Filtrga mos keladigan foydalanuvchi yo'q (Jami: ${users.length} ta)` 
                                            : "Hali hech kim ro'yxatdan o'tmagan yoki ma'lumotlarni yuklab bo'lmadi."}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 12 }}>Foydalanuvchini o'chirish?</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 32, lineHeight: '1.6' }}>
                            <b>{selectedUser?.full_name}</b> va unga tegishli barcha ma'lumotlar (mahsulotlar, buyurtmalar) butunlay o'chirib tashlanadi. Bu amalni ortga qaytarib bo'lmaydi!
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                style={{ height: 48, borderRadius: 14, border: '1px solid var(--border)', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                style={{ height: 48, borderRadius: 14, border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer' }}
                            >
                                Ha, o'chirilsin
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserManagement
