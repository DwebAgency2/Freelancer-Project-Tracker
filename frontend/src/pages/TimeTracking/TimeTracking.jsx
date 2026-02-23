import React, { useState, useEffect } from 'react';
import {
    Clock, List, Calendar, Filter,
    Download, Trash2, Edit2, Zap,
    Shield, ShieldCheck, Activity, Target, Plus, Search, Building
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Timer from '../../components/Timer';
import TimeEntryForm from '../../components/TimeEntryForm';
import ConfirmModal from '../../components/ConfirmModal';

const TimeTracking = () => {
    const [timeData, setTimeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total_hours: 0,
        this_week: 0,
        active_projects_count: 0
    });

    // Feature States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProjectFilter, setSelectedProjectFilter] = useState('ALL');
    const [projects, setProjects] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    useEffect(() => {
        fetchTimeData();
        fetchProjects();
    }, []);

    const fetchTimeData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/time-entries');
            const entries = response.data.entries;
            setTimeData(entries);

            // Basic stats calculation
            const totalMins = entries.reduce((acc, log) => acc + log.duration_minutes, 0);
            setStats({
                total_hours: (totalMins / 60).toFixed(1),
                this_week: (totalMins / 60).toFixed(1), // Simplified for now
                active_projects_count: new Set(entries.map(l => l.project_id)).size
            });
        } catch (err) {
            console.error('Error fetching time data:', err);
            setError('Failed to sync time logs. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects?status=ACTIVE');
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const handleAddEntry = () => {
        setEditingLog(null);
        setIsModalOpen(true);
    };

    const handleEditEntry = (log) => {
        if (log.is_billed) {
            toast.error('Cannot edit a billed work session.');
            return;
        }
        setEditingLog(log);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id, isBilled) => {
        if (isBilled) {
            toast.error('Cannot delete a billed work session');
            return;
        }
        setEntryToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!entryToDelete) return;
        try {
            await api.delete(`/time-entries/${entryToDelete}`);
            toast.success('Session deleted');
            fetchTimeData();
        } catch (err) {
            toast.error('Failed to delete log');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            setSubmitting(true);
            if (editingLog) {
                await api.put(`/time-entries/${editingLog.id}`, formData);
                toast.success('Time entry updated');
            } else {
                await api.post('/time-entries', formData);
                toast.success('Time entry added');
            }
            setIsModalOpen(false);
            fetchTimeData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Error saving time record';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredLogs = timeData.filter(log => {
        const matchesSearch = log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProject = selectedProjectFilter === 'ALL' || log.project_id.toString() === selectedProjectFilter;
        return matchesSearch && matchesProject;
    });

    const handleExportCSV = () => {
        if (filteredLogs.length === 0) {
            toast.error('No sessions found to export.');
            return;
        }

        const headers = ['Project', 'Date', 'Duration (Hours)', 'Status', 'Description'];
        const rows = filteredLogs.map(log => [
            log.project_name,
            new Date(log.date).toLocaleDateString(),
            (log.duration_minutes / 60).toFixed(2),
            log.is_billed ? 'Billed' : 'Unbilled',
            log.description || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ZenTrack_WorkSessions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <h1 className="page-title">Time Tracking</h1>
                    <p className="page-subtitle">Accurately record billable hours to ensure precision in your invoicing.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%', maxWidth: 'fit-content' }}>
                    <button onClick={handleExportCSV} className="btn-secondary" title="Export as CSV">
                        <Download size={18} />
                    </button>
                    <button onClick={handleAddEntry} className="btn-secondary">
                        <Plus size={18} />
                        <span>Manual Entry</span>
                    </button>
                    <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border-glass)', flex: 1, justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.total_hours}h</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billable</div>
                        </div>
                        <div style={{ width: '1px', background: 'var(--border-glass)' }}></div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>{stats.active_projects_count}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Projects</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) 1.5fr', gap: '3rem' }}>
                {/* Timer Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card" style={{ padding: '3rem 2rem', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Timer onTimeLogged={fetchTimeData} />
                    </div>

                    <div className="card" style={{ background: 'rgba(79, 209, 197, 0.02)', border: '1px solid var(--border-glow)' }}>
                        <div style={{ display: 'flex', gap: '1.25rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)', height: 'fit-content' }}>
                                <Target size={20} />
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, marginBottom: '0.5rem' }}>Revenue Impact</h4>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    Logged sessions are automatically synced and made available for invoice generation. Billed entries are locked to maintain audit integrity.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Records */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Filters */}
                    <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
                        <div className="search-bar-modern" style={{ flex: '1 1 200px' }}>
                            <Search size={18} className="text-secondary" />
                            <input
                                type="text"
                                placeholder="Filter sessions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: '0.875rem' }}
                            />
                        </div>
                        <select
                            value={selectedProjectFilter}
                            onChange={(e) => setSelectedProjectFilter(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: '10px', color: 'white', fontSize: '0.875rem', flex: '1 1 150px' }}
                        >
                            <option value="ALL">All Projects</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id.toString()} style={{ background: '#0d1117' }}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="card" style={{ padding: '1.75rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Activity size={18} className="text-secondary" />
                                Work Session History
                            </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {loading ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Syncing session data...</p>
                            ) : error ? (
                                <div className="empty-state">
                                    <AlertCircle size={48} className="empty-icon" style={{ color: '#ef4444' }} />
                                    <h3>Sync Interrupted</h3>
                                    <p>{error}</p>
                                    <button onClick={fetchTimeData} className="btn-secondary">
                                        Retry Sync
                                    </button>
                                </div>
                            ) : filteredLogs.length === 0 ? (
                                <div className="empty-state">
                                    <Clock size={48} className="empty-icon" />
                                    <h3>No work sessions found</h3>
                                    <p>{searchTerm || selectedProjectFilter !== 'ALL' ? 'No entries match your current filters.' : 'Your timeline is clear. Start by logging a session.'}</p>
                                    {!searchTerm && selectedProjectFilter === 'ALL' && (
                                        <button onClick={handleAddEntry} className="btn-primary">
                                            Log Your First Session
                                        </button>
                                    )}
                                </div>
                            ) : (
                                filteredLogs.slice(0, 50).map(log => (
                                    <div key={log.id} style={{
                                        padding: '1.25rem',
                                        borderRadius: '16px',
                                        background: log.is_billed ? 'rgba(79, 209, 197, 0.03)' : 'rgba(255,255,255,0.02)',
                                        border: log.is_billed ? '1px solid rgba(79, 209, 197, 0.15)' : '1px solid var(--border-glass)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        opacity: log.is_billed ? 0.9 : 1
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{log.project_name}</span>
                                                {log.is_billed && (
                                                    <span className="status-badge" style={{ fontSize: '0.625rem', padding: '0.15rem 0.5rem', background: 'rgba(7, 209, 197, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--border-glow)' }}>
                                                        <ShieldCheck size={10} />
                                                        Billed
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {log.description || 'General Development'}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{ minWidth: '60px' }}>
                                                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: log.is_billed ? 'var(--text-muted)' : 'var(--accent-primary)' }}>{(log.duration_minutes / 60).toFixed(1)}h</div>
                                                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{new Date(log.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditEntry(log)}
                                                    className="icon-btn"
                                                    style={{ width: '32px', height: '32px', opacity: log.is_billed ? 0.3 : 1, cursor: log.is_billed ? 'not-allowed' : 'pointer' }}
                                                    title={log.is_billed ? "Cannot edit billed session" : "Edit Session"}
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(log.id, log.is_billed)}
                                                    className="icon-btn danger"
                                                    style={{ width: '32px', height: '32px', opacity: log.is_billed ? 0.3 : 1, cursor: log.is_billed ? 'not-allowed' : 'pointer' }}
                                                    title={log.is_billed ? "Cannot delete billed session" : "Delete Session"}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <TimeEntryForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingLog}
                submitting={submitting}
            />
            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Session"
                message="Are you sure you want to delete this work session? This action cannot be undone."
                confirmText="Delete Session"
            />
        </div>
    );
};

export default TimeTracking;
