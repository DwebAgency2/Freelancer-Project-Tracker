import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, DollarSign, Download, Calendar, Mail, Building, Phone } from 'lucide-react';
import api from '../../services/api';

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchInvoice();
        fetchUser();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/invoices/${id}`);
            setInvoice(response.data.invoice);
        } catch (err) {
            console.error('Error fetching invoice:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    };

    const handleMarkPaid = async () => {
        const amount = prompt('Enter payment amount:', invoice.total);
        if (amount === null) return;

        try {
            await api.put(`/invoices/${id}/mark-paid`, {
                payment_amount: parseFloat(amount),
                payment_date: new Date().toISOString(),
                payment_notes: 'Paid via direct transfer'
            });
            fetchInvoice();
            alert('Invoice marked as paid!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating status');
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
                        <button onClick={handleMarkPaid} className="btn-primary" style={{ background: '#10b981' }}>
                            <CheckCircle2 size={18} />
                            <span>Mark Paid</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Printable Invoice */}
            <div className="card invoice-printable animate-slide-up" id="invoice-content" style={{ padding: '4rem' }}>
                <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '2rem' }}>
                    <div className="invoice-brand">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--accent-primary-glow)' }}>
                                <Zap size={24} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>ZenTrack</h2>
                        </div>
                        <div className="business-info" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                            <p style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>{user?.business_name || 'Creative Solutions'}</p>
                            <p>{user?.address || 'Focus Tower, Suite 101'}</p>
                            <p>{user?.phone || '+1 (555) 000-0000'}</p>
                            <p>{user?.email || 'billing@zentrack.ai'}</p>
                        </div>
                    </div>
                    <div className="invoice-meta" style={{ textAlign: 'right' }}>
                        <div className="invoice-status-large" style={{
                            display: 'inline-flex',
                            padding: '0.5rem 1.25rem',
                            borderRadius: '9999px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: invoice.status === 'PAID' ? '#10b981' : '#ef4444',
                            border: `1px solid ${invoice.status === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            marginBottom: '1.5rem'
                        }}>
                            {invoice.status}
                        </div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 0.5rem 0', color: 'white' }}>INVOICE</h1>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}><strong># {invoice.invoice_number}</strong></p>
                        <div style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <p>Issued: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                            {invoice.due_date && <p style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>}
                        </div>
                    </div>
                </div>

                <div className="invoice-to">
                    <div style={{ flex: 1 }}>
                        <h3 className="section-label">Bill To:</h3>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>{invoice.client_name}</p>
                        {invoice.client_company && <p>{invoice.client_company}</p>}
                        <p>{invoice.client_address || '-'}</p>
                        <p>{invoice.client_email}</p>
                    </div>
                </div>

                <div className="invoice-table-container">
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style={{ textAlign: 'center' }}>Qty/Hrs</th>
                                <th style={{ textAlign: 'right' }}>Rate</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems && invoice.lineItems.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.description}</td>
                                    <td style={{ textAlign: 'center' }}>{parseFloat(item.quantity).toFixed(1)}</td>
                                    <td style={{ textAlign: 'right' }}>${parseFloat(item.rate).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(item.amount).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="invoice-summary">
                    <div className="invoice-notes">
                        <h3 className="section-label">Notes:</h3>
                        <p>{invoice.notes || 'Thank you for your business!'}</p>

                        {invoice.status === 'PAID' && invoice.payment_date && (
                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <p style={{ fontWeight: 600, color: '#10b981' }}>Payment Received</p>
                                <p style={{ fontSize: '0.875rem' }}>Amount: ${parseFloat(invoice.payment_amount).toFixed(2)}</p>
                                <p style={{ fontSize: '0.875rem' }}>Date: {new Date(invoice.payment_date).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>
                    <div className="invoice-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        {parseFloat(invoice.tax_amount) > 0 && (
                            <div className="total-row">
                                <span>Tax ({invoice.tax_rate}%)</span>
                                <span>${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                            </div>
                        )}
                        {parseFloat(invoice.discount_amount) > 0 && (
                            <div className="total-row">
                                <span>Discount</span>
                                <span>-${parseFloat(invoice.discount_amount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="total-row grand-total">
                            <span>Total Due</span>
                            <span>${parseFloat(invoice.total).toFixed(2)}</span>
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
