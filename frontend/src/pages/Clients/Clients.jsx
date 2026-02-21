import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Building, Edit2, Trash2, ExternalLink, User } from 'lucide-react';
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
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clients</h1>
                    <p className="page-subtitle">Your strategic network of business partnerships.</p>
                </div>
                <button onClick={handleAddClient} className="btn-primary">
                    <Plus size={18} />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)' }}>
                <div className="search-bar-modern">
                    <Search size={20} className="text-secondary" />
                    <input
                        type="text"
                        placeholder="Search by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <p>Syncing client data...</p>
            ) : error ? (
                <div className="card" style={{ textAlign: 'center' }}>
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <button onClick={fetchClients} className="btn-secondary" style={{ marginTop: '1rem' }}>Retry Sync</button>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                    <Building size={48} className="text-secondary" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem' }}>No clients detected</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{searchTerm ? 'Try a more generic search term.' : 'Bridge the gap by adding your first client.'}</p>
                </div>
            ) : (
                <div className="grid-list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                    {filteredClients.map((client) => (
                        <div key={client.id} className="card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                            <div style={{ padding: '1.5rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>{client.name}</h3>
                                            <p style={{ color: 'var(--accent-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>{client.company || 'Private Entity'}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditClient(client)} className="icon-btn" style={{ width: '32px', height: '32px' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteClient(client.id)} className="icon-btn danger" style={{ width: '32px', height: '32px' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                                    {client.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            <Mail size={14} />
                                            <span>{client.email}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                                            <Phone size={14} />
                                            <span>{client.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to={`/clients/${client.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 700 }}>
                                    <span>Active Projects</span>
                                    <ExternalLink size={14} />
                                </Link>
                                {client.default_hourly_rate > 0 && (
                                    <div className="status-badge" style={{ background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)', border: '1px solid var(--border-glow)' }}>
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
