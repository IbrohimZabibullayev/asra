import React, { useEffect } from 'react';
import { Bot, ExternalLink, MessageCircle, PlayCircle, ShieldCheck } from 'lucide-react';

const DemoPage = () => {
    useEffect(() => {
        if (!document.getElementById('inter-font')) {
            const link = document.createElement('link');
            link.id = 'inter-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
            document.head.appendChild(link);
        }
        
        if (!document.getElementById('tailwind-cdn')) {
            const script = document.createElement('script');
            script.id = 'tailwind-cdn';
            script.src = 'https://cdn.tailwindcss.com';
            document.head.appendChild(script);
            script.onload = () => {
                if (window.tailwind) {
                    window.tailwind.config = {
                        theme: {
                            extend: { 
                                colors: { primary: '#8fb996', black: '#0a0a0a' }, 
                                fontFamily: { sans: ['Inter', 'sans-serif'] } 
                            }
                        }
                    };
                }
            };
        }
    }, []);

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-primary selection:text-white pb-20">
            {/* Header / Nav */}
            <header className="border-b border-gray-100 bg-[#FAFAFA] sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">A</span>
                        </div>
                        <span className="font-bold text-lg tracking-tight">ASRA Demo</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/info" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Info</a>
                        <a href="https://t.me/asrauz_bot" target="_blank" rel="noreferrer" className="text-sm font-bold bg-primary text-white px-4 py-2 rounded-full hover:scale-105 transition-all">Botni Ochish</a>
                    </div>
                </div>
            </header>

            <main className="max-w-[1000px] mx-auto px-6 py-12 lg:py-20">
                {/* Hero / Video section */}
                <div className="space-y-8 text-center mb-20">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none mb-6">
                        ASRA Platformasi <br/> <span className="text-primary">Demo Taqdimoti.</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">
                        Oziq-ovqat isrofini kamaytirishga qaratilgan innovatsion tizimimizning ishlash jarayoni bilan yaqindan tanishing.
                    </p>
                </div>

                <div className="relative group rounded-[32px] overflow-hidden bg-gray-900 shadow-2xl aspect-video flex items-center justify-center border-8 border-gray-50">
                   {/* Placeholder for Video */}
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                   <div className="relative z-10 flex flex-col items-center gap-6">
                      <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-all cursor-pointer">
                         <PlayCircle size={48} className="text-white fill-white/20" />
                      </div>
                      <span className="text-white font-bold tracking-widest uppercase text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">Demo Video (1–5 daqiqa)</span>
                   </div>
                </div>

                {/* Video Description */}
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-gray-100 pt-16">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-3xl font-black flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span> Video tavsifi
                        </h2>
                        <div className="text-lg text-gray-600 leading-relaxed space-y-4">
                            <p>
                                Ushbu videoda biz ASRA platformasining barcha asosiy burchaklarini qamrab olganmiz. Siz quyidagilarni ko'rishingiz mumkin:
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="text-primary mt-1 shrink-0" size={20} />
                                    <span><strong>Sotuvchi (Merchant)</strong> paneli orqali mahsulotlarni oniy qo'shish va ularni boshqarish.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="text-primary mt-1 shrink-0" size={20} />
                                    <span><strong>Mijoz (Customer)</strong> interfeysida yaqin atrofdagi eng yaxshi takliflarni ko'rish va band qilish.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="text-primary mt-1 shrink-0" size={20} />
                                    <span>Telegram bot orqali oniy xabarnomalarning ishlashi va tartibga solingan buyurtmalar tizimi.</span>
                                </li>
                            </ul>
                            <p>
                                Bizning maqsadimiz — texnologiyalar orqali oziq-ovqat chiqindilarini qimmatli resurslarga aylantirish va hamma uchun manfaatli ekotizim yaratish.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-gray-50 border border-gray-100 p-8 rounded-[24px] space-y-6">
                            <h3 className="font-black text-xl">Havolalar</h3>
                            <div className="space-y-4 text-sm">
                                <a href="https://t.me/asrauz_bot" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all group">
                                    <span className="font-bold flex items-center gap-2"><Bot size={18} /> @asrauz_bot</span>
                                    <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <a href="https://t.me/zis_web" target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:text-primary transition-all group">
                                    <span className="font-bold flex items-center gap-2"><MessageCircle size={18} /> Dasturchi bilan bog'lanish</span>
                                    <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                            </div>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 p-8 rounded-[24px] text-center space-y-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                <span className="text-primary font-black">!</span>
                            </div>
                            <h4 className="font-bold text-gray-900">Ishlayotgan prototip</h4>
                            <p className="text-xs text-primary font-medium">Platformaning to'liq ishchi varianti hozirda Telegram bot shaklida mavjud.</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="mt-20 py-20 bg-zinc-900 text-center">
                <div className="max-w-[1200px] mx-auto px-6 space-y-8">
                    <h2 className="text-3xl lg:text-5xl font-black text-white">Kelajakni birga quramiz.</h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="https://t.me/asrauz_bot" target="_blank" rel="noreferrer" className="px-10 py-5 bg-primary text-black font-black rounded-full hover:scale-105 transition-all text-lg min-w-[240px]">
                            Botni ishga tushirish
                        </a>
                        <a href="mailto:contact@asra.uz" className="px-10 py-5 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/10 min-w-[240px]">
                            E-mail yuborish
                        </a>
                    </div>
                    <div className="pt-20 text-gray-500 text-xs font-medium tracking-widest uppercase">
                        &copy; 2026 ASRA. Barcha huquqlar himoyalangan.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DemoPage;
