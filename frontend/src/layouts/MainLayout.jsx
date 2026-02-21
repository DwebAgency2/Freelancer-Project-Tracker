import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, FileText, Users,
    Settings, LogOut, Clock, Search, Bell,
    Sparkles, User, ChevronDown, Monitor
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header" style={{ padding: '2rem 1.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'conic-gradient(from 180deg at 50% 50%, var(--accent-primary) 0deg, var(--accent-secondary) 360deg)',
                            boxShadow: '0 0 15px var(--accent-primary-glow)'
                        }}></div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>{user?.business_name || 'ZenTrack'}</h2>
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
                <header className="header" style={{ padding: '0 2rem' }}>
                    <div className="search-bar-modern">
                        <Search size={18} className="text-secondary" />
                        <input
                            type="text"
                            placeholder="Search projects, clients, invoices..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button className="icon-btn" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <Bell size={18} />
                            </button>
                            <button className="icon-btn" style={{ background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)' }}>
                                <Sparkles size={18} />
                            </button>
                        </div>

                        <div style={{ height: '24px', width: '1px', background: 'var(--border-glass)' }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-glass)'
                            }}>
                                <User size={16} />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0] || 'User'}</span>
                            <ChevronDown size={14} className="text-secondary" />
                        </div>
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
        </div>
    );
};

export default MainLayout;
