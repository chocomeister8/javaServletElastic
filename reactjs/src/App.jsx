import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Homepage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoutes from './components/ProtectedRoutes';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to="/home" />
              : <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />
        <Route element={<ProtectedRoutes isAuthenticated={isAuthenticated} />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/users" element={<UserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
