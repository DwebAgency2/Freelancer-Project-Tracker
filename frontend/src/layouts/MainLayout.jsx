import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, FileText, Users,
    Settings, LogOut, Clock, Search, Bell,
    Sparkles, User, ChevronDown, Monitor, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
        { name: 'Projects', path: '/projects', icon: <Briefcase size={20} /> },
        { name: 'Time Tracking', path: '/time', icon: <Monitor size={20} /> },
        { name: 'Invoices', path: '/invoices', icon: <FileText size={20} /> },
        { name: 'Clients', path: '/clients', icon: <Users size={20} /> },
    ];

    const bottomItems = [
        { name: 'Settings', path: '/profile', icon: <Settings size={20} /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header desktop-only" style={{ padding: '2rem 1.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'conic-gradient(from 180deg at 50% 50%, var(--accent-primary) 0deg, var(--accent-secondary) 360deg)',
                            boxShadow: '0 0 15px var(--accent-primary-glow)'
                        }}></div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>ZenTrack</h2>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Freelance Project Hub</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav" style={{ marginTop: '2rem', flex: 1 }}>
                    <div style={{ padding: '0 1.5rem', marginBottom: '1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Menu
                    </div>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <div style={{ padding: '2rem 1.5rem 1rem', fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Tools
                    </div>
                    {bottomItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)'
                            }}>
                                <User size={18} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '0.625rem', color: 'var(--accent-primary)' }}>Free plan</div>
                            </div>
                        </div>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header" style={{ padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Mobile Logo (Left) */}
                        <div className="mobile-only" style={{ alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'conic-gradient(from 180deg at 50% 50%, var(--accent-primary) 0deg, var(--accent-secondary) 360deg)',
                                boxShadow: '0 0 15px var(--accent-primary-glow)'
                            }}></div>
                            <span style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>ZenTrack</span>
                        </div>

                        {/* Desktop Search */}
                        <div className="search-bar-modern desktop-only">
                            <Search size={18} className="text-secondary" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Desktop Side Icons - Hidden on Mobile */}
                        <div className="desktop-only" style={{ alignItems: 'center', gap: '1rem', marginRight: '1rem' }}>
                            <button className="icon-btn" title="Notifications" style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <Bell size={18} />
                            </button>
                            <button className="icon-btn" title="AI Assistant" style={{ background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <Sparkles size={18} />
                            </button>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)', margin: '0 0.5rem' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.05)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)'
                                }}>
                                    <User size={16} />
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0] || 'User'}</span>
                            </div>
                        </div>

                        {/* Mobile Toggle (Right) */}
                        <button
                            onClick={toggleMobileMenu}
                            className="mobile-toggle mobile-only"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </header>

                <div className="page-container" style={{ padding: '2.5rem' }}>
                    <Outlet />
                </div>

                {/* Trademark Footer - Glass overlay at bottom right */}
                <div style={{
                    position: 'fixed', bottom: '1rem', right: '1.5rem',
                    fontSize: '0.625rem', color: 'var(--text-muted)',
                    background: 'rgba(5, 7, 10, 0.5)', backdropFilter: 'blur(4px)',
                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                    border: '1px solid var(--border-glass)',
                    zIndex: 100
                }}>
                    developed by assuredpixel team
                </div>
            </main>

            <style>{`
                .mobile-only { display: none; }
                
                @media (max-width: 768px) {
                    .mobile-only { display: flex !important; }
                    .desktop-only { display: none !important; }
                    .header { padding: 0 1.25rem !important; }
                    .mobile-toggle {
                        background: rgba(255,255,255,0.05);
                        border: 1px solid var(--border-glass);
                        color: white;
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        z-index: 101;
                    }
                }
            `}</style>
        </div>
    );
};

export default MainLayout;
