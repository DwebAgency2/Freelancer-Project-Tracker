import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
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
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Project' : 'Create New Project'}</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group full-width">
                        <label>Project Name*</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Website Redesign"
                        />
                    </div>

                    <div className="form-group">
                        <label>Client*</label>
                        <select
                            name="client_id"
                            value={formData.client_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a client</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name} {client.company ? `(${client.company})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="POTENTIAL">Potential</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Budget Type</label>
                        <select
                            name="budget_type"
                            value={formData.budget_type}
                            onChange={handleChange}
                        >
                            <option value="FIXED">Fixed Price</option>
                            <option value="HOURLY">Hourly Rate</option>
                        </select>
                    </div>

                    <div className="form-group">
                        {formData.budget_type === 'FIXED' ? (
                            <>
                                <label>Estimated Budget ($)</label>
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
                                <label>Billing Rate ($/hr)</label>
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
                        <label>Start Date</label>
                        <input
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Project scope, deliverables, etc."
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="modal-footer full-width">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            {initialData ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectForm;
