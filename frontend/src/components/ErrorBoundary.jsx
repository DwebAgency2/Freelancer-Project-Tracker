import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="auth-container">
                    <div className="auth-card" style={{ textAlign: 'center' }}>
                        <div style={{ color: '#ef4444', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                            <AlertCircle size={64} />
                        </div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Mission Interrupted</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
                            A critical error occurred. We've captured the diagnostics and are ready to restore navigation.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary auth-btn"
                        >
                            <RefreshCw size={18} />
                            <span>Reboot Application</span>
                        </button>
                        {this.state.error && (
                            <details style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', textAlign: 'left', opacity: 0.4, fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>View Diagnostic Log</summary>
                                {this.state.error.toString()}
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
