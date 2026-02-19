import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Calendar, DollarSign, Clock,
    User, FileText, CheckCircle2, AlertCircle,
    PlayCircle, PauseCircle, XCircle
} from 'lucide-react';
import api from '../../services/api';

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/projects/${id}`);
            setProject(response.data.project);
            setError(null);
        } catch (err) {
            console.error('Error fetching project details:', err);
            setError('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE': return <PlayCircle size={20} className="text-emerald-500" />;
            case 'COMPLETED': return <CheckCircle2 size={20} className="text-blue-500" />;
            case 'ON_HOLD': return <PauseCircle size={20} className="text-amber-500" />;
            case 'CANCELLED': return <XCircle size={20} className="text-slate-500" />;
            default: return <AlertCircle size={20} className="text-primary-color" />;
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading project details...</p>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="page-wrapper">
                <div className="error-state card">
                    <p>{error || 'Project not found.'}</p>
                    <Link to="/projects" className="btn-secondary mt-4">
                        <ArrowLeft size={18} />
                        <span>Back to Projects</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="mb-6">
                <Link to="/projects" className="view-detail-link mb-4">
                    <ArrowLeft size={16} />
                    <span>Back to Projects</span>
                </Link>
                <div className="page-header mt-2">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            {getStatusIcon(project.status)}
                            <span className="rate-badge" style={{
                                backgroundColor: project.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9',
                                color: project.status === 'ACTIVE' ? '#059669' : '#64748b'
                            }}>
                                {project.status}
                            </span>
                        </div>
                        <h1 className="page-title">{project.name}</h1>
                        <Link to={`/clients/${project.client_id}`} className="view-detail-link" style={{ fontSize: '1rem' }}>
                            <User size={16} />
                            <span>{project.client_name}</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Project Summary Card */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Budget & Rate</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                                <DollarSign size={20} style={{ color: '#2563eb' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>{project.budget_type === 'FIXED' ? 'Est. Budget' : 'Billing Rate'}</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                                    {project.budget_type === 'FIXED' ? `$${project.estimated_budget}` : `$${project.billing_rate}/hr`}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                                <Clock size={20} style={{ color: '#16a34a' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Budget Type</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                                    {project.budget_type === 'FIXED' ? 'Fixed Price Project' : 'Hourly Billing Project'}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContents: 'center' }}>
                                <Calendar size={20} style={{ color: '#db2777' }} />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Created On</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>
                                    {new Date(project.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description and Notes */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Project Description</h3>
                    <div className="project-description" style={{ color: '#475569', lineHeight: 1.6 }}>
                        {project.description ? (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <FileText size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <p>No description provided for this project.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions / Future Time Logs Section */}
            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Time Logs & Progress</h3>
                    <Link to={`/invoices?project_id=${project.id}`} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Manage Invoices</span>
                        <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                    </Link>
                </div>
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                    <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1rem' }}>Time tracking for this project will be available in **Week 5**.</p>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
