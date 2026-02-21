import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ClientForm = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        tax_id: '',
        default_hourly_rate: '',
        payment_terms: '',
        notes: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                default_hourly_rate: initialData.default_hourly_rate || '',
            });
        } else {
            setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                address: '',
                tax_id: '',
                default_hourly_rate: '',
                payment_terms: '',
                notes: '',
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up" style={{ maxWidth: '600px', width: '90%' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{initialData ? 'Edit Client Profile' : 'Register New Client'}</h2>
                    <button onClick={onClose} className="icon-btn" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Full Name / Identifier*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Alexander Pierce"
                            />
                        </div>
                        <div className="form-group">
                            <label>Organization / Company</label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="Acme Dynamics"
                            />
                        </div>
                        <div className="form-group">
                            <label>Primary Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="client@nexus.com"
                            />
                        </div>
                        <div className="form-group">
                            <label>Direct Line / Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Tax ID / Registration</label>
                            <input
                                type="text"
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Standard Hourly Rate ($)</label>
                            <input
                                type="number"
                                name="default_hourly_rate"
                                value={formData.default_hourly_rate}
                                onChange={handleChange}
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Payment Cycle</label>
                            <input
                                type="text"
                                name="payment_terms"
                                value={formData.payment_terms}
                                onChange={handleChange}
                                placeholder="e.g. Net 15"
                            />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Physical / Billing Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                            ></textarea>
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Internal Strategy Notes</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Relationship context, specific requirements..."
                            ></textarea>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            <span>{initialData ? 'Synchronize Updates' : 'Initialize Client'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
