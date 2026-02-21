import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Plus, Trash2, FileText, CheckCircle2, Clock, DollarSign } from 'lucide-react';
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

            <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {step === 1 && (
                    <div className="animate-slide-up">
                        <h2 style={{ marginBottom: '1.5rem' }}>Step 1: Select Client</h2>
                        <div className="form-group">
                            <label>Choose a client to invoice</label>
                            <div className="grid-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                                {clients.map(client => (
                                    <div
                                        key={client.id}
                                        className={`card selectable-card ${selectedClientId === client.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedClientId(client.id)}
                                    >
                                        <h3 style={{ fontSize: '1.125rem' }}>{client.name}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{client.company || 'Individual'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button
                                className="btn-primary"
                                disabled={!selectedClientId}
                                onClick={() => setStep(2)}
                            >
                                <span>Next: Billable Work</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-slide-up">
                        <h2 style={{ marginBottom: '1.5rem' }}>Step 2: Line Items</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Clock size={18} style={{ color: 'var(--primary)' }} />
                                    Unbilled Time Entries
                                </h4>
                                {loading ? <p>Loading entries...</p> : unbilledEntries.length === 0 ? <p style={{ color: '#64748b' }}>No unbilled entries found.</p> : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {unbilledEntries.map(entry => (
                                            <div
                                                key={entry.id}
                                                className={`card selectable-small-card ${selectedEntryIds.includes(entry.id) ? 'selected' : ''}`}
                                                onClick={() => handleToggleEntry(entry)}
                                            >
                                                <div style={{ fontWeight: 500 }}>{entry.description || 'Billable work'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    {new Date(entry.date).toLocaleDateString()} • {(entry.duration_minutes / 60).toFixed(1)}h • ${entry.billing_rate}/hr
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <FileText size={18} style={{ color: 'var(--primary)' }} />
                                    Invoice Line Items
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {lineItems.map((item, index) => (
                                        <div key={index} className="card" style={{ padding: '0.75rem', borderStyle: 'dashed' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <input
                                                    className="inline-input"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    style={{ fontWeight: 500, flex: 1 }}
                                                />
                                                <button onClick={() => handleRemoveItem(index)} className="icon-btn danger">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.75rem' }}>Qty/Hrs</label>
                                                    <input
                                                        type="number"
                                                        className="inline-input"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.75rem' }}>Rate</label>
                                                    <input
                                                        type="number"
                                                        className="inline-input"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                    />
                                                </div>
                                                <div style={{ flex: 1, textAlign: 'right' }}>
                                                    <label style={{ fontSize: '0.75rem' }}>Amount</label>
                                                    <div style={{ fontWeight: 600 }}>${(item.quantity * item.rate).toFixed(2)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={handleAddManualItem} className="btn-secondary" style={{ width: '100%', py: '0.5rem' }}>
                                        <Plus size={16} />
                                        <span>Add Manual Item</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => setStep(1)}>
                                <ChevronLeft size={18} />
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                disabled={lineItems.length === 0}
                                onClick={() => setStep(3)}
                            >
                                <span>Next: Review & Totals</span>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-slide-up">
                        <h2 style={{ marginBottom: '1.5rem' }}>Step 3: Review & Finalize</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Invoice Date</label>
                                    <input
                                        type="date"
                                        value={invoiceData.invoice_date}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        value={invoiceData.due_date}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Notes (shown on invoice)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Thanks for your business!"
                                        value={invoiceData.notes}
                                        onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="card" style={{ background: '#f8fafc', padding: '1.5rem' }}>
                                <h4 style={{ marginBottom: '1rem' }}>Summary</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Subtotal</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b' }}>Tax Rate (%)</span>
                                        <input
                                            type="number"
                                            className="inline-input"
                                            style={{ width: '60px', textAlign: 'right' }}
                                            value={invoiceData.tax_rate}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, tax_rate: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#64748b' }}>Discount ($)</span>
                                        <input
                                            type="number"
                                            className="inline-input"
                                            style={{ width: '80px', textAlign: 'right' }}
                                            value={invoiceData.discount_amount}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, discount_amount: e.target.value })}
                                        />
                                    </div>
                                    <hr style={{ margin: '0.5rem 0', borderColor: '#e2e8f0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        <span>Total</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                            <button className="btn-secondary" onClick={() => setStep(2)}>
                                <ChevronLeft size={18} />
                                Back
                            </button>
                            <button
                                className="btn-primary"
                                disabled={loading}
                                onClick={handleCreateInvoice}
                                style={{ background: '#10b981' }}
                            >
                                <FileText size={18} />
                                <span>{loading ? 'Generating...' : 'Create Invoice'}</span>
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
