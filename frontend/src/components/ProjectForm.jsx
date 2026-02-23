import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Target } from 'lucide-react';
import api from '../services/api';

const ProjectForm = ({ isOpen, onClose, onSubmit, initialData, preSelectedClientId, submitting }) => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        client_id: '',
        status: 'POTENTIAL',
        budget_type: 'FIXED',
        estimated_budget: '',
        billing_rate: '',
        description: '',
        start_date: '',
        deadline: '',
    });
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                estimated_budget: initialData.estimated_budget || '',
                billing_rate: initialData.billing_rate || '',
                start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
                deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
            });
        } else {
            setFormData({
                name: '',
                client_id: preSelectedClientId || '',
                status: 'POTENTIAL',
                budget_type: 'FIXED',
                estimated_budget: '',
                billing_rate: '',
                description: '',
                start_date: '',
                deadline: '',
            });
        }
    }, [initialData, preSelectedClientId, isOpen]);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data.clients);
        } catch (err) {
            console.error('Error fetching clients for form:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (formData.budget_type === 'FIXED' && formData.estimated_budget < 0) {
            errors.estimated_budget = 'Budget must be positive';
        }
        if (formData.budget_type === 'HOURLY' && formData.billing_rate < 0) {
            errors.billing_rate = 'Rate must be positive';
        }
        if (formData.start_date && formData.deadline && new Date(formData.deadline) < new Date(formData.start_date)) {
            errors.deadline = 'Deadline cannot be before start date';
        }

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }
        setLocalErrors({});
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up" style={{ maxWidth: '650px', width: '90%' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{initialData ? 'Modify Project Parameters' : 'Initiate New Project'}</h2>
                    <button onClick={onClose} className="icon-btn" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Target size={14} className="text-secondary" />
                                Project Title*
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Brand Identity Overhaul"
                                className="styled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Client Entity*</label>
                            <div className="select-wrapper">
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleChange}
                                    required
                                    className="styled-select"
                                >
                                    <option value="">Select a business partner</option>
                                    {clients && clients.length > 0 ? (
                                        clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name} {client.company ? `(${client.company})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No clients detected</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Current Status</label>
                            <div className="select-wrapper">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="styled-select"
                                >
                                    <option value="POTENTIAL">Potential</option>
                                    <option value="ACTIVE">Active Engagement</option>
                                    <option value="COMPLETED">Completed / Archived</option>
                                    <option value="ON_HOLD">On Ice / Deferred</option>
                                    <option value="CANCELLED">Terminated</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Budget Model</label>
                            <div className="select-wrapper">
                                <select
                                    name="budget_type"
                                    value={formData.budget_type}
                                    onChange={handleChange}
                                    className="styled-select"
                                >
                                    <option value="FIXED">Fixed Milestone / Project</option>
                                    <option value="HOURLY">Variable / Hourly Rate</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            {formData.budget_type === 'FIXED' ? (
                                <>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign size={14} className="text-secondary" />
                                        Total Estimated Value ($)
                                    </label>
                                    <input
                                        type="number"
                                        name="estimated_budget"
                                        value={formData.estimated_budget}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="styled-input"
                                    />
                                    {localErrors.estimated_budget && <p className="error-text">{localErrors.estimated_budget}</p>}
                                </>
                            ) : (
                                <>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign size={14} className="text-secondary" />
                                        Hourly Rate ($/hr)
                                    </label>
                                    <input
                                        type="number"
                                        name="billing_rate"
                                        value={formData.billing_rate}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        className="styled-input"
                                    />
                                    {localErrors.billing_rate && <p className="error-text">{localErrors.billing_rate}</p>}
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} className="text-secondary" />
                                Execution Start
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className="styled-input"
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Calendar size={14} className="text-secondary" />
                                Strategic Deadline
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="styled-input"
                                />
                                {localErrors.deadline && <p className="error-text">{localErrors.deadline}</p>}
                            </div>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Operational Scope / Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Core objectives, deliverables, and technical parameters..."
                                rows="3"
                                className="styled-textarea"
                            ></textarea>
                        </div>
                    </div>

                    <div className="modal-actions" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Abort Launch
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{initialData ? 'Push Project Updates' : 'Confirm Launch'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
