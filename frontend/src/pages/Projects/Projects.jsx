import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, Clock, DollarSign, Edit2, Trash2, Calendar, Users } from 'lucide-react';
import api from '../../services/api';
import ProjectForm from '../../components/ProjectForm';

const Projects = () => {
    const [searchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [clientFilter, setClientFilter] = useState('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([fetchProjects(), fetchClients()]);
            setLoading(false);

            // Handle auto-open and filters via query params
            const cid = searchParams.get('client_id');
            if (cid) setClientFilter(cid);
            if (searchParams.get('new') === 'true') {
                setIsModalOpen(true);
            }
        };
        loadInitialData();
    }, [searchParams]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data.projects);
            setError(null);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects.');
        }
    };

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data.clients);
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const handleAddProject = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert('Failed to delete project.');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingProject) {
                await api.put(`/projects/${editingProject.id}`, formData);
            } else {
                await api.post('/projects', formData);
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving project');
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
        const matchesClient = clientFilter === 'ALL' || project.client_id?.toString() === clientFilter;
        return matchesSearch && matchesStatus && matchesClient;
    });

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">Track your project progress, budgets, and status.</p>
                </div>
                <button onClick={handleAddProject} className="btn-primary">
                    <Plus size={18} />
                    <span>New Project</span>
                </button>
            </div>

            <div className="card" style={{ gap: '1rem', flexWrap: 'wrap', display: 'flex', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)' }}>
                <div className="search-bar-modern" style={{ flex: 1, minWidth: '300px' }}>
                    <Search size={20} className="text-secondary" />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={18} className="text-secondary" />
                        <select
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', color: 'white', minWidth: '150px' }}
                        >
                            <option value="ALL">All Clients</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id} style={{ background: '#0d1117' }}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Filter size={18} className="text-secondary" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', color: 'white' }}
                        >
                            <option value="ALL" style={{ background: '#0d1117' }}>All Statuses</option>
                            <option value="POTENTIAL" style={{ background: '#0d1117' }}>Potential</option>
                            <option value="ACTIVE" style={{ background: '#0d1117' }}>Active</option>
                            <option value="ON_HOLD" style={{ background: '#0d1117' }}>On Hold</option>
                            <option value="COMPLETED" style={{ background: '#0d1117' }}>Completed</option>
                            <option value="CANCELLED" style={{ background: '#0d1117' }}>Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading projects...</p>
                </div>
            ) : error ? (
                <div className="error-state card">
                    <p>{error}</p>
                    <button onClick={fetchProjects} className="btn-secondary">Retry</button>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="empty-state card">
                    <Briefcase size={48} className="empty-icon" />
                    <h3>No projects found</h3>
                    <p>{searchTerm || statusFilter !== 'ALL' ? 'No projects match your current filters.' : 'Start your first project to begin tracking your work.'}</p>
                    {(!searchTerm && statusFilter === 'ALL') && (
                        <button onClick={handleAddProject} className="btn-primary mt-4">
                            Create Project
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid-list">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{project.name}</h3>
                                        <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8125rem' }}>{project.client_name}</p>
                                    </div>
                                    <span className="status-badge" style={{
                                        backgroundColor: project.status === 'ACTIVE' ? 'rgba(79, 209, 197, 0.1)' : 'rgba(255,255,255,0.05)',
                                        color: project.status === 'ACTIVE' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        border: project.status === 'ACTIVE' ? '1px solid var(--border-glow)' : '1px solid var(--border-glass)'
                                    }}>
                                        {project.status}
                                    </span>
                                </div>

                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                    {project.description || 'No description provided.'}
                                </p>

                                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                        <Clock size={16} className="text-secondary" />
                                        <span>{project.budget_type === 'HOURLY' ? 'Hourly' : 'Fixed'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                        <DollarSign size={16} className="text-secondary" />
                                        <span>{project.budget_type === 'FIXED' ? `$${project.estimated_budget}` : `$${project.billing_rate}/hr`}</span>
                                    </div>
                                    {project.deadline && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            <Calendar size={16} className="text-secondary" />
                                            <span style={{ color: new Date(project.deadline) < new Date() ? '#ef4444' : 'inherit' }}>
                                                {new Date(project.deadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button onClick={() => handleEditProject(project)} className="icon-btn" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteProject(project.id)} className="icon-btn danger" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ProjectForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingProject}
                preSelectedClientId={searchParams.get('client_id')}
            />
        </div>
    );
};

export default Projects;
