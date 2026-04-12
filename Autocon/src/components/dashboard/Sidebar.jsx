import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../hooks/useWallet';
import { 
    LayoutDashboard, 
    Coins, 
    Image as ImageIcon, 
    Gavel, 
    ShieldCheck, 
    Bot, 
    UserCircle,
    ChevronLeft,
    Menu,
    Sun,
    Moon
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Token Generator', path: '/tokens', icon: Coins },
    { label: 'NFT Generator', path: '/nfts', icon: ImageIcon },
    { label: 'Auction Generator', path: '/auctions', icon: Gavel },
    { label: 'Security Audit', path: '/audit', icon: ShieldCheck },
    { label: 'AI Assistant', path: '/chatbot', icon: Bot },
    { label: 'Profile', path: '/profile', icon: UserCircle },
];

export default function Sidebar({ isExpanded = true, setIsExpanded, isMobileOpen, setIsMobileOpen }) {
    const { theme, toggleTheme } = useTheme();
    const { walletAddress } = useWallet();

    // Close mobile menu on route change implicitly via nav interaction or backdrop
    return (
        <>
        {/* Mobile Backdrop overlay */}
        {isMobileOpen && (
             <div 
                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                 onClick={() => setIsMobileOpen(false)}
             />
        )}
        <aside 
            className={`flex flex-col h-screen fixed left-0 top-0 backdrop-blur-2xl transition-all duration-300 ease-in-out z-50 
            ${isExpanded ? 'w-[252px]' : 'w-[72px]'}
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            style={{ background: 'var(--surface-high)', borderRight: '1px solid var(--outline-variant)' }}
        >
            {/* Logo area */}
            <div className="flex items-center justify-between p-4 mb-4 shadow-sm min-h-[72px]" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'}`}>
                    <div className="w-8 h-8 rounded-lg bg-[image:var(--image-primary-gradient)] flex items-center justify-center shrink-0">
                        <span className="font-space font-bold text-white text-lg leading-none">A</span>
                    </div>
                    <span className="font-space font-bold text-xl tracking-tight text-white truncate">AutoCon</span>
                </div>
                
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    {isExpanded ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5 mx-auto" />}
                </button>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 px-3 space-y-2 overflow-y-auto pb-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        onClick={() => { if (setIsMobileOpen) setIsMobileOpen(false); }}
                        className={({ isActive }) => `
                            group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden
                            ${isActive ? 'bg-white/10 shadow-sm relative' : 'hover:bg-white/5'}
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-lg" />
                                )}
                                <item.icon 
                                    className={`w-5 h-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} 
                                />
                                <span 
                                    className={`font-medium tracking-wide whitespace-nowrap transition-all duration-300 ${isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-primary'} ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}
                                >
                                    {item.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
            
            {/* Footer Area */}
            <div className={`p-3 transition-all duration-300 overflow-hidden ${isExpanded ? 'opacity-100' : ''}`} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                 {/* Theme Toggle */}
                 <button
                     onClick={toggleTheme}
                     title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                     className={`group flex items-center gap-4 w-full px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-white/5 overflow-hidden`}
                 >
                     {theme === 'dark' 
                         ? <Sun className="w-5 h-5 shrink-0 text-yellow-400 transition-colors" />
                         : <Moon className="w-5 h-5 shrink-0 text-indigo-400 transition-colors" />
                     }
                     <span className={`font-medium tracking-wide whitespace-nowrap text-slate-400 group-hover:text-white transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'}`}>
                         {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                     </span>
                 </button>

                 {isExpanded && (
                     <div className="text-xs text-slate-500 font-medium tracking-wider uppercase text-center mt-2">
                         Powered by AutoCon
                     </div>
                 )}

                 {/* Connected Wallet Pill — inline to avoid nested component anti-pattern */}
                 <div className="mt-2">
                     {walletAddress ? (
                         <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--on-surface)' }}>
                             <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
                             {isExpanded && <span className="font-mono truncate">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>}
                         </div>
                     ) : (
                         <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                              style={{ color: 'var(--outline)' }}>
                             <span className="h-2 w-2 rounded-full bg-gray-500 shrink-0" />
                             {isExpanded && 'Not connected'}
                         </div>
                     )}
                 </div>
            </div>
        </aside>
        </>
    );
}