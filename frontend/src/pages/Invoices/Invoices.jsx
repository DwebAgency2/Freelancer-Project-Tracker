import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText, CheckCircle2, Clock, AlertCircle, Eye, Download, Trash2 } from 'lucide-react';
import api from '../../services/api';

const Invoices = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [filterStatus]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/invoices${filterStatus ? `?status=${filterStatus}` : ''}`);
            setInvoices(response.data.invoices);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PAID': return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'SENT': return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
            case 'OVERDUE': return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
            default: return { background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' };
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 size={12} />;
            case 'OVERDUE': return <AlertCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice? This will unbill associated time entries.')) return;
        try {
            await api.delete(`/invoices/${id}`);
            fetchInvoices();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting invoice');
        }
    };

    const handleExportCSV = () => {
        if (invoices.length === 0) {
            alert('No invoices found to export.');
            return;
        }

        const headers = ['Invoice #', 'Client', 'Date', 'Due Date', 'Amount', 'Status'];
        const rows = invoices.map(inv => [
            inv.invoice_number,
            inv.client_name,
            new Date(inv.invoice_date).toLocaleDateString(),
            inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-',
            parseFloat(inv.total).toFixed(2),
            inv.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ZenTrack_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Invoices</h1>
                    <p className="page-subtitle">Billing and payment history for your clients.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleExportCSV} className="btn-secondary" title="Export as CSV">
                        <Download size={18} />
                    </button>
                    <button onClick={() => navigate('/invoices/new')} className="btn-primary">
                        <Plus size={18} />
                        <span>Generate Invoice</span>
                    </button>
                </div>
            </div>

            {/* Quick Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map(status => (
                    <button
                        key={status}
                        className={`btn-secondary ${filterStatus === status ? 'active' : ''}`}
                        onClick={() => setFilterStatus(status)}
                        style={filterStatus === status ? { background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' } : {}}
                    >
                        {status || 'All'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading invoices...</p>
                </div>
            ) : invoices.length === 0 ? (
                <div className="empty-state card">
                    <FileText size={48} className="empty-icon" />
                    <h3>No invoices found</h3>
                    <p>Generate your first invoice to start getting paid.</p>
                    <button onClick={() => navigate('/invoices/new')} className="btn-primary" style={{ marginTop: '1rem' }}>
                        Create Invoice
                    </button>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 600 }}>{inv.invoice_number}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{inv.client_name}</div>
                                        {inv.client_company && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inv.client_company}</div>}
                                    </td>
                                    <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                                    <td>{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(inv.total).toFixed(2)}</td>
                                    <td>
                                        <span className="status-badge" style={getStatusStyle(inv.status)}>
                                            {getStatusIcon(inv.status)}
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button
                                                className="icon-btn"
                                                title="View Details"
                                                onClick={() => navigate(`/invoices/${inv.id}`)}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="icon-btn" title="Download PDF">
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(inv.id)}
                                                className="icon-btn danger"
                                                title="Delete"
                                                disabled={inv.status === 'PAID'}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Invoices;
