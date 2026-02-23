import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Pause, RotateCcw, Zap, ChevronRight, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';

const Timer = ({ onTimeLogged }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [seconds, setSeconds] = useState(0); // Display seconds
    const [startTime, setStartTime] = useState(null); // Timestamp when current segment started
    const [accumulatedSeconds, setAccumulatedSeconds] = useState(0); // Seconds elapsed in PREVIOUS segments
    const [targetSeconds, setTargetSeconds] = useState(0); // Total duration if countdown
    const [isCountdown, setIsCountdown] = useState(false);

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [description, setDescription] = useState('');

    // UI States
    const [showConfirm, setShowConfirm] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('25');

    // Circular Progress Constants
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const countRef = useRef(null);

    useEffect(() => {
        // Load state from local storage
        const saved = JSON.parse(localStorage.getItem('focus_timer_state'));
        if (saved) {
            setIsActive(saved.isActive);
            setIsPaused(saved.isPaused);
            setAccumulatedSeconds(saved.accumulatedSeconds || 0);
            setStartTime(saved.startTime);
            setTargetSeconds(saved.targetSeconds || 0);
            setIsCountdown(saved.isCountdown || false);
            setSelectedProjectId(saved.projectId);
            setDescription(saved.description);
            syncTime(saved);
        }
        fetchProjects();

        // Background Sync Listener
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const refreshed = JSON.parse(localStorage.getItem('focus_timer_state'));
                if (refreshed) syncTime(refreshed);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const syncTime = (state) => {
        if (state.isActive && !state.isPaused && state.startTime) {
            const elapsedSinceStart = Math.floor((Date.now() - state.startTime) / 1000);
            const totalElapsed = (state.accumulatedSeconds || 0) + elapsedSinceStart;

            if (state.isCountdown) {
                const remaining = Math.max(0, state.targetSeconds - totalElapsed);
                setSeconds(remaining);
                if (remaining === 0) handleAutoStop();
            } else {
                setSeconds(totalElapsed);
            }
        } else {
            const totalElapsed = state.accumulatedSeconds || 0;
            setSeconds(state.isCountdown ? Math.max(0, state.targetSeconds - totalElapsed) : totalElapsed);
        }
    };

    const handleAutoStop = () => {
        toast('Session Objective Reached!', { icon: '🎯', duration: 5000 });
        // We'll let the user manually log or stop, but we stop the clock.
        setIsPaused(true);
    };

    useEffect(() => {
        const state = {
            isActive,
            isPaused,
            accumulatedSeconds,
            startTime,
            targetSeconds,
            isCountdown,
            projectId: selectedProjectId,
            description
        };
        localStorage.setItem('focus_timer_state', JSON.stringify(state));

        if (isActive && !isPaused && startTime) {
            countRef.current = setInterval(() => {
                const elapsedSinceStart = Math.floor((Date.now() - startTime) / 1000);
                const totalElapsed = accumulatedSeconds + elapsedSinceStart;

                if (isCountdown) {
                    const remaining = Math.max(0, targetSeconds - totalElapsed);
                    setSeconds(remaining);
                    if (remaining === 0) {
                        handleAutoStop();
                        clearInterval(countRef.current);
                    }
                } else {
                    setSeconds(totalElapsed);
                }
            }, 1000);
        } else {
            clearInterval(countRef.current);
        }
        return () => clearInterval(countRef.current);
    }, [isActive, isPaused, accumulatedSeconds, startTime, targetSeconds, isCountdown, selectedProjectId, description]);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects?status=ACTIVE');
            setProjects(response.data.projects);
        } catch (err) { console.error(err); }
    };

    const handleStart = (duration = 0) => {
        const now = Date.now();
        const countdown = duration > 0;

        setStartTime(now);
        setAccumulatedSeconds(0);
        setTargetSeconds(duration);
        setIsCountdown(countdown);
        setSeconds(countdown ? duration : 0);
        setIsActive(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        if (!isPaused) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setAccumulatedSeconds(accumulatedSeconds + elapsed);
            setIsPaused(true);
        } else {
            setStartTime(Date.now());
            setIsPaused(false);
        }
    };

    const handleStop = async () => {
        if (!selectedProjectId) {
            toast.error('Select a project to log time.');
            return;
        }

        let elapsedTotal = accumulatedSeconds;
        if (isActive && !isPaused && startTime) {
            elapsedTotal += Math.floor((Date.now() - startTime) / 1000);
        }

        const durationMinutes = Math.ceil(elapsedTotal / 60);
        if (durationMinutes === 0) {
            toast.error('Session too short to log.');
            return;
        }

        try {
            await api.post('/time-entries', {
                project_id: selectedProjectId,
                date: new Date().toISOString().split('T')[0],
                duration_minutes: durationMinutes,
                description: description || 'Focus Session Complete',
                is_billable: true
            });
            toast.success(`Logged ${durationMinutes}m to project.`);
            resetTimer();
            if (onTimeLogged) onTimeLogged();
        } catch (err) {
            toast.error('Logging failed');
        }
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setSeconds(0);
        setAccumulatedSeconds(0);
        setTargetSeconds(0);
        setStartTime(null);
        setIsCountdown(false);
        setDescription('');
        localStorage.removeItem('focus_timer_state');
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const mins = parseInt(customValue);
        if (isNaN(mins) || mins <= 0) {
            toast.error('Please enter a valid duration.');
            return;
        }
        handleStart(mins * 60);
        setShowCustomInput(false);
    };

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = isCountdown
        ? (seconds / targetSeconds)
        : (seconds % 3600) / 3600;
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
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Mission: Operational Excellence</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <span className="status-badge" style={{ background: 'rgba(79, 209, 197, 0.1)', color: 'var(--accent-primary)' }}>Focus Mode Active</span>
                    </div>
                </div>

                {!isActive ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <button onClick={() => handleStart(0)} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                            <Play size={20} fill="currentColor" />
                            <span>Ignite Stopbox</span>
                        </button>

                        {showCustomInput ? (
                            <form onSubmit={handleCustomSubmit} className="animate-fade-in" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                <input
                                    type="number"
                                    className="styled-input"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    placeholder="Minutes"
                                    autoFocus
                                    style={{ flex: 1, border: 'none', background: 'transparent' }}
                                />
                                <button type="submit" className="icon-btn" style={{ color: 'var(--accent-primary)' }}><ChevronRight size={18} /></button>
                                <button type="button" onClick={() => setShowCustomInput(false)} className="icon-btn danger"><X size={18} /></button>
                            </form>
                        ) : (
                            <div className="grid-list" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <button className="btn-secondary" onClick={() => handleStart(25 * 60)}>25min</button>
                                <button className="btn-secondary" onClick={() => handleStart(50 * 60)}>50min</button>
                                <button className="btn-secondary" onClick={() => setShowCustomInput(true)}>Custom</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button onClick={handlePause} className="btn-secondary" style={{ flex: 1, padding: '1.25rem' }}>
                            {isPaused ? <Play size={20} /> : <Pause size={20} />}
                            <span>{isPaused ? 'Resume' : 'Pause'}</span>
                        </button>
                        <button onClick={handleStop} className="btn-primary" style={{ flex: 1, padding: '1.25rem', background: '#ef4444', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)' }}>
                            <Square size={20} fill="currentColor" />
                            <span>Stop & Log</span>
                        </button>
                    </div>
                )}

                <div className="card" style={{ marginTop: '2.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                    <div className="form-group">
                        <label className="stats-label" style={{ fontSize: '0.625rem' }}>Select Project</label>
                        <select
                            className="styled-select"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            <option value="" style={{ background: '#0d1117' }}>Choose target project...</option>
                            {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#0d1117' }}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                        <label className="stats-label" style={{ fontSize: '0.625rem' }}>Session Objective</label>
                        <textarea
                            className="styled-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What are we shipping tonight?..."
                            rows="2"
                        />
                    </div>
                </div>

                {isActive && (
                    <button onClick={() => setShowConfirm(true)} className="btn-secondary" style={{ marginTop: '1.5rem', width: '100%', border: 'none', color: '#ef4444' }}>
                        <RotateCcw size={16} />
                        <span>Discard Session</span>
                    </button>
                )}
            </div>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={resetTimer}
                title="Discard Progress?"
                message="This will permanently delete the current tracking session. Are you sure?"
                confirmText="Yes, Discard"
            />
        </div>
    );
};

export default Timer;
