import { useState, useEffect, useContext, useMemo } from 'react'
import { AuthContext } from '../App'
import { getApiUrl } from '../utils/api'
import ProductCard from '../components/ProductCard'
import AuthModal from '../components/AuthModal'
import { Flame, Sparkles, MapPin } from 'lucide-react'

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

function HomePage() {
    const { user, token, setToken } = useContext(AuthContext)
    const [products, setProducts] = useState([])
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [userCoords, setUserCoords] = useState(null)

    // Geolocation Detection
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            }, (error) => {
                console.warn("Geolocation denied");
                // Optional: set a flag to show a message to the user about why distances aren't shown
            });
        }
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const path = user?.region ? `/api/products?region=${encodeURIComponent(user.region)}` : '/api/products';
                const res = await fetch(getApiUrl(path));
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data.products || []);
                }
            } catch (err) {
                console.error("Fetch API products error", err);
            }
        };
        fetchProducts();
    }, [user?.region]);

    // Smooth Auto-Slider
    useEffect(() => {
        const slider = document.querySelector('.scroll-row');
        if (!slider) return;

        const interval = setInterval(() => {
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            if (slider.scrollLeft >= maxScroll - 5) {
                slider.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                slider.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Filter by user region
    const regionalProducts = useMemo(() => {
        const userRegion = user?.region ? user.region.replace(/ viloyati| sh\.| R\./gi, '').trim() : 'Toshkent';
        return products.filter(p => p.region && p.region.includes(userRegion));
    }, [user, products]);

    // Trending Slider Logic: 15km radius OR Newest (first 5 within region if no location)
    const trendingProducts = useMemo(() => {
        if (!userCoords) {
            // No location? Just show newest in region
            return [...regionalProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        }

        return regionalProducts.map(p => ({
            ...p,
            distance: calculateDistance(userCoords.lat, userCoords.lng, p.lat, p.lng)
        })).filter(p => p.distance <= 15 || (new Date() - new Date(p.created_at)) < 86400000) // 15km OR last 24h
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 6);
    }, [regionalProducts, userCoords]);

    return (
        <div style={{ paddingTop: 10 }}>
            {/* Nearby & New Slider */}
            <div className="section">
                <div className="section-title">
                    <Flame size={18} color="#ef4444" fill="#ef4444" /> {userCoords ? 'Yaqindagi va yangi takliflar' : 'Bugungi eng yaxshi takliflar'}
                </div>
                {userCoords && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} /> Hozirgi joylashuvingiz bo'yicha saralandi
                    </div>
                )}
                <div className="scroll-row">
                    {trendingProducts.length > 0 ? (
                        trendingProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                distance={userCoords ? calculateDistance(userCoords.lat, userCoords.lng, product.lat, product.lng) : null}
                            />
                        ))
                    ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '20px 0' }}>
                            Yaqinda takliflar yo'q
                        </div>
                    )}
                </div>
            </div>

            {/* Main Region Grid */}
            <div className="section">
                <div className="section-title">Hududingizdagi mahsulotlar</div>
                {regionalProducts.length > 0 ? (
                    <div className="product-grid">
                        {regionalProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                distance={userCoords ? calculateDistance(userCoords.lat, userCoords.lng, product.lat, product.lng) : null}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ opacity: 0.2 }}>
                            <Sparkles size={48} />
                        </div>
                        <div className="empty-state-text">Sizning viloyatingizda hozircha mahsulotlar yo'q</div>
                    </div>
                )}
            </div>

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onVerify={(tk, ur) => {
                        setToken(tk, ur)
                        setShowAuthModal(false)
                    }}
                />
            )}
        </div>
    )
}

export default HomePage
