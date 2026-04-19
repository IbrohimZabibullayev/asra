import React, { useEffect } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, ThemeContext } from '../App';
import { CartProvider } from '../context/CartContext';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { Flame, Home, ShoppingBag, ClipboardList, User, ArrowRight, Check, X, Smartphone, ShieldCheck, Package } from 'lucide-react';

/* ─────────────────────────────────────────────
   MOCK DATA FOR DEMO PHONE
   ───────────────────────────────────────────── */
const DEMO_PRODUCTS = [
    {
        id: "mock-1", name: "Sutli Bulochka (6 dona)", discount: 50, price: 18000,
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
        merchant_name: "Safia (Yunusobod)", merchant_address: "Toshkent sh.",
        lat: 41.3611, lng: 69.2806, created_at: new Date(Date.now() - 3600000).toISOString(),
        stock: 5, region: "Toshkent"
    },
    {
        id: "mock-2", name: "Mevali Tort (Mini)", discount: 51, price: 45000,
        image_url: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&q=80",
        merchant_name: "Korzinka", merchant_address: "Toshkent sh.",
        lat: 41.3141, lng: 69.2306, created_at: new Date().toISOString(),
        stock: 2, region: "Toshkent"
    },
    {
        id: "mock-3", name: "Shokoladli Kruassan (3 dona)", discount: 40, price: 25000,
        image_url: "https://images.unsplash.com/photo-1530610476181-d83430b64dcc?w=600&q=80",
        merchant_name: "Breadly", merchant_address: "Toshkent sh.",
        lat: 41.2995, lng: 69.2401, created_at: new Date().toISOString(),
        stock: 10, region: "Toshkent"
    }
];

const DEMO_ORDERS = [
    {
        id: "mock-ord-1", created_at: new Date().toISOString(), status: "ACCEPTED",
        code: "A7B2X", total: 18000,
        items: JSON.stringify([{ name: "Sutli Bulochka (6 dona)", quantity: 2, price: 9000, merchant_name: "Safia" }]),
        customer: { full_name: "Azizbek Botirov", phone: "+998901234567" }
    }
];

/* ─────────────────────────────────────────────
   DEMO BOTTOM NAV (inside phone frame only)
   ───────────────────────────────────────────── */
const DemoBottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const items = [
        { path: '/home', icon: Home, label: 'Asosiy' },
        { path: '/cart', icon: ShoppingBag, label: 'Savat' },
        { path: '/orders', icon: ClipboardList, label: 'Buyurtmalar' },
        { path: '/profile', icon: User, label: 'Profil' },
    ];
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            padding: '8px 0', borderTop: '1px solid #e5e7eb',
            background: '#fff', flexShrink: 0, width: '100%',
        }}>
            {items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                    <button key={item.path} onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                            padding: '6px 16px', background: 'none', border: 'none', cursor: 'pointer',
                            color: isActive ? '#8fb996' : '#9ca3af',
                            fontSize: '0.65rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'color 0.2s',
                        }}>
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

/* ─────────────────────────────────────────────
   DEMO SCREENS (inside phone frame)
   ───────────────────────────────────────────── */
const DemoHomePage = () => (
    <div style={{ paddingTop: 10, paddingBottom: 80 }}>
        <div className="section">
            <div className="section-title">
                <Flame size={18} color="#ef4444" fill="#ef4444" /> Bugungi eng yaxshi takliflar
            </div>
            <div className="scroll-row no-scrollbar">
                {DEMO_PRODUCTS.map(p => <ProductCard key={p.id} product={p} distance={null} />)}
            </div>
        </div>
        <div className="section">
            <div className="section-title">Hududingizdagi mahsulotlar</div>
            <div className="product-grid">
                {DEMO_PRODUCTS.map(p => <ProductCard key={p.id} product={p} distance={null} />)}
            </div>
        </div>
    </div>
);

