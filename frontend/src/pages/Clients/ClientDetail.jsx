import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Mail, Phone, MapPin, Building,
    Briefcase, Plus, ExternalLink, Clock, FileText
} from 'lucide-react';
import api from '../../services/api';

const ClientDetail = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClientData();
    }, [id]);

    const fetchClientData = async () => {
        try {
            setLoading(true);
            const [clientRes, projectsRes] = await Promise.all([
                api.get(`/clients/${id}`),
                api.get(`/projects?client_id=${id}`)
            ]);
            setClient(clientRes.data.client);
            setProjects(projectsRes.data.projects);
            setError(null);
        } catch (err) {
            console.error('Error fetching client details:', err);
            setError('Failed to load client details.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading client details...</p>
            </div>
        );
    }

    if (error || !client) {
        return (
            <div className="page-wrapper">
                <div className="error-state card">
                    <p>{error || 'Client not found.'}</p>
                    <Link to="/clients" className="btn-secondary mt-4">
                        <ArrowLeft size={18} />
                        <span>Back to Clients</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="mb-6">
                <Link to="/clients" className="view-detail-link mb-4">
                    <ArrowLeft size={16} />
                    <span>Back to Clients</span>
                </Link>
                <div className="page-header mt-2">
                    <div>
                        <h1 className="page-title">{client.name}</h1>
                        {client.company && <p className="page-subtitle">{client.company}</p>}
                    </div>
                </div>
            </div>

            <div className="grid-details" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Client Info Sidebar */}
                <div className="sidebar-column">
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 600 }}>Contact Info</h3>
                        <div className="client-meta">
                            <Mail size={16} />
                            <span>{client.email || 'No email provided'}</span>
                        </div>
                        <div className="client-meta">
                            <Phone size={16} />
                            <span>{client.phone || 'No phone provided'}</span>
                        </div>
                        <div className="client-meta" style={{ alignItems: 'flex-start' }}>
                            <MapPin size={16} style={{ marginTop: '3px' }} />
                            <span>{client.address || 'No address provided'}</span>
                        </div>

                        <hr style={{ margin: '1.5rem 0', border: 'none', borderTop: '1px solid #f1f5f9' }} />

                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.125rem', fontWeight: 600 }}>Billing Details</h3>
                        <div className="client-meta">
                            <Building size={16} />
                            <span>Tax ID: {client.tax_id || 'N/A'}</span>
                        </div>
                        <div className="client-meta">
                            <Clock size={16} />
                            <span>Rate: ${client.default_hourly_rate || 0}/hr</span>
                        </div>
                        <div className="client-meta">
                            <FileText size={16} />
                            <span>Terms: {client.payment_terms || 'Standard'}</span>
                        </div>
                    </div>
                </div>

                {/* Projects List */}
                <div className="main-column">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeights: 600 }}>Projects</h2>
                        <Link to={`/projects?new=true&client_id=${client.id}`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={18} />
                            <span>New Project</span>
                        </Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="empty-state card" style={{ padding: '3rem' }}>
                            <Briefcase size={40} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                            <p>No projects found for this client.</p>
                        </div>
                    ) : (
                        <div className="projects-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {projects.map(project => (
                                <div key={project.id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{project.name}</h4>
                                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                            <span className="rate-badge" style={{
                                                backgroundColor: project.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9',
                                                color: project.status === 'ACTIVE' ? '#059669' : '#64748b'
                                            }}>
                                                {project.status}
                                            </span>
                                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                Budget: {project.budget_type === 'FIXED' ? `$${project.estimated_budget}` : `$${project.billing_rate}/hr`}
                                            </span>
                                        </div>
                                    </div>
                                    <Link to={`/projects/${project.id}`} className="icon-btn tertiary">
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;
