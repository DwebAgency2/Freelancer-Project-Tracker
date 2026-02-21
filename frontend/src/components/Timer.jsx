import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, RotateCcw, Zap } from 'lucide-react';
import api from '../services/api';

const Timer = ({ onTimeLogged }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [description, setDescription] = useState('');

    // Circular Progress Constants
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const countRef = useRef(null);

    useEffect(() => {
        // Load state from local storage if exists
        const saved = JSON.parse(localStorage.getItem('focus_timer_state'));
        if (saved) {
            setSeconds(saved.seconds);
            setIsActive(saved.isActive);
            setIsPaused(saved.isPaused);
            setSelectedProjectId(saved.projectId);
            setDescription(saved.description);

            if (saved.isActive && !saved.isPaused && saved.lastSync) {
                const elapsed = Math.floor((Date.now() - saved.lastSync) / 1000);
                setSeconds(s => s + elapsed);
            }
        }
        fetchProjects();
    }, []);

    useEffect(() => {
        const state = { seconds, isActive, isPaused, projectId: selectedProjectId, description, lastSync: Date.now() };
        localStorage.setItem('focus_timer_state', JSON.stringify(state));

        if (isActive && !isPaused) {
            countRef.current = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else {
            clearInterval(countRef.current);
        }
        return () => clearInterval(countRef.current);
    }, [isActive, isPaused, seconds, selectedProjectId, description]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects?status=ACTIVE');
            setProjects(response.data.projects);
        } catch (err) { console.error(err); }
    };

    const handleStart = () => {
        setIsActive(true);
        setIsPaused(false);
    };

    const handleStop = async () => {
        if (!selectedProjectId) {
            alert('Select a project to log time.');
            return;
        }

        const durationMinutes = Math.ceil(seconds / 60);
        try {
            await api.post('/time-entries', {
                project_id: selectedProjectId,
                date: new Date().toISOString().split('T')[0],
                duration_minutes: durationMinutes,
                description: description || 'Deep Work Session',
                is_billable: true
            });
            resetTimer();
            if (onTimeLogged) onTimeLogged();
        } catch (err) {
            alert('Logging failed');
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setSeconds(0);
        setDescription('');
        localStorage.removeItem('focus_timer_state');
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Progress ring calculation (for a 60 min visually relative cycle or just a pulse)
    const progress = (seconds % 3600) / 3600;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
        <div className="animate-slide-up" style={{ textAlign: 'center' }}>
            <div className="circular-timer-container">
                <svg width="240" height="240" className="circular-timer-svg">
                    <circle className="timer-ring" cx="120" cy="120" r={radius} />
                    <circle
                        className="timer-progress"
                        cx="120" cy="120" r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={isActive ? strokeDashoffset : circumference}
                    />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                        {formatTime(seconds)}
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {isActive ? (isPaused ? 'Paused' : 'Focusing...') : 'Ready'}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '3rem', maxWidth: '400px', margin: '3rem auto 0' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Working on Product Strategy</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <span className="status-badge" style={{ background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)' }}>High Energy</span>
                    </div>
                </div>

                {!isActive ? (
                    <button onClick={handleStart} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                        <Play size={20} fill="currentColor" />
                        <span>Start Focus Session</span>
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button onClick={() => setIsPaused(!isPaused)} className="btn-secondary" style={{ flex: 1, padding: '1.25rem' }}>
                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>
                        <button onClick={handleStop} className="btn-primary" style={{ flex: 1, padding: '1.25rem', background: '#ef4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}>
                            <Square size={20} fill="currentColor" />
                            <span>Stop & Log</span>
                        </button>
                    </div>
                )}

                <div className="grid-list" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setSeconds(25 * 60)}>25min</button>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setSeconds(50 * 60)}>50min</button>
                    <button className="btn-secondary" style={{ fontSize: '0.8125rem' }}>Custom</button>
                </div>

                <div className="card" style={{ marginTop: '2.5rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)' }}>
                    <div className="form-group">
                        <label>Select Project</label>
                        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                            <option value="">Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Task Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What are you working on?"
                            rows="2"
                        />
                    </div>
                </div>

                {isActive && (
                    <button onClick={() => { if (window.confirm('Discard session?')) resetTimer(); }} className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', border: 'none', color: '#ef4444' }}>
                        <RotateCcw size={16} />
                        <span>Discard Session</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Timer;
