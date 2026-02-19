import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard /> },
        { name: 'Projects', path: '/projects', icon: <Briefcase /> },
        { name: 'Invoices', path: '/invoices', icon: <FileText /> },
        { name: 'Clients', path: '/clients', icon: <Users /> },
        { name: 'Profile', path: '/profile', icon: <Settings /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2 className="sidebar-logo">FreeTrack</h2>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className="nav-item"
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <button onClick={handleLogout} className="nav-item logout-btn" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', marginTop: 'auto' }}>
                        <LogOut />
                        <span>Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="header">
                    <h1 style={{ fontSize: '1.25rem' }}>
                        {user?.business_name || 'Freelancer Project Tracker'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user?.logo_url && (
                            <img
                                src={`http://localhost:5000${user.logo_url}`}
                                alt="Logo"
                                style={{ height: '32px', borderRadius: '4px' }}
                            />
                        )}
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontStyle: 'italic' }}>
                            developed by assuredpixel team
                        </span>
                    </div>
                </header>
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
