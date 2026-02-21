import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, Briefcase, DollarSign, Clock,
    Plus, ArrowRight, Zap, Target, FileText
} from 'lucide-react';
import api from '../../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_clients: 0,
        active_projects: 0,
        total_earnings: 0,
        outstanding_amount: 0,
        hours_this_month: 0
    });
    const [activity, setActivity] = useState({
        recent_invoices: [],
        recent_time_entries: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, activityRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/dashboard/activity')
            ]);
            setStats(statsRes.data.stats);
            setActivity(activityRes.data);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const QuickStats = () => (
        <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <DollarSign size={20} />
                </div>
                <div>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Earnings</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>${stats.total_earnings.toLocaleString()}</h3>
                </div>
            </div>
            <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)' }}>
                    <Clock size={20} />
                </div>
                <div>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billable Hours</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.hours_this_month}h</h3>
                </div>
            </div>
            <div className="card" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                    <Briefcase size={20} />
                </div>
                <div>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Projects</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.active_projects}</h3>
                </div>
            </div>
        </div>
    );

    const RevenueHealth = () => {
        const total = stats.total_earnings + stats.outstanding_amount;
        const earnedWidth = total > 0 ? (stats.total_earnings / total) * 100 : 0;
        const outstandingWidth = total > 0 ? (stats.outstanding_amount / total) * 100 : 0;

        return (
            <div className="card" style={{ background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.4) 0%, rgba(5, 7, 10, 0.6) 100%)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Target size={18} className="text-accent" />
                    Revenue Health
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.8125rem', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Portfolio Balance</span>
                            <span style={{ color: 'white' }}>${total.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                            <div style={{
                                width: `${earnedWidth}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-primary), #3dd6c3)',
                                boxShadow: '0 0 12px var(--accent-primary-glow)',
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}></div>
                            <div style={{
                                width: `${outstandingWidth}%`,
                                height: '100%',
                                background: 'rgba(59, 130, 246, 0.3)',
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}></div>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Earned: ${stats.total_earnings.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Pending: ${stats.outstanding_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Users size={16} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Network Scale</div>
                                <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{stats.total_clients} Active Clients</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your business network size this quarter. Trending +5% vs last week.</p>
                    </div>
                </div>
            </div>
        );
    };

    const WeeklyChart = () => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const values = [4.2, 5.8, 8.5, 5.0, 9.2, 2.5, 1.0];
        const maxVal = Math.max(...values, 10);

        return (
            <div className="card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Zap size={18} className="text-accent" />
                        Weekly Velocity
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Focus Session Time</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '0.5rem', padding: '0 0.5rem' }}>
                    {values.map((val, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '100%',
                                maxHeight: '100%',
                                height: `${(val / maxVal) * 100}%`,
                                background: val > 6 ? 'linear-gradient(180deg, var(--accent-primary), transparent)' : 'linear-gradient(180deg, rgba(255,255,255,0.1), transparent)',
                                borderTop: val > 6 ? '2px solid var(--accent-primary)' : '2px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px 4px 0 0',
                                position: 'relative',
                                transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                                {val > 6 && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', width: '20px', height: '20px', background: 'var(--accent-primary-glow)', filter: 'blur(8px)', borderRadius: '50%' }}></div>}
                            </div>
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: val > 6 ? 'white' : 'var(--text-muted)', textTransform: 'uppercase' }}>{days[idx]}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Synchronizing dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title">Executive Overview</h1>
                    <p className="page-subtitle">Monetize your expertise and track operational growth.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/time')} className="btn-secondary">
                        <Clock size={16} />
                        <span>Log Time</span>
                    </button>
                    <button onClick={() => navigate('/projects?new=true')} className="btn-primary">
                        <Plus size={18} />
                        <span>Start Project</span>
                    </button>
                </div>
            </div>

            <QuickStats />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '2.5rem' }}>
                {/* Main Activities Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <WeeklyChart />

                    <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '30%', height: '120%', background: 'radial-gradient(circle, rgba(79, 209, 197, 0.03) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Project Pipeline</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '380px' }}>
                                    You have <strong>{stats.active_projects}</strong> projects requiring attention this week. Maintain momentum to hit your revenue targets.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <Link to="/projects" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                                        <span>Manage Roadmap</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                    <Link to="/clients" className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                                        <span>Client Roster</span>
                                    </Link>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-glass)' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1, marginBottom: '0.25rem' }}>{stats.active_projects}</div>
                                <div style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Engagements</div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Recent Time Entries</h3>
                            <Link to="/time" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 700 }}>Full Logs</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activity.recent_time_entries.length > 0 ? (
                                activity.recent_time_entries.map(entry => (
                                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.02)' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 209, 197, 0.05)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Clock size={18} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{entry.project_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{entry.description || 'General Work Session'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{(entry.duration_minutes / 60).toFixed(1)}h</div>
                                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(entry.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No recent work sessions detected.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <RevenueHealth />

                    <div className="card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Financial Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={() => navigate('/invoices')} className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FileText size={16} />
                                    <span>Draft Invoice</span>
                                </div>
                                <ArrowRight size={14} style={{ opacity: 0.5 }} />
                            </button>
                            <button onClick={() => navigate('/profile')} className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Zap size={16} />
                                    <span>Rates & Settings</span>
                                </div>
                                <ArrowRight size={14} style={{ opacity: 0.5 }} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
