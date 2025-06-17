import './App.css';
import LoginPage from './pages/Login';
import UserManagement from './pages/UserManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoutes from './components/ProtectedRoutes';

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} />
        {/* Protected Route */}
        <Route path="/users" element={
            <ProtectedRoutes>
              <UserManagement />
            </ProtectedRoutes>
          }/>
        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
