import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Users, Briefcase, DollarSign, Clock,
    Plus, ArrowRight, Zap, Target, FileText
} from 'lucide-react';
import api from '../../services/api';

import Skeleton from '../../components/Skeleton';

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
            // Artificial delay to appreciate the skeletons (optional, but good for demo)
            setTimeout(() => setLoading(false), 800);
        }
    };

    const DashboardLoadingScreen = () => (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <Skeleton width="240px" height="32px" />
                    <Skeleton width="340px" height="18px" className="mt-2" />
                </div>
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                        <Skeleton height="100px" className="flex-1" />
                        <Skeleton height="100px" className="flex-1" />
                        <Skeleton height="100px" className="flex-1" />
                    </div>
                    <Skeleton height="200px" />
                    <Skeleton height="300px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <Skeleton height="250px" />
                    <Skeleton height="180px" />
                </div>
            </div>
        </div>
    );

    if (loading) return <DashboardLoadingScreen />;

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
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

            {/* Dashboard Layout Grid */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '2.5rem' }}>
                {/* Main Activities Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <QuickStats stats={stats} />
                    <WeeklyChart activity={activity} />

                    <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '30%', height: '120%', background: 'radial-gradient(circle, rgba(79, 209, 197, 0.03) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                            <div style={{ flex: '1 1 300px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Project Pipeline</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem', maxWidth: '380px' }}>
                                    You have <strong>{stats.active_projects}</strong> projects requiring attention this week. Maintain momentum to hit your revenue targets.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <Link to="/projects" className="btn-primary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                                        <span>Manage Roadmap</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                    <Link to="/clients" className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.8125rem' }}>
                                        <span>Client Roster</span>
                                    </Link>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-glass)', flex: '1 1 150px' }}>
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
                                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.02)', flexWrap: 'wrap' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(79, 209, 197, 0.05)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Clock size={18} />
                                        </div>
                                        <div style={{ flex: '1 1 200px' }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>{entry.project_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>{entry.description || 'General Work Session'}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
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
                    <RevenueHealth stats={stats} />

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

const QuickStats = ({ stats }) => {
    return (
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="card flex-1" style={{ padding: '1.5rem', minWidth: '150px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Earnings</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>${(stats.total_earnings || 0).toLocaleString()}</div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem' }}>+12% from last month</div>
            </div>
            <div className="card flex-1" style={{ padding: '1.5rem', minWidth: '150px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Projects</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.active_projects || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>4 Due soon</div>
            </div>
            <div className="card flex-1" style={{ padding: '1.5rem', minWidth: '150px' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hours This Month</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.hours_this_month || 0}h</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>Target: 160h</div>
            </div>
        </div>
    );
};

const WeeklyChart = () => {
    return (
        <div className="card" style={{ height: '240px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Weekly Activity</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last 7 Days</div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '0.75rem', paddingBottom: '0.5rem' }}>
                {[45, 60, 30, 80, 40, 90, 50].map((h, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: 'rgba(79, 209, 197, 0.1)', borderRadius: '4px', height: `${h}%`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, var(--accent-primary), transparent)', opacity: 0.6 }}></div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.625rem', marginTop: '0.75rem' }}>
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
            </div>
        </div>
    );
};

const RevenueHealth = ({ stats }) => {
    const total = (stats.total_earnings || 0) + (stats.outstanding_amount || 0);
    const percentage = total > 0 ? Math.round((stats.total_earnings / total) * 100) : 0;

    return (
        <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem' }}>Revenue Health</h3>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Collected Revenue</span>
                    <span style={{ fontWeight: 700 }}>{percentage}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Collected</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>${(stats.total_earnings || 0).toLocaleString()}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Outstanding</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>${(stats.outstanding_amount || 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
