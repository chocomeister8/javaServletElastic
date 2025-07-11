import './App.css';
import LoginPage from './pages/Login';
import Homepage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
import TaskCalendar from './pages/TaskCalendar';
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
            <ProtectedRoutes requiredGroup="admin">
              <UserManagement />
            </ProtectedRoutes>
          }/>
        {/* Protected Route */}
        <Route path="/home" element={
            <ProtectedRoutes>
              <Homepage/>
            </ProtectedRoutes>
          }/>
          {/* Protected Route */}
        <Route path="/tasks" element={
            <ProtectedRoutes>
              <TaskCalendar/>
            </ProtectedRoutes>
          }/>
        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
