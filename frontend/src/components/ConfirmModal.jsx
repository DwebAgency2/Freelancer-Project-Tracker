import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed? This action may be irreversible.",
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger"
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay animate-fade-in" onClick={onClose}>
            <div
                className="confirm-modal card animate-scale-up"
                onClick={e => e.stopPropagation()}
                style={{
                    maxWidth: '400px',
                    padding: '2.5rem',
                    textAlign: 'center',
                    background: 'var(--bg-glass-heavy)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid var(--border-glass)'
                }}
            >
                <button onClick={onClose} className="close-btn-minimal">
                    <X size={18} />
                </button>

                <div className={`confirm-icon-wrapper ${type}`} style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    background: type === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(79, 209, 197, 0.1)',
                    color: type === 'danger' ? '#ef4444' : 'var(--accent-primary)',
                    border: `1px solid ${type === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-glow)'}`
                }}>
                    <AlertTriangle size={32} />
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'white' }}>{title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ flex: 1, justifyContent: 'center' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={type === 'danger' ? "btn-danger" : "btn-primary"}
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            background: type === 'danger' ? '#ef4444' : 'var(--accent-primary)',
                            color: 'white'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                .btn-danger {
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    display: flex;
                    alignItems: center;
                    gap: 0.5rem;
                }
                .btn-danger:hover {
                    background: #dc2626;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .close-btn-minimal {
                    position: absolute;
                    top: 1.25rem;
                    right: 1.25rem;
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .close-btn-minimal:hover {
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
