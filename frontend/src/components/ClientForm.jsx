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
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Client' : 'Add New Client'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Client Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label>Company</label>
                        <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="client@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tax ID / VAT</label>
                        <input
                            type="text"
                            name="tax_id"
                            value={formData.tax_id}
                            onChange={handleChange}
                            placeholder="e.g. EIN or VAT number"
                        />
                    </div>
                    <div className="form-group">
                        <label>Default Hourly Rate ($)</label>
                        <input
                            type="number"
                            name="default_hourly_rate"
                            value={formData.default_hourly_rate}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                        />
                    </div>
                    <div className="form-group">
                        <label>Payment Terms</label>
                        <input
                            type="text"
                            name="payment_terms"
                            value={formData.payment_terms}
                            onChange={handleChange}
                            placeholder="e.g. Net 30"
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Street, City, Country"
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="form-group full-width">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any private notes about this client..."
                            rows="2"
                        ></textarea>
                    </div>
                    <div className="modal-footer full-width">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Update Client' : 'Save Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClientForm;
