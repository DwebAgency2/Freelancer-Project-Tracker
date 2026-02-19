import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import ProjectDetail from './pages/Projects/ProjectDetail';
import Invoices from './pages/Invoices/Invoices';
import Clients from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
