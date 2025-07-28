import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Members from './components/Members';
import Events from './components/Events';
import Reports from './components/Reports';
import RegistrationForm from './components/RegistrationForm';

function App() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  console.log('App render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public registration form route */}
        <Route path="/register/:formId" element={<RegistrationForm />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          isAuthenticated ? <Layout onLogout={logout}><Dashboard /></Layout> : <Login onLogin={login} />
        } />
        <Route path="/members" element={
          isAuthenticated ? <Layout onLogout={logout}><Members /></Layout> : <Login onLogin={login} />
        } />
        <Route path="/events" element={
          isAuthenticated ? <Layout onLogout={logout}><Events /></Layout> : <Login onLogin={login} />
        } />
        <Route path="/reports" element={
          isAuthenticated ? <Layout onLogout={logout}><Reports /></Layout> : <Login onLogin={login} />
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Login onLogin={login} />} />
      </Routes>
    </Router>
  );
}

export default App;