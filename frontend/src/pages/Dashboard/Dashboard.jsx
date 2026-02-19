import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Briefcase, DollarSign, Clock, Plus, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        activeProjects: 0,
        totalEarnings: 0,
        totalHours: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats');
            setStats(response.data.stats);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Welcome back! Here's an overview of your freelance business.</p>
                </div>
            </div>

            {/* Quick Actions Section */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <Link to="/clients" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem' }}>
                        <Plus size={20} />
                        <span>Add New Client</span>
                    </Link>
                    <Link to="/projects?new=true" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.5rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                        <Briefcase size={20} />
                        <span>Create New Project</span>
                    </Link>
                </div>
            </div>

            <div className="grid-list" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2.5rem' }}>
                <div className="card stats-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Clients</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats.total_clients || 0}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </div>

                <div className="card stats-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Projects</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats.active_projects || 0}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#ecfdf5', color: '#10b981' }}>
                            <Briefcase size={24} />
                        </div>
                    </div>
                </div>

                <div className="card stats-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Earnings (Month)</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>${stats.total_earnings || 0}</h2>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#fff7ed', color: '#f59e0b' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>
                </div>

                <div className="card stats-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Hours (Month)</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0.5rem 0' }}>{stats.hours_this_month || 0}h</h2>
                        </div>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f5f3ff', color: '#8b5cf6' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Welcome to FreeTrack</h3>
                <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Start by adding your clients and creating projects. Once you have projects, you can track time and generate professional invoices for your work.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <Link to="/clients" className="view-detail-link">
                        <span>Go to Clients</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/projects" className="view-detail-link">
                        <span>Go to Projects</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
