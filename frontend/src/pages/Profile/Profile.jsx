import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Building, Phone, MapPin, CreditCard, Upload } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        business_name: '',
        phone: '',
        address: '',
        tax_id: '',
        default_hourly_rate: '',
        invoice_prefix: '',
        payment_instructions: '',
        terms_conditions: '',
        default_tax_rate: '',
    });
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                business_name: user.business_name || '',
                phone: user.phone || '',
                address: user.address || '',
                tax_id: user.tax_id || '',
                default_hourly_rate: user.default_hourly_rate || '',
                invoice_prefix: user.invoice_prefix || '',
                payment_instructions: user.payment_instructions || '',
                terms_conditions: user.terms_conditions || '',
                default_tax_rate: user.default_tax_rate || '',
            });
            if (user.logo_url) {
                setLogoPreview(`http://localhost:5000${user.logo_url}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1. Update Profile Data
            const profileRes = await api.put('/user/profile', formData);

            // 2. Upload Logo if selected
            if (logo) {
                const logoFormData = new FormData();
                logoFormData.append('logo', logo);
                const logoRes = await api.post('/user/logo', logoFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                profileRes.data.user.logo_url = logoRes.data.logo_url;
            }

            updateProfile(profileRes.data.user);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Error updating profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings & Profile</h1>
                    <p className="page-subtitle">Configure your business identity and invoicing defaults.</p>
                </div>
            </div>

            {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: '2rem' }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Business Information */}
                        <div className="card">
                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Building size={18} className="text-accent" />
                                Business Identity
                            </h3>
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label>Professional Name / Business Name</label>
                                    <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} placeholder="e.g. John Doe Design" />
                                </div>
                                <div className="form-group">
                                    <label>Contact Email (Secure)</label>
                                    <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Direct Phone</label>
                                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Tax ID / VAT</label>
                                        <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Registered Office Address</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="card">
                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Upload size={18} className="text-accent" />
                                Brand Asset (Logo)
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-glass)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                }}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Building size={32} style={{ opacity: 0.2 }} />
                                    )}
                                </div>
                                <div>
                                    <label className="btn-secondary" style={{ cursor: 'pointer' }}>
                                        Upload New Asset
                                        <input type="file" onChange={handleLogoChange} accept="image/*" hidden />
                                    </label>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>SVG or PNG recommended for best quality.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Billing Defaults */}
                        <div className="card">
                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CreditCard size={18} className="text-accent" />
                                Billing & Compliance
                            </h3>
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Base Hourly Rate ($)</label>
                                        <input type="number" name="default_hourly_rate" value={formData.default_hourly_rate} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Standard Tax (%)</label>
                                        <input type="number" name="default_tax_rate" value={formData.default_tax_rate} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Invoice Number Prefix</label>
                                    <input type="text" name="invoice_prefix" value={formData.invoice_prefix} onChange={handleChange} placeholder="e.g. INV-" />
                                </div>
                                <div className="form-group">
                                    <label>Payment / Remittance Info</label>
                                    <textarea name="payment_instructions" value={formData.payment_instructions} onChange={handleChange} rows="3" placeholder="Bank details, wire instructions..."></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Standard Terms & Conditions</label>
                                    <textarea name="terms_conditions" value={formData.terms_conditions} onChange={handleChange} rows="3" placeholder="Payment due within 30 days..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem' }}>
                                {loading ? 'Saving Changes...' : 'Synchronize Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Profile;
