import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Failed to authenticate with token', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const register = async (email, password, business_name) => {
        const response = await api.post('/auth/register', { email, password, business_name });
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const updateProfile = (updatedUser) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
