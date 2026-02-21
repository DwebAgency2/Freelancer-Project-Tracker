import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Target } from 'lucide-react';
import api from '../services/api';

const ProjectForm = ({ isOpen, onClose, onSubmit, initialData, preSelectedClientId }) => {
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
                            <label>Project Title*</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Brand Identity Overhaul"
                            />
                        </div>

                        <div className="form-group">
                            <label>Client Entity*</label>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleChange}
                                required
                                style={{ width: '100%' }}
                            >
                                <option value="" style={{ background: '#0d1117' }}>Select a business partner</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id} style={{ background: '#0d1117' }}>
                                        {client.name} {client.company ? `(${client.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Current Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            >
                                <option value="POTENTIAL" style={{ background: '#0d1117' }}>Potential</option>
                                <option value="ACTIVE" style={{ background: '#0d1117' }}>Active Engagement</option>
                                <option value="COMPLETED" style={{ background: '#0d1117' }}>Completed / Archived</option>
                                <option value="ON_HOLD" style={{ background: '#0d1117' }}>On Ice / Deferred</option>
                                <option value="CANCELLED" style={{ background: '#0d1117' }}>Terminated</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Budget Model</label>
                            <select
                                name="budget_type"
                                value={formData.budget_type}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            >
                                <option value="FIXED" style={{ background: '#0d1117' }}>Fixed Milestone / Project</option>
                                <option value="HOURLY" style={{ background: '#0d1117' }}>Variable / Hourly Rate</option>
                            </select>
                        </div>

                        <div className="form-group">
                            {formData.budget_type === 'FIXED' ? (
                                <>
                                    <label>Total Estimated Value ($)</label>
                                    <input
                                        type="number"
                                        name="estimated_budget"
                                        value={formData.estimated_budget}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </>
                            ) : (
                                <>
                                    <label>Hourly Synchronization Rate ($/hr)</label>
                                    <input
                                        type="number"
                                        name="billing_rate"
                                        value={formData.billing_rate}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Execution Start</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Strategic Deadline</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                />
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
                            ></textarea>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Abort
                        </button>
                        <button type="submit" className="btn-primary">
                            <span>{initialData ? 'Push Project Updates' : 'Confirm Launch'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
