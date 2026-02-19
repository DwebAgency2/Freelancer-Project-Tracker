import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Building, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import ClientForm from '../../components/ClientForm';
import { Link } from 'react-router-dom';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/clients');
            setClients(response.data.clients);
            setError(null);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError('Failed to load clients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEditClient = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleDeleteClient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client? This will affect associated projects and invoices.')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(clients.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to delete client.');
        }
    };

    const handleSubmit = async (formData) => {
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, formData);
            } else {
                await api.post('/clients', formData);
            }
            setIsModalOpen(false);
            fetchClients();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving client');
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="page-wrapper animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Manage your customer database and contact information.</p>
                </div>
                <button onClick={handleAddClient} className="btn-primary">
                    <Plus size={18} />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="card filters-card">
                <div className="search-bar">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading clients...</p>
                </div>
            ) : error ? (
                <div className="error-state card">
                    <p>{error}</p>
                    <button onClick={fetchClients} className="btn-secondary">Retry</button>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="empty-state card">
                    <Building size={48} className="empty-icon" />
                    <h3>No clients found</h3>
                    <p>{searchTerm ? 'Try a different search term.' : 'Get started by adding your first client.'}</p>
                    {!searchTerm && (
                        <button onClick={handleAddClient} className="btn-primary mt-4">
                            Add Client
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid-list">
                    {filteredClients.map((client) => (
                        <div key={client.id} className="client-card card animate-slide-up">
                            <div className="client-card-header">
                                <div className="client-info">
                                    <h3 className="client-name">{client.name}</h3>
                                    {client.company && <div className="client-company">{client.company}</div>}
                                </div>
                                <div className="client-actions">
                                    <button onClick={() => handleEditClient(client)} className="icon-btn tertiary" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteClient(client.id)} className="icon-btn danger" title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="client-card-body">
                                {client.email && (
                                    <div className="client-meta">
                                        <Mail size={14} />
                                        <span>{client.email}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="client-meta">
                                        <Phone size={14} />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="client-card-footer">
                                <Link to={`/clients/${client.id}`} className="view-detail-link">
                                    <span>View Projects</span>
                                    <ExternalLink size={14} />
                                </Link>
                                {client.default_hourly_rate > 0 && (
                                    <div className="rate-badge">
                                        ${client.default_hourly_rate}/hr
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ClientForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={editingClient}
            />
        </div>
    );
};

export default Clients;
