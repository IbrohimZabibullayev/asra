import { useState, useEffect } from 'react'
import { getApiUrl, getImageUrl } from '../utils/api'
import { Users, Store, Clock, ShoppingCart, TrendingUp, Calendar, BarChart3, PieChart as PieIcon, ArrowUpRight } from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        try {
            const res = await fetch(getApiUrl('/api/admin/stats'))
            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
            }
        } catch (err) {
            console.error('Stats error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Ma'lumotlar yuklanmoqda...</p>
            </div>
        )
    }

    const turnoverData = stats?.chartData || [
        { name: 'Du', value: 0 },
        { name: 'Se', value: 0 },
        { name: 'Ch', value: 0 },
        { name: 'Pa', value: 0 },
        { name: 'Ju', value: 0 },
        { name: 'Sha', value: 0 },
        { name: 'Yak', value: 0 },
    ]

    const audienceData = [
        { name: 'Mijozlar', value: stats?.totalUsers - stats?.activeMerchants || 0, color: '#8fb996' },
        { name: 'Sotuvchilar', value: stats?.activeMerchants || 0, color: '#f59e0b' }
    ]

    const orderStatusColors = {
        'Kutilmoqda': '#f59e0b',
        'Tayyorlanmoqda': '#3b82f6',
        'Qabul qilindi': '#22c55e',
        'Rad etildi': '#ef4444',
        'Bekor qilindi': '#94a3b8'
    }
    const orderStatusesData = (stats?.orderStatuses || []).map(item => ({
        ...item,
        color: orderStatusColors[item.name] || '#64748b'
    }));

    return (
        <div>
            <div className="page-header">
                <h1>Xush kelibsiz, Admin</h1>
                <p>Platformaning umumiy holati va moliyaviy ko'rsatkichlari bilan tanishing.</p>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#f0f7f1', color: '#8fb996' }}><TrendingUp size={24} /></div>
                        <div style={{ color: stats?.dailyGrowth >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            {stats?.dailyGrowth > 0 ? '+' : ''}{stats?.dailyGrowth ?? 0}% <ArrowUpRight size={14} style={{ transform: stats?.dailyGrowth < 0 ? 'rotate(90deg)' : 'none' }} />
                        </div>
                    </div>
                    <div className="stat-value">{(stats?.dailyTurnover || 0).toLocaleString()} <span style={{ fontSize: '1rem' }}>so'm</span></div>
                    <div className="stat-label">Bugungi aylanma</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><ShoppingCart size={24} /></div>
                    </div>
                    <div className="stat-value">{stats?.totalOrders || 0}</div>
                    <div className="stat-label">Jami buyurtmalar</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}><ShoppingCart size={24} /></div>
                    </div>
                    <div className="stat-value">{stats?.totalProducts || 0}</div>
                    <div className="stat-label">Barcha mahsulotlar</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Users size={24} /></div>
                    </div>
                    <div className="stat-value">{stats?.totalUsers || 0}</div>
                    <div className="stat-label">Ro'yxatdan o'tganlar</div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><Store size={24} /></div>
                    </div>
                    <div className="stat-value">{stats?.activeMerchants || 0}</div>
                    <div className="stat-label">Faol do'konlar</div>
                </div>
            </div>

            <div className="viz-grid">
                <div className="viz-card">
                    <h3><TrendingUp size={20} color="var(--primary)" /> Savdo tendensiyasi (Haftalik)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={turnoverData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    formatter={(value) => [`${value.toLocaleString()} so'm`, 'Aylanma']}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="viz-card">
                    <h3><PieIcon size={20} color="var(--primary)" /> Auditoriya</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={audienceData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {audienceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {audienceData.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}></div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.name}</span>
                                </div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="viz-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="viz-card">
                        <h3><PieIcon size={20} color="var(--primary)" /> Buyurtmalar holati</h3>
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={orderStatusesData}
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderStatusesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {orderStatusesData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }}></div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="viz-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                            <Store size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0, padding: 0 }}>Eng ko'p savdo qilgan do'konlar</h3>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            {stats?.topSellers && stats.topSellers.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {stats.topSellers.map((seller, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx !== stats.topSellers.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
                                                    {idx + 1}
                                                </div>
                                                {seller.logo ? (
                                                    <img src={getImageUrl(seller.logo)} alt={seller.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Store size={20} color="#94a3b8" />
                                                    </div>
                                                )}
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{seller.name}</div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                                {seller.total.toLocaleString()} so'm
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Hali savdolar yo'q</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981', margin: 0 }}><Calendar size={24} /></div>
                    <div>
                        <div className="stat-label">Haftalik umumiy</div>
                        <div className="stat-value" style={{ fontSize: '1.4rem', margin: 0 }}>{(stats?.weeklyTurnover || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>so'm</span></div>
                    </div>
                </div>
                <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="stat-icon" style={{ background: '#f0f9ff', color: '#0ea5e9', margin: 0 }}><BarChart3 size={24} /></div>
                    <div>
                        <div className="stat-label">Oylik umumiy</div>
                        <div className="stat-value" style={{ fontSize: '1.4rem', margin: 0 }}>{(stats?.monthlyTurnover || 0).toLocaleString()} <span style={{ fontSize: '0.8rem' }}>so'm</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
