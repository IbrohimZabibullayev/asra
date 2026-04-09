import { Store, MapPin, ShoppingBag, Plus, Minus, Clock } from 'lucide-react'
import { useContext } from 'react'
import { getImageUrl } from '../utils/api'
import { CartContext } from '../context/CartContext'

function ProductCard({ product, distance }) {
    const { cartItems, addToCart, updateQuantity } = useContext(CartContext)
    const cartItem = cartItems.find(item => item.id === product.id)
    const quantity = cartItem ? cartItem.quantity : 0

    const discountedPrice = product.discount > 0
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price

    // Use high quality confectionery/bakery images from Unsplash
    const imageUrl = getImageUrl(product.image_url) || `https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400`

    return (
        <div className="product-card" style={{ position: 'relative' }}>
            <img src={imageUrl} alt={product.name} className="product-card-image" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
            {product.discount > 0 && (
                <span className="discount-badge">-{Math.round(product.discount)}%</span>
            )}
            <div className="product-card-body" style={{ padding: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 0, height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
                    {product.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        <Store size={10} strokeWidth={2} />
                        <span style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.merchant_name || 'Sotuvchi'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <MapPin size={12} strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ lineHeight: 1.4 }}>
                            {product.merchant_address || 'Manzil'}
                            {distance && (
                                <span style={{ color: 'var(--active-primary)', fontWeight: 700, marginLeft: 4 }}>
                                    ({distance.toFixed(1)} km)
                                </span>
                            )}
                        </span>
                    </div>
                    {product.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            <Clock size={10} strokeWidth={2} />
                            <span>
                                {new Date(product.created_at).toLocaleDateString() === new Date().toLocaleDateString()
                                    ? `Bugun, ${new Date(product.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : `${new Date(product.created_at).toLocaleDateString('uz-UZ')} ${new Date(product.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 8 }}>
                    <div className="product-price" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
                        <span className="current" style={{ fontSize: '0.9rem', color: 'var(--active-primary)' }}>{discountedPrice.toLocaleString()} so'm</span>
                        {product.discount > 0 && (
                            <span className="original" style={{ fontSize: '0.7rem' }}>{product.price.toLocaleString()}</span>
                        )}
                        <div style={{ fontSize: '0.6rem', color: product.stock > 0 ? 'var(--text-muted)' : '#ef4444', marginTop: 2 }}>
                            {product.stock > 0 ? `${product.stock} dona mavjud` : 'Tugadi'}
                        </div>
                    </div>

                    {quantity > 0 ? (
                        <div className="qty-selector" style={{ display: 'flex', alignItems: 'center', background: 'var(--active-primary-bg)', borderRadius: 10, padding: 2 }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1, product.stock); }}
                                style={{ border: 'none', background: 'none', color: 'var(--active-primary)', padding: '4px 8px', cursor: 'pointer' }}
                            >
                                <Minus size={14} strokeWidth={3} />
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--active-primary)', minWidth: 20, textAlign: 'center' }}>
                                {quantity}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1, product.stock); }}
                                style={{ border: 'none', background: 'none', color: 'var(--active-primary)', padding: '4px 8px', cursor: 'pointer', opacity: quantity >= product.stock ? 0.3 : 1 }}
                                disabled={quantity >= product.stock}
                            >
                                <Plus size={14} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary btn-icon-sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                addToCart(product)
                            }}
                            disabled={product.stock === 0}
                        >
                            <ShoppingBag size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard
