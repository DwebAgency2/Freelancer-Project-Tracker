import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to login. Please check your credentials.';
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
                        <h2>LOG IN</h2>
                        <p>Enter your credentials to access the console</p>
                    </div>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                        <label>Operational Identity</label>
                        <input
                            type="email"
                            className="styled-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="agent@zentrack.ai"
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '3.5rem' }}>
                        <label>Security Key</label>
                        <input
                            type="password"
                            className="styled-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-btn" style={{ height: '4rem', fontSize: '1.25rem', letterSpacing: '0.05em' }} disabled={loading}>
                        {loading ? <div className="btn-spinner"></div> : 'INITIALIZE SESSION'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>New operative? <Link to="/register">GO TO REGISTRATION</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