const DemoOrdersPage = () => (
    <div style={{ padding: '20px 16px', paddingBottom: 80 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 16, color: '#111' }}>Mening Buyurtmalarim</h2>
        {DEMO_ORDERS.map(order => {
            const items = JSON.parse(order.items || '[]');
            const first = items[0] || {};
            return (
                <div key={order.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ padding: '4px 8px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(143,185,150,0.15)', color: '#6b8f71' }}>qabul qilindi</div>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(order.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 style={{ fontWeight: 700, marginBottom: 4, fontSize: '1rem', color: '#111' }}>{first.merchant_name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 12 }}>
                        {items.map((i, idx) => <div key={idx}>{i.quantity}x {i.name}</div>)}
                    </div>
                    <div style={{ paddingTop: 12, borderTop: '1px dashed #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Kod: <strong style={{ color: '#111' }}>{order.code}</strong></span>
                        <span style={{ fontWeight: 800, color: '#8fb996' }}>{order.total.toLocaleString('ru-RU')} so'm</span>
                    </div>
                </div>
            );
        })}
    </div>
);

const MockProfilePage = () => (
    <div style={{ padding: 24, paddingBottom: 80, background: '#f9fafb', minHeight: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#8fb996', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>IS</div>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111' }}>Ibrohim Sayid</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: 500 }}>+998 90 123 45 67</p>
            </div>
        </div>
        <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: 16, paddingLeft: 4 }}>Sizning natijalaringiz</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8fb996' }}>1,250</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 4 }}>Cashback Ball</div>
            </div>
            <div style={{ background: '#fff', padding: 20, borderRadius: 16, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669' }}>5 kg</div>
                <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: 4 }}>Saqlab Qolindi</div>
            </div>
        </div>
    </div>
);

const DemoCartPage = () => (
    <div style={{ padding: 20, textAlign: 'center', paddingBottom: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 50, color: '#111' }}>Savatingiz bo'sh</h3>
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Siz haligacha hech narsa tanlamadingiz :)</p>
    </div>
);

/* ─────────────────────────────────────────────
   MAIN INFO PAGE
   ───────────────────────────────────────────── */
