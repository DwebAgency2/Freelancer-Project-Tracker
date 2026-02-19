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
        <div className="profile-container">
            <div className="page-header">
                <h1>Settings & Profile</h1>
                <p>Manage your business information and application settings</p>
            </div>

            {message && (
                <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="profile-grid">
                    {/* Business Information */}
                    <section className="profile-section">
                        <h3><Building className="section-icon" /> Business Details</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Business Name</label>
                                <input type="text" name="business_name" value={formData.business_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Email Address (read-only)</label>
                                <input type="email" value={user?.email || ''} disabled className="input-disabled" />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Tax ID / VAT Number</label>
                                <input type="text" name="tax_id" value={formData.tax_id} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Business Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows="3"></textarea>
                        </div>
                    </section>

                    {/* Logo Upload */}
                    <section className="profile-section logo-section">
                        <h3><Upload className="section-icon" /> Business Logo</h3>
                        <div className="logo-upload-wrapper">
                            <div className="logo-preview">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" />
                                ) : (
                                    <div className="logo-placeholder">No Logo</div>
                                )}
                            </div>
                            <div className="logo-controls">
                                <label className="btn-secondary">
                                    Choose New Logo
                                    <input type="file" onChange={handleLogoChange} accept="image/*" hidden />
                                </label>
                                <p className="txt-small">Accepts JPG, PNG, SVG (Max 5MB)</p>
                            </div>
                        </div>
                    </section>

                    {/* Billing Defaults */}
                    <section className="profile-section">
                        <h3><CreditCard className="section-icon" /> Billing Defaults</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Default Hourly Rate ($)</label>
                                <input type="number" name="default_hourly_rate" value={formData.default_hourly_rate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Default Tax Rate (%)</label>
                                <input type="number" name="default_tax_rate" value={formData.default_tax_rate} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Invoice Prefix</label>
                                <input type="text" name="invoice_prefix" value={formData.invoice_prefix} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Payment Instructions</label>
                            <textarea name="payment_instructions" value={formData.payment_instructions} onChange={handleChange} rows="3" placeholder="e.g. Bank Account details"></textarea>
                        </div>
                        <div className="form-group">
                            <label>Terms & Conditions</label>
                            <textarea name="terms_conditions" value={formData.terms_conditions} onChange={handleChange} rows="3"></textarea>
                        </div>
                    </section>
                </div>

                <div className="profile-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Saving Changes...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
