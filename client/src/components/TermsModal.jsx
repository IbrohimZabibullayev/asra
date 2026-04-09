import { useState, useRef, useEffect } from 'react'

export default function TermsModal({ role, onAccept, onCancel }) {
    const [scrolledToBottom, setScrolledToBottom] = useState(false)
    const [checked, setChecked] = useState(false)
    const contentRef = useRef(null)

    // Ensure it triggers if content is already too short to scroll
    useEffect(() => {
        if (contentRef.current) {
            const { scrollHeight, clientHeight } = contentRef.current
            if (scrollHeight <= clientHeight + 5) {
                setScrolledToBottom(true)
            }
        }
    }, [])

    function handleScroll(e) {
        const { scrollTop, scrollHeight, clientHeight } = e.target
        // allow 5px offset
        if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - 10) {
            setScrolledToBottom(true)
        }
    }

    const isMerchant = role === 'MERCHANT'

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div className="card" style={{ background: 'white', width: '100%', maxWidth: 500, borderRadius: 20, display: 'flex', flexDirection: 'column', maxHeight: '80vh', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ padding: 20, borderBottom: '1px solid var(--border-light)', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{isMerchant ? 'Sotuvchilar uchun "Shartlar"' : 'Xarid qilish shartlari'}</h2>
                </div>
                
                <div ref={contentRef} onScroll={handleScroll} style={{ padding: 20, overflowY: 'auto', flex: 1, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {isMerchant ? (
                        <>
                            <p style={{ marginBottom: 12 }}>Sotuvchi sifatida ro'yxatdan o'tayotganda quyidagi bandlarni tasdiqlashingiz shart:</p>
                            <p style={{ marginBottom: 16 }}><strong>Sifat nazorati:</strong> Platformaga faqat iste'molga yaroqli va yaroqlilik muddati hali o'tmagan mahsulotlarni joylashni kafolatlayman.</p>
                            <p style={{ marginBottom: 16 }}><strong>Haqqoniylik:</strong> Mahsulot tarkibi, saqlash sharoiti va muddati haqida noto'g'ri ma'lumot berish qat'iyan man etiladi.</p>
                            <p style={{ marginBottom: 16 }}><strong>Mustaqil javobgarlik:</strong> Iste'molchi sog'lig'iga yetkazilgan har qanday zarar yoki mahsulot sifati bo'yicha kelib chiqqan nizolar uchun to'g'ridan-to'g'ri javobgar ekanligimni tasdiqlayman. ASRA platformasini ushbu nizolardan xoli deb hisoblayman.</p>
                            <p style={{ marginBottom: 16 }}><strong>Bloklash:</strong> Qonun-qoidalarga rioya qilinmagan taqdirda, platforma mening profilimni ogohlantirishsiz o'chirish huquqiga ega.</p>
                        </>
                    ) : (
                        <>
                            <p style={{ marginBottom: 12, color: '#dc2626', fontWeight: 700 }}>Diqqat: Xarid qilish shartlari</p>
                            <p style={{ marginBottom: 12 }}>Ushbu mahsulotni sotib olish orqali siz quyidagi shartlarga rozilik bildirasiz:</p>
                            <p style={{ marginBottom: 16 }}><strong>Mahsulot holati:</strong> ASRA platformasidagi barcha mahsulotlar yaroqlilik muddati yakunlanishiga yaqin qolgan tovarlar hisoblanadi. Shu sababli ular katta chegirma bilan sotilmoqda.</p>
                            <p style={{ marginBottom: 16 }}><strong>Iste'mol muddati:</strong> Siz mahsulotni qadoqda ko'rsatilgan amal qilish muddati tugagunga qadar iste'mol qilishingiz shart. Muddat o'tgandan keyingi iste'mol bo'yicha barcha xavf-xatarlarni o'z zimmanizga olasiz.</p>
                            <p style={{ marginBottom: 16 }}><strong>Joyida tekshirish:</strong> Mahsulotni sotuvchidan qabul qilib olayotgan vaqtda uning sifati, qadog'i butunligi va yaroqlilik muddatini shaxsan tekshirib oling. Mahsulot topshirilgandan keyin (sotuvchi hududidan chiqqaningizdan so'ng) sifat bo'yicha da'volar qabul qilinmaydi va to'lov qaytarilmaydi.</p>
                            <p style={{ marginBottom: 16 }}><strong>Mas'uliyatni cheklash:</strong> ASRA platformasi faqatgina sotuvchi va xaridor o'rtasida axborot almashinuvi uchun vositachi hisoblanadi. Mahsulotning sifati, saqlash sharoitlariga rioya qilinishi va u keltirib chiqarishi mumkin bo'lgan har qanday sog'liqqa oid zararlar uchun platforma ma'muriyati javobgarlikni o'z zimmasiga olmaydi. Barcha huquqiy va moddiy javobgarlik bevosita mahsulotni sotuvchi (restoran, do'kon, qandolatchi) zimmasida.</p>
                        </>
                    )}
                </div>

                <div style={{ padding: 20, borderTop: '1px solid var(--border-light)', flexShrink: 0, background: '#f8fafc' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: scrolledToBottom ? 'pointer' : 'not-allowed', color: scrolledToBottom ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        <input 
                            type="checkbox" 
                            checked={checked} 
                            onChange={(e) => setChecked(e.target.checked)} 
                            disabled={!scrolledToBottom}
                            style={{ width: 22, height: 22, cursor: scrolledToBottom ? 'pointer' : 'not-allowed' }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Barcha shartlarga roziman</span>
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button className="btn btn-outline" onClick={onCancel} style={{ borderRadius: 12, height: 48 }}>Orqaga qaytish</button>
                        <button 
                            className="btn btn-primary" 
                            onClick={onAccept} 
                            disabled={!checked}
                            style={{ borderRadius: 12, opacity: checked ? 1 : 0.4, cursor: checked ? 'pointer' : 'not-allowed', height: 48 }}
                        >
                            Davom etish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