const InfoPage = () => {
    useEffect(() => {
        // Load Inter font
        if (!document.getElementById('info-inter-font')) {
            const link = document.createElement('link');
            link.id = 'info-inter-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
            document.head.appendChild(link);
        }
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Inter, -apple-system, sans-serif', color: '#111827' }}>
            <style>{`
                .info-page * { box-sizing: border-box; }
                .info-page a { text-decoration: none; color: inherit; }
                .hide-scroll::-webkit-scrollbar { display: none !important; width: 0 !important; }
                .hide-scroll { -ms-overflow-style: none !important; scrollbar-width: none !important; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .fade-in { animation: fadeInUp 0.6s ease forwards; }
            `}</style>

            <div className="info-page">

                {/* ── NAV ── */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 100,
                    background: 'rgba(249,250,251,0.85)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #e5e7eb',
                }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/logo.png" alt="ASRA Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>ASRA</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                            <a href="#demo-prototype" style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', cursor: 'pointer' }} onClick={e => { e.preventDefault(); document.getElementById('demo-prototype')?.scrollIntoView({ behavior: 'smooth' }); }}>Demo</a>
                            <a href="https://t.me/zis_web" target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>Bog'lanish</a>
                            <a href="https://t.me/asrauz_bot" target="_blank" rel="noreferrer"
                                style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', padding: '8px 20px', borderRadius: 999 }}>
                                Botni ochish
                            </a>
                        </div>
                    </div>
                </nav>

                {/* ── 1. HERO ── */}
                <section style={{ padding: '120px 24px 96px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.05,
                        letterSpacing: '-0.03em', color: '#111', marginBottom: 24,
                    }}>
                        Oziq-ovqat isrofiga<br />chek qo'yamiz.
                    </h1>
                    <p style={{ fontSize: 18, color: '#6b7280', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 400 }}>
                        Isrofni daromadga, texnologiyani ezgulikka aylantiramiz.
                    </p>
                    <a href="https://t.me/asrauz_bot" target="_blank" rel="noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: '#8fb996', color: '#fff', fontWeight: 700, fontSize: 16,
                            padding: '16px 36px', borderRadius: 999, transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Ilovani ishga tushirish (@asrauz_bot)
                        <ArrowRight size={18} />
                    </a>
                </section>

                {/* ── 2. PROBLEM & SOLUTION CARDS ── */}
                <section style={{ padding: '0 24px 96px', maxWidth: 1000, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {/* Problem */}
                        <div style={{
                            background: '#F3F4F6', borderRadius: 20, padding: '48px 36px',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12, background: '#FEE2E2',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                            }}>
                                <X size={24} color="#EF4444" strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                                Muammo
                            </h3>
                            <p style={{ fontSize: 20, fontWeight: 600, color: '#111', lineHeight: 1.5 }}>
                                Har kuni ko'plab sifatli mahsulotlar o'z egasini topishga ulgurmagani uchun chiqindiga tashlanadi.
                            </p>
                            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginTop: 12 }}>
                                Bu — ulkan iqtisodiy va ekologik yo'qotish.
                            </p>
                        </div>
                        {/* Solution */}
                        <div style={{
                            background: '#FFFFFF', borderRadius: 20, padding: '48px 36px',
                            border: '1px solid #e5e7eb',
                        }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 12, background: 'rgba(143,185,150,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
                            }}>
                                <Check size={24} color="#8fb996" strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8fb996', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
                                Yechim
                            </h3>
                            <p style={{ fontSize: 20, fontWeight: 600, color: '#111', lineHeight: 1.5 }}>
                                ASRA bilan mahsulotlar chiqindiga emas, o'z mijozlariga maxsus chegirmalar bilan sotiladi.
                            </p>
                            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginTop: 12 }}>
                                Biznes xarajatini qoplaydi, xaridor tejaydi.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 3. STICKY DEMO (SPLIT SCREEN) ── */}
                <section id="demo-prototype" style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 64 }}>
                        <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111' }}>
                            Qanday ishlaydi?
                        </h2>
                    </div>

                    <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Left - Steps */}
                        <div style={{ flex: 1, minWidth: 300, paddingTop: 40 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                                {[
                                    { step: '01', title: 'Bot orqali kiring', desc: 'Telegram orqali @asrauz_bot ni oching va "Start" tugmasini bosing. Hech qanday ro\'yxatdan o\'tish shart emas.', icon: Smartphone },
                                    { step: '02', title: 'Kodni tasdiqlang', desc: 'Tizim sizga Telegram orqali bir martalik kod yuboradi. Kodni kiritib, platformaga kiring.', icon: ShieldCheck },
                                    { step: '03', title: 'Buyurtma bering', desc: 'Yaqin hududingizdagi chegirmali mahsulotlarni ko\'ring va bir tugma bilan band qiling.', icon: Package },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: 56, height: 56, borderRadius: 16, background: '#F3F4F6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <item.icon size={24} color="#8fb996" strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#8fb996', letterSpacing: '0.1em', marginBottom: 6 }}>
                                                QADAM {item.step}
                                            </div>
                                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 8 }}>{item.title}</h3>
                                            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Sticky Phone */}
                        <div style={{ width: 380, flexShrink: 0, position: 'sticky', top: 100 }}>
                            {/* Live badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
                                <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
                                    <span style={{
                                        position: 'absolute', inset: 0, borderRadius: '50%', background: '#8fb996', opacity: 0.4,
                                        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                                    }} />
                                    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, borderRadius: '50%', background: '#8fb996' }} />
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Live Prototype
                                </span>
                            </div>

                            {/* iPhone Frame */}
                            <div style={{
                                width: 370, height: 760,
                                background: '#000', borderRadius: 46, padding: 10,
                                position: 'relative', margin: '0 auto',
                            }}>
                                {/* Dynamic Island */}
                                <div style={{
                                    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                                    width: 120, height: 28, background: '#000', borderRadius: 20, zIndex: 1500,
                                }} />

                                <div className="hide-scroll" style={{
                                    width: '100%', height: '100%', borderRadius: 36,
                                    overflow: 'hidden', background: '#fff',
                                    display: 'flex', flexDirection: 'column',
                                }}>
                                    <ThemeContext.Provider value="customer">
                                        <AuthContext.Provider value={{
                                            user: { full_name: "Ibrohim Sayid", role: "CUSTOMER", region: "Toshkent", tg_id: 123 },
                                            token: 'mock-token', setToken: () => {}, logout: () => {}, globalWaitlistMode: false
                                        }}>
                                            <CartProvider>
                                                <MemoryRouter initialEntries={['/home']}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
                                                        <Header />
                                                        <div className="hide-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                                                            <Routes>
                                                                <Route path="/home" element={<DemoHomePage />} />
                                                                <Route path="/cart" element={<DemoCartPage />} />
                                                                <Route path="/orders" element={<DemoOrdersPage />} />
                                                                <Route path="/profile" element={<MockProfilePage />} />
                                                                <Route path="*" element={<Navigate to="/home" replace />} />
                                                            </Routes>
                                                        </div>
                                                        <DemoBottomNav />
                                                    </div>
                                                </MemoryRouter>
                                            </CartProvider>
                                        </AuthContext.Provider>
                                    </ThemeContext.Provider>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3.5. JAMOA ── */}
                <section style={{ padding: '96px 24px', maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111', marginBottom: 40, textAlign: 'center' }}>
                        Jamoa
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                        {/* Ibrohim */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', marginBottom: 20, border: '2px solid #e5e7eb', flexShrink: 0 }}>
                                <img src="/founder-photo.jpg" alt="Ibrohim Zabibullayev" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>Ibrohim Zabibullayev</h3>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#8fb996', marginBottom: 16 }}>Founder & CEO</p>
                            <a href="https://t.me/zis_web" target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', textDecoration: 'underline' }}>t.me/zis_web</a>
                        </div>

                        {/* Claude */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', marginBottom: 20, background: '#CC785C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Claude_AI_logo.svg" alt="Claude" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>CLAUDE</h3>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#8fb996' }}>Product Architect & Full-stack</p>
                        </div>

                        {/* Antigravity */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', marginBottom: 20, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="/antigravity-logo.png" alt="Antigravity" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>ANTIGRAVITY</h3>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#8fb996' }}>Senior Full-stack Developer</p>
                        </div>

                        {/* Gemini */}
                        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', marginBottom: 20, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" alt="Gemini" style={{ width: 52, height: 52, objectFit: 'contain' }} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 4 }}>GEMINI</h3>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#8fb996' }}>Lead Strategy & Analyst</p>
                        </div>
                    </div>
                </section>

                {/* ── 4. WHY US ── */}
                <section style={{ padding: '0 24px 96px', maxWidth: 800, margin: '0 auto' }}>
                    <div style={{
                        background: '#fff', borderRadius: 20, padding: '56px 48px',
                        border: '1px solid #e5e7eb', textAlign: 'center',
                    }}>
                        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#111', marginBottom: 20 }}>
                            Nima uchun biz?
                        </h2>
                        <p style={{ fontSize: 18, color: '#374151', lineHeight: 1.8, maxWidth: 560, margin: '0 auto' }}>
                            2024-yilgacha oilaviy qandolatchilik bilan shug'ullanganmiz va bu bo'yicha real tajribaga egamiz. Biz muammoning ichki yechimini bilamiz.
                        </p>
                    </div>
                </section>

                {/* ── 5. ROADMAP ── */}
                <section style={{ padding: '96px 24px', maxWidth: 700, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111', marginBottom: 56, textAlign: 'center' }}>
                        Yo'l xaritasi
                    </h2>

                    <div style={{ position: 'relative', paddingLeft: 40 }}>
                        {/* Vertical line */}
                        <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: '#e5e7eb' }} />

                        {[
                            { title: 'Idea & Prototype', desc: '15 kun ichida g\'oyadan CustDev orqali tasdiqlangan haqiqiy prototipgacha yetib keldik.', done: true },
                            { title: 'MVP & Waitlist', desc: 'Hozirda talabalardan waitlist yig\'moqdamiz va sotuvchilar bilan muzokaralar olib boryapmiz.', current: true },
                            { title: 'Launch', desc: 'Tasdiqlangan hamkorlar bilan platformani keng miqyosda ishga tushirish.', done: false },
                            { title: 'POS Tizimlari Integratsiyasi', desc: 'Restoran va do\'konlarning mavjud kassa (POS) tizimlari bilan to\'liq integratsiya. Mahsulot qoldiqlari avtomatik ASRA platformasiga uzatiladi.', done: false },
                            { title: 'AI Integratsiyasi', desc: 'Muddati yaqinlashgan mahsulotlarni avtomatik aniqlash va ularni optimal chegirma narxlarda savdoga chiqarish uchun sun\'iy intellekt algoritmlari joriy etiladi.', done: false },
                        ].map((item, i, arr) => (
                            <div key={i} style={{ position: 'relative', marginBottom: i < arr.length - 1 ? 56 : 0 }}>
                                {/* Circle */}
                                <div style={{
                                    position: 'absolute', left: -33, top: 4,
                                    width: item.current ? 20 : 14, height: item.current ? 20 : 14,
                                    borderRadius: '50%',
                                    background: item.done || item.current ? '#8fb996' : '#fff',
                                    border: item.done || item.current ? 'none' : '3px solid #d1d5db',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginLeft: item.current ? -3 : 0,
                                    marginTop: item.current ? -3 : 0,
                                }}>
                                    {item.current && (
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                                    )}
                                </div>
                                <h4 style={{ fontSize: 18, fontWeight: 800, color: item.done || item.current ? '#111' : '#9ca3af', marginBottom: 6 }}>
                                    {item.title}
                                    {item.current && (
                                        <span style={{
                                            display: 'inline-block', marginLeft: 12,
                                            fontSize: 11, fontWeight: 700, color: '#8fb996', background: 'rgba(143,185,150,0.15)',
                                            padding: '2px 10px', borderRadius: 999,
                                        }}>HOZIR</span>
                                    )}
                                </h4>
                                <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 5.5. AMALGA OSHIRISH ── */}
                <section style={{ padding: '0 24px 96px', maxWidth: 1000, margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111', marginBottom: 40, textAlign: 'center' }}>
                        Amalga oshirish
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', border: '1px solid #e5e7eb' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <Smartphone size={22} color="#3B82F6" />
                            </div>
                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>Telegram Mini App</h4>
                            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                                Foydalanuvchilar hech qanday ilovani yuklamasdan, to'g'ridan-to'g'ri Telegram orqali platformadan foydalanishadi.
                            </p>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 32px', border: '1px solid #e5e7eb' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(143,185,150,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                <Package size={22} color="#8fb996" />
                            </div>
                            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#111', marginBottom: 8 }}>Real-time xabarnomalar</h4>
                            <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>
                                Mijozlarga yaqin atrofdagi eng sara chegirmalar haqida oniy Telegram xabarnomalari yuboriladi.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 6. FOOTER CTA ── */}
                <footer style={{ background: '#000', padding: '96px 24px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>
                        Kelajakni birga quramiz.
                    </h2>
                    <p style={{ fontSize: 16, color: '#9ca3af', marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
                        Oziq-ovqat isrofini texnologiya bilan hal qilish vaqti keldi.
                    </p>
                    <a href="https://t.me/zis_web" target="_blank" rel="noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            background: '#8fb996', color: '#fff', fontWeight: 700, fontSize: 16,
                            padding: '16px 40px', borderRadius: 999, transition: 'transform 0.2s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Hamkorlikni boshlash
                        <ArrowRight size={18} />
                    </a>
                    <div style={{ marginTop: 80, fontSize: 12, color: '#4b5563', letterSpacing: '0.05em' }}>
                        &copy; 2026 ASRA. Barcha huquqlar himoyalangan.
                    </div>
                </footer>

            </div>

            <style>{`
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default InfoPage;
