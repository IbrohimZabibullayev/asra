import { useEffect, useContext, useMemo, useState } from 'react';
import { getApiUrl } from '../utils/api';
import { AuthContext } from '../App';

function WaitlistPage() {
    const { token } = useContext(AuthContext);
    const [waitlistCount, setWaitlistCount] = useState(0);

    useEffect(() => {
        // Tracker qoshiladi
        fetch(getApiUrl('/api/admin/waitlist-view'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error('Waitlist view tracking error:', err));

        // Get waitlist count
        fetch(getApiUrl('/api/waitlist/stats'))
            .then(res => res.json())
            .then(data => setWaitlistCount(data.count || 0))
            .catch(err => console.error('Waitlist count error:', err));
    }, [token]);

    const animatedFoods = useMemo(() => {
        const foods = ['🍎', '🍔', '🍕', '🥐', '🥬', '🍅', '🍉', '🥨', '🌮', '🍩', '🥑', '🥞', '🍇', '🍓', '🍑'];
        return foods.map((food, i) => ({
            id: i,
            icon: food,
            left: `${(i * 17) % 90 + 5}%`,
            top: `${(i * 23) % 90 + 5}%`,
            duration: `${15 + (i % 5)*4}s`,
            delay: `-${(i % 7)*3}s`
        }));
    }, []);

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(135deg, var(--c-primary), var(--c-primary-dark))',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            textAlign: 'center',
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            fontFamily: '"Times New Roman", Times, serif'
        }}>
            
            <style>
                {`
                @keyframes float-food {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(15px, -20px) rotate(10deg); }
                    50% { transform: translate(30px, 0px) rotate(20deg); }
                    75% { transform: translate(15px, 20px) rotate(10deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                }
                .food-icon {
                    position: absolute;
                    font-size: 2.5rem;
                    opacity: 0.15;
                    animation: float-food linear infinite;
                    pointer-events: none;
                }
                `}
            </style>
            
            {animatedFoods.map((item) => (
                <div key={item.id} className="food-icon" style={{
                    left: item.left,
                    top: item.top,
                    animationDuration: item.duration,
                    animationDelay: item.delay
                }}>
                    {item.icon}
                </div>
            ))}

            <div style={{ position: 'relative', zIndex: 10 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.3 }}>
                    Siz — birinchilardansiz. 💎
                </h1>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '20px', maxWidth: '350px', margin: '0 auto 20px' }}>
                    ASRA hozirda yopiq rejimda sinovdan o'tmoqda. Biz siz kabi ilk foydalanuvchilar uchun eshiklarni ochishga tayyorgarlik ko'ryapmiz.
                </p>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.5, opacity: 0.9, maxWidth: '350px', margin: '0 auto' }}>
                    Ishga tushishimiz bilan bot orqali shaxsiy taklifnoma yuboramiz. Kutganingizga arziydi.
                </p>
                {waitlistCount > 0 && (
                    <div style={{ marginTop: 24, padding: '12px 24px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, display: 'inline-block', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Hozirda <span style={{ fontWeight: 800, color: '#fcd34d', fontSize: '1.2rem' }}>{waitlistCount}</span> ta foydalanuvchi navbatda
                    </div>
                )}
            </div>
        </div>
    )
}

export default WaitlistPage;
