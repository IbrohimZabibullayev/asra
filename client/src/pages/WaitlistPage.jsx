import { useEffect, useContext, useMemo } from 'react';
import { getApiUrl } from '../utils/api';
import { AuthContext } from '../App';
import { Pizza, Coffee, Utensils, ChefHat, Apple, Carrot, Croissant, Cake, IceCream, Cookie, Soup, Fish } from 'lucide-react';

function WaitlistPage() {
    const { token } = useContext(AuthContext);

    useEffect(() => {
        // Tracker qoshiladi
        fetch(getApiUrl('/api/admin/waitlist-view'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(err => console.error('Waitlist view tracking error:', err));
    }, [token]);

    const animatedFoods = useMemo(() => {
        const icons = [Pizza, Coffee, Utensils, ChefHat, Apple, Carrot, Croissant, Cake, IceCream, Cookie, Soup, Fish, Pizza, Coffee, Apple];
        return icons.map((IconClass, i) => {
            const size = 20 + (i * 13 % 45); // sizes between 20 and 65
            const opacity = 0.05 + (i * 7 % 20) / 100; // opacity between 0.05 and 0.24
            return {
                id: i,
                Icon: IconClass,
                size: size,
                left: `${(i * 17) % 90 + 5}%`,
                top: `${(i * 23) % 90 + 5}%`,
                duration: `${20 + (i % 5)*5}s`,
                delay: `-${(i % 7)*3}s`,
                opacity: opacity
            };
        });
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
                @keyframes float-complex {
                    0% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
                    25% { transform: translateY(-40px) translateX(25px) rotate(20deg) scale(1.1); }
                    50% { transform: translateY(-10px) translateX(50px) rotate(5deg) scale(0.9); }
                    75% { transform: translateY(30px) translateX(20px) rotate(-15deg) scale(1.05); }
                    100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
                }
                .food-icon {
                    position: absolute;
                    animation: float-complex ease-in-out infinite alternate;
                    pointer-events: none;
                }
                `}
            </style>
            
            {animatedFoods.map((item) => (
                <div key={item.id} className="food-icon" style={{
                    left: item.left,
                    top: item.top,
                    animationDuration: item.duration,
                    animationDelay: item.delay,
                    opacity: item.opacity
                }}>
                    <item.Icon size={item.size} strokeWidth={1.5} color="white" />
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
            </div>
        </div>
    )
}

export default WaitlistPage;
