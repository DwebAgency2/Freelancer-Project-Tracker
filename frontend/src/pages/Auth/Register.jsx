import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        business_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);

        try {
            await register(formData.email, formData.password, formData.business_name);
            toast.success('Account created successfully!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to register account.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card animate-slide-up">
                <div className="auth-brand">
                    <div className="auth-logo-wrapper">
                        <Zap size={36} color="white" fill="white" />
                    </div>
                    <div>
                        <h2>REGISTRATION</h2>
                        <p>Initialize your professional operational hub</p>
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Business / Agency Entity</label>
                        <input
                            type="text"
                            name="business_name"
                            className="styled-input"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Orbit Creative Studio"
                        />
                    </div>
                    <div className="form-group">
                        <label>Operational Channel (Email)</label>
                        <input
                            type="email"
                            name="email"
                            className="styled-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="operative@zentrack.ai"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Security Key</label>
                            <input
                                type="password"
                                name="password"
                                className="styled-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Confirm Key</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="styled-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary auth-btn" style={{ height: '4rem', fontSize: '1.25rem', letterSpacing: '0.05em' }} disabled={loading}>
                        {loading ? <div className="btn-spinner"></div> : 'INITIATE REGISTRATION'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already registered? <Link to="/login">GO TO LOG IN</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
