import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import api from '../services/api';

const TimeEntryForm = ({ isOpen, onClose, onSubmit, initialData, submitting }) => {
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState({
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        duration_minutes: '',
        description: '',
        is_billable: true,
    });
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                duration_minutes: initialData.duration_minutes || '',
            });
        } else {
            setFormData({
                project_id: '',
                date: new Date().toISOString().split('T')[0],
                start_time: '',
                end_time: '',
                duration_minutes: '',
                description: '',
                is_billable: true,
            });
        }
    }, [initialData, isOpen]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects?status=ACTIVE');
            setProjects(response.data.projects);
        } catch (err) {
            console.error('Error fetching projects:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        if (!formData.project_id) {
            errors.project_id = 'Please select a project';
        }
        if (formData.duration_minutes !== '' && parseInt(formData.duration_minutes) <= 0) {
            errors.duration_minutes = 'Duration must be positive';
        }

        if (Object.keys(errors).length > 0) {
            setLocalErrors(errors);
            return;
        }
        setLocalErrors({});

        // If duration is missing but times are present, backend handles it
        // but it's good to have a simple check here
        const dataToSubmit = { ...formData };
        if (dataToSubmit.duration_minutes) {
            dataToSubmit.duration_minutes = parseInt(dataToSubmit.duration_minutes);
        }

        onSubmit(dataToSubmit);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-slide-up" style={{ maxWidth: '550px', width: '90%' }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)' }}>
                            <Clock size={20} />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{initialData ? 'Modify Work Session' : 'Record Manual Entry'}</h2>
                    </div>
                    <button onClick={onClose} className="icon-btn" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Associate Project*</label>
                            <select
                                name="project_id"
                                className="styled-select"
                                value={formData.project_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id} style={{ background: '#0d1117' }}>{p.name} — {p.client_name}</option>
                                ))}
                            </select>
                            {localErrors.project_id && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{localErrors.project_id}</p>}
                        </div>

                        <div className="form-group">
                            <label>Session Date*</label>
                            <input
                                type="date"
                                name="date"
                                className="styled-input"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration (Minutes)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                className="styled-input"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                placeholder="e.g. 60"
                                min="1"
                            />
                            {localErrors.duration_minutes && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{localErrors.duration_minutes}</p>}
                        </div>

                        <div className="form-group">
                            <label>Commencement</label>
                            <input
                                type="time"
                                name="start_time"
                                className="styled-input"
                                value={formData.start_time}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Completion</label>
                            <input
                                type="time"
                                name="end_time"
                                className="styled-input"
                                value={formData.end_time}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Session Description</label>
                            <textarea
                                name="description"
                                className="styled-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Detail the specific tasks completed during this window..."
                                rows="3"
                            ></textarea>
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                            <input
                                type="checkbox"
                                name="is_billable"
                                id="is_billable"
                                checked={formData.is_billable}
                                onChange={handleChange}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            <label htmlFor="is_billable" style={{ marginBottom: 0, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Designate as billable time entry</label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <div className="btn-spinner"></div>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <span>{initialData ? 'Synchronize Session' : 'Finalize Record'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimeEntryForm;
