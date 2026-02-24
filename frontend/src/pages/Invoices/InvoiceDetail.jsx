import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, DollarSign, Download, Calendar, Mail, Building, Phone, Zap } from 'lucide-react';
import api from '../../services/api';
import { getImageUrl } from '../../utils/url';
import toast from 'react-hot-toast';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [user, setUser] = useState(null);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);

    useEffect(() => {
        fetchInvoice();
        fetchUser();
    }, [id]);

    useEffect(() => {
        if (invoice) setPaymentAmount(invoice.total);
    }, [invoice]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await api.get(`invoices/${id}`);
            setInvoice(response.data.invoice);
        } catch (err) {
            console.error('Error fetching invoice:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await api.get('auth/me');
            setUser(response.data.user);
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const handleMarkPaid = async () => {
        try {
            await api.put(`invoices/${id}/mark-paid`, {
                payment_amount: parseFloat(paymentAmount),
                payment_date: new Date().toISOString(),
                payment_notes: 'Settled via secure protocol'
            });
            setShowPaymentModal(false);
            fetchInvoice();
            toast.success('Transaction synchronized. Invoice marked as PAID.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Protocol failure during status update');
        }
    };

    const handleSend = async () => {
        try {
            setSending(true);
            const response = await api.post(`invoices/${id}/send`);
            toast.success(response.data.message);
            fetchInvoice();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to dispatch email');
        } finally {
            setSending(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="loading-state"><div className="spinner"></div></div>;
    if (!invoice) return <div className="error-state">Invoice not found.</div>;

    return (
        <div className="page-wrapper animate-fade-in no-print-bg">
            <div className="page-header no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/invoices')} className="icon-btn">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="page-title">{invoice.invoice_number}</h1>
                        <p className="page-subtitle">Details for invoice to {invoice.client_name}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handlePrint} className="btn-secondary">
                        <Printer size={18} />
                        <span>Print / PDF</span>
                    </button>
                    {invoice.status !== 'PAID' && (
                        <button onClick={handleSend} className="btn-secondary" disabled={sending}>
                            <Mail size={18} />
                            <span>{sending ? 'Sending...' : (invoice.status === 'SENT' ? 'Resend to Client' : 'Send to Client')}</span>
                        </button>
                    )}
                    {invoice.status !== 'PAID' && (
                        <button onClick={() => setShowPaymentModal(true)} className="btn-primary" style={{ background: '#10b981' }}>
                            <CheckCircle2 size={18} />
                            <span>Mark Paid</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay animate-fade-in" onClick={() => setShowPaymentModal(false)}>
                    <div className="card animate-scale-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', padding: '2.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Finalize Payment</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>Confirm the amount received for this invoice.</p>

                        <div className="form-group">
                            <label className="stats-label">Amount Received ($)</label>
                            <input
                                type="number"
                                className="styled-input"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setShowPaymentModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                            <button onClick={handleMarkPaid} className="btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#10b981' }}>Confirm Payment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Printable Invoice */}
            <div className="card invoice-printable animate-slide-up" id="invoice-content" style={{ padding: '5rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '3rem' }}>
                    <div className="invoice-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
                            {user?.logo_url ? (
                                <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                                    <img src={getImageUrl(user.logo_url)} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                            ) : (
                                <div style={{ width: '48px', height: '48px', background: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px var(--accent-primary-glow)' }}>
                                    <Zap size={28} color="white" />
                                </div>
                            )}
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>ZenTrack</h2>
                        </div>
                        <div className="business-info" style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.8' }}>
                            <p style={{ fontWeight: 800, color: 'white', fontSize: '1.125rem', marginBottom: '0.75rem', letterSpacing: '0.01em' }}>{user?.business_name || 'Creative Operational Unit'}</p>
                            <p>{user?.address || 'Operational Sector 7G, Suite 101'}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {user?.phone || '+1 (555) 000-0000'}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {user?.email || 'billing@zentrack.ai'}</p>
                        </div>
                    </div>
                    <div className="invoice-meta" style={{ textAlign: 'right' }}>
                        <div className="invoice-status-large" style={{
                            display: 'inline-flex',
                            padding: '0.625rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            background: invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            color: invoice.status === 'PAID' ? '#10b981' : '#ef4444',
                            border: `1px solid ${invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            marginBottom: '2rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {invoice.status} • PROTOCOL
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 0.75rem 0', color: 'white', letterSpacing: '-0.02em' }}>INVOICE</h1>
                        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>ID: <strong style={{ color: 'white' }}>{invoice.invoice_number}</strong></p>
                        <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <p>Launch Date: <span style={{ color: 'white' }}>{new Date(invoice.invoice_date).toLocaleDateString()}</span></p>
                            {invoice.due_date && <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Deadline: {new Date(invoice.due_date).toLocaleDateString()}</p>}
                        </div>
                    </div>
                </div>

                <div className="invoice-to" style={{ marginBottom: '4rem', display: 'flex', gap: '4rem' }}>
                    <div style={{ flex: 1 }}>
                        <h3 className="section-label" style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 700 }}>Target Entity</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 1rem 0', color: 'white' }}>{invoice.client_name}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                            {invoice.client_company && <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{invoice.client_company}</p>}
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Building size={16} /> {invoice.client_address || 'Address Not Found'}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Mail size={16} /> {invoice.client_email}</p>
                        </div>
                    </div>
                </div>

                <div className="invoice-table-container" style={{ marginBottom: '4rem' }}>
                    <table className="invoice-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ textAlign: 'left', padding: '1.25rem', borderRadius: '12px 0 0 12px', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</th>
                                <th style={{ textAlign: 'center', padding: '1.25rem', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Operational Units</th>
                                <th style={{ textAlign: 'right', padding: '1.25rem', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Unit Rate</th>
                                <th style={{ textAlign: 'right', padding: '1.25rem', borderRadius: '0 12px 12px 0', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems && invoice.lineItems.map((item, index) => (
                                <tr key={index} style={{ background: 'rgba(255,255,255,0.01)', transition: 'background 0.3s' }}>
                                    <td style={{ padding: '1.5rem 1.25rem', borderRadius: '12px 0 0 12px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <div style={{ fontWeight: 600, color: 'white' }}>{item.description}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Synchronized Project Entry</div>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'var(--accent-primary)', fontWeight: 700 }}>{parseFloat(item.quantity).toFixed(1)}h</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>${parseFloat(item.rate).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', padding: '1.5rem 1.25rem', borderRadius: '0 12px 12px 0', borderBottom: '1px solid rgba(255,255,255,0.02)', fontWeight: 800, color: 'white' }}>${parseFloat(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="invoice-summary" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'start' }}>
                    <div className="invoice-notes" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
                        <h3 className="section-label" style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700 }}>Operation Log / Remarks</h3>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{invoice.notes || 'No specialized remarks detected for this project cycle. Thank you for the collaboration.'}</p>

                        {invoice.status === 'PAID' && invoice.payment_date && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                <p style={{ fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    <CheckCircle2 size={16} /> Transaction Complete
                                </p>
                                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Amount Recovered:</span>
                                    <span style={{ fontWeight: 700, color: 'white' }}>${parseFloat(invoice.payment_amount).toFixed(2)}</span>
                                </div>
                                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Settlement Date:</span>
                                    <span style={{ fontWeight: 700, color: 'white' }}>{new Date(invoice.payment_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="invoice-totals" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1rem 0' }}>
                        <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Gross Operational Value</span>
                            <span style={{ fontWeight: 600 }}>${parseFloat(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        {parseFloat(invoice.tax_amount) > 0 && (
                            <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Tax Load ({invoice.tax_rate}%)</span>
                                <span style={{ color: '#ef4444' }}>+${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        {parseFloat(invoice.discount_amount) > 0 && (
                            <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Strategic Adjustment</span>
                                <span style={{ color: '#10b981' }}>-${parseFloat(invoice.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ margin: '1rem 0', borderTop: '2px solid var(--border-glass)' }}></div>
                        <div className="total-row grand-total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>NET PAYABLE</span>
                            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-primary)', textShadow: '0 0 30px var(--accent-primary-glow)' }}>${parseFloat(invoice.total).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print, .sidebar-wrapper, .app-header, .page-header { display: none !important; }
                    .main-content, .page-wrapper { margin: 0 !important; padding: 0 !important; width: 100% !important; background: white !important; }
                    .invoice-printable { 
                        box-shadow: none !important; 
                        border: none !important; 
                        padding: 0 !important; 
                        width: 100% !important; 
                        margin: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
                    .invoice-printable * { color: black !important; border-color: #eee !important; box-shadow: none !important; }
                    .invoice-header { border-bottom: 2px solid black !important; }
                    .text-accent, [style*="color: var(--accent-primary)"] { color: black !important; font-weight: 800; }
                    .invoice-table thead th { background: #f8fafc !important; color: black !important; border-bottom: 2px solid black !important; }
                    .invoice-totals { border-top: 2px solid black !important; }
                    body { background: white !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceDetail;
