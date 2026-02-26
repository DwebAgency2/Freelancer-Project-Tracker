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

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.');
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
                        <Zap size={28} color="white" fill="white" />
                    </div>
                    <div>
                        <h2>Registration</h2>
                        <p>Join the agency network</p>
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Business Name</label>
                        <input
                            type="text"
                            name="business_name"
                            className="styled-input"
                            value={formData.business_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g. Orbit Studio"
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="styled-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="name@agency.com"
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                className="styled-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="styled-input"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                        {loading ? <div className="btn-spinner"></div> : 'Create Your Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already joined? <Link to="/login">Log-in Here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
