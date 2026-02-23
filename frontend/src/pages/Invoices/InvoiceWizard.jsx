import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Trash2, FileText, CheckCircle2, Clock, DollarSign, LayoutDashboard } from 'lucide-react';
import api from '../../services/api';

const InvoiceWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [unbilledEntries, setUnbilledEntries] = useState([]);
    const [selectedEntryIds, setSelectedEntryIds] = useState([]);
    const [lineItems, setLineItems] = useState([]);
    const [invoiceData, setInvoiceData] = useState({
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tax_rate: 0,
        discount_amount: 0,
        notes: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step === 1) fetchClients();
    }, [step]);

    useEffect(() => {
        if (selectedClientId && step === 2) {
            fetchUnbilledEntries();
            setLineItems([]); // Reset items when client changes
        }
    }, [selectedClientId, step]);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data.clients);
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const fetchUnbilledEntries = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/time-entries?client_id=${selectedClientId}&is_billed=false&is_billable=true`);
            setUnbilledEntries(response.data.entries);
        } catch (err) {
            console.error('Error fetching unbilled entries:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEntry = (entry) => {
        if (selectedEntryIds.includes(entry.id)) {
            setSelectedEntryIds(selectedEntryIds.filter(id => id !== entry.id));
            setLineItems(lineItems.filter(item => item.ref_id !== entry.id));
        } else {
            setSelectedEntryIds([...selectedEntryIds, entry.id]);
            // Add to line items
            const hours = entry.duration_minutes / 60;
            const rate = entry.billing_rate || 50; // Fallback or fetch from project
            setLineItems([...lineItems, {
                description: `${entry.project_name}: ${entry.description || 'Consulting'}`,
                quantity: +hours.toFixed(2),
                rate: rate,
                ref_id: entry.id
            }]);
        }
    };

    const handleAddManualItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }]);
    };

    const handleRemoveItem = (index) => {
        const item = lineItems[index];
        if (item.ref_id) {
            setSelectedEntryIds(selectedEntryIds.filter(id => id !== item.ref_id));
        }
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...lineItems];
        newItems[index][field] = value;
        setLineItems(newItems);
    };

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const tax = subtotal * (parseFloat(invoiceData.tax_rate || 0) / 100);
        return subtotal + tax - parseFloat(invoiceData.discount_amount || 0);
    };

    const handleCreateInvoice = async () => {
        try {
            setLoading(true);
            const payload = {
                client_id: selectedClientId,
                ...invoiceData,
                line_items: lineItems,
                time_entry_ids: selectedEntryIds
            };
            await api.post('/invoices', payload);
            setStep(4);
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Generate Invoice</h1>
                    <p className="page-subtitle">Multi-step wizard to create professional invoices.</p>
                </div>
                <div className="wizard-steps">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`wizard-step-indicator ${step >= s ? 'active' : ''}`}>
                            {step > s ? <CheckCircle2 size={16} /> : s}
                        </div>
                    ))}
                </div>
            </div>

            <div className="card animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem' }}>
                {step === 1 && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 1: Target Entity</h2>
                            <p className="text-secondary">Identify the business partner for this invoice cycle.</p>
                        </div>

                        <div className="grid-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className={`card selectable-card ${selectedClientId === client.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedClientId(client.id)}
                                    style={{ padding: '1.5rem' }}
                                >
                                    <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{client.name}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.company || 'Private Entity'}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                            <button
                                className="btn-primary"
                                disabled={!selectedClientId}
                                onClick={() => setStep(2)}
                            >
                                <span>Continue to Billing</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 2: Operational Items</h2>
                            <p className="text-secondary">Select synchronized work logs or add manual service entries.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <Clock size={16} className="text-accent" />
                                    Synchronized Work Logs
                                </h4>
                                {loading ? <p className="text-muted">Fetching entries...</p> : unbilledEntries.length === 0 ? <p className="text-muted">No pending entries detected.</p> : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {unbilledEntries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className={`card selectable-small-card ${selectedEntryIds.includes(entry.id) ? 'selected' : ''}`}
                                                onClick={() => handleToggleEntry(entry)}
                                                style={{ padding: '1rem' }}
                                            >
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{entry.description || 'Base Consultation'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(entry.date).toLocaleDateString()} • <span className="text-accent">{(entry.duration_minutes / 60).toFixed(1)}h</span> • ${entry.billing_rate}/hr
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    <FileText size={16} className="text-accent" />
                                    Invoice Structure
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {lineItems.map((item, index) => (
                                        <div key={index} className="card" style={{ padding: '1.25rem', borderStyle: 'dashed', background: 'rgba(255,255,255,0.01)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
                                                <input
                                                    className="inline-input"
                                                    placeholder="Task description..."
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    style={{ fontWeight: 600, flex: 1, fontSize: '1rem', color: 'white' }}
                                                />
                                                <button onClick={() => handleRemoveItem(index)} className="icon-btn danger" style={{ padding: '0.5rem' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label className="stats-label" style={{ fontSize: '0.625rem' }}>Units</label>
                                                    <input
                                                        type="number"
                                                        className="inline-input text-accent"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        style={{ fontWeight: 700 }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label className="stats-label" style={{ fontSize: '0.625rem' }}>Rate ($)</label>
                                                    <input
                                                        type="number"
                                                        className="inline-input text-accent"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                        style={{ fontWeight: 700 }}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'right' }}>
                                                    <label className="stats-label" style={{ fontSize: '0.625rem' }}>Subtotal</label>
                                                    <div style={{ fontWeight: 800, color: 'white' }}>${(item.quantity * item.rate).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleAddManualItem} className="btn-secondary" style={{ width: '100%', padding: '1rem', borderStyle: 'dashed' }}>
                                        <Plus size={16} />
                                        <span>Append Manual Item</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setStep(1)}>
                                <ChevronLeft size={18} />
                                Back to Entity
                            </button>
                            <button
                                className="btn-primary"
                                disabled={lineItems.length === 0}
                                onClick={() => setStep(3)}
                            >
                                <span>Preview & Finalize</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in">
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Step 3: Protocol Review</h2>
                            <p className="text-secondary">Verify financial parameters and finalize the document.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label>Issue Date</label>
                                        <input
                                            type="date"
                                            className="styled-input"
                                            value={invoiceData.invoice_date}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tactical Deadline (Due)</label>
                                        <input
                                            type="date"
                                            className="styled-input"
                                            value={invoiceData.due_date}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Operation Notes</label>
                                    <textarea
                                        className="styled-textarea"
                                        rows="4"
                                        placeholder="Add terms, bank details, or project completion notes..."
                                        value={invoiceData.notes}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="card" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', border: '1px solid var(--accent-primary-glow)' }}>
                                <h4 style={{ marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Financial Summary</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span className="text-secondary">Gross Subtotal</span>
                                        <span style={{ fontWeight: 600 }}>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="text-secondary">Tax Factor (%)</span>
                                        <input
                                            type="number"
                                            className="inline-input text-accent"
                                            style={{ width: '80px', textAlign: 'right', fontWeight: 700 }}
                                            value={invoiceData.tax_rate}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, tax_rate: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="text-secondary">Adjustment / Discount ($)</span>
                                        <input
                                            type="number"
                                            className="inline-input text-accent"
                                            style={{ width: '100px', textAlign: 'right', fontWeight: 700 }}
                                            value={invoiceData.discount_amount}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, discount_amount: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--border-glass)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800 }}>
                                        <span className="text-secondary">Net Payable</span>
                                        <span className="text-accent">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                            <button className="btn-secondary" onClick={() => setStep(2)}>
                                <ChevronLeft size={18} />
                                Back to Structure
                            </button>
                            <button
                                className="btn-primary"
                                disabled={loading}
                                onClick={handleCreateInvoice}
                                style={{ boxShadow: '0 0 20px var(--accent-primary-glow)' }}
                            >
                                <FileText size={18} />
                                <span>{loading ? 'Initializing...' : 'Confirm & Finalize Invoice'}</span>
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
                            <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Invoice Created Successfully!</h2>
                        <p style={{ color: '#64748b', marginBottom: '2rem' }}>What would you like to do next?</p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button className="btn-primary" onClick={() => navigate('/invoices')}>
                                <FileText size={18} />
                                <span>Go to Invoices</span>
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/')}>
                                <LayoutDashboard size={18} />
                                <span>Dashboard</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceWizard;
