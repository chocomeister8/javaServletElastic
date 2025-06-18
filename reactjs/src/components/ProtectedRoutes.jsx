// src/components/ProtectedRoutes.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate} from 'react-router-dom';
import axios from 'axios';

axios.defaults.withCredentials = true;

const ProtectedRoutes = ({ children, requiredGroup }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:8080/servletapp/api/user-info');
        // If response is OK and includes name, assume authenticated
        const user = response.data;
        console.log(user);

        if (response.status === 200 && user.name) {
          // ✅ If a group is required and user is not in that group, redirect to home
          if (requiredGroup && user.groups?.toLowerCase() !== requiredGroup.toLowerCase()) {
            navigate('/home');
            return;
          }

          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          navigate('/login');
        }
      } catch (err) {
        setIsAuthenticated(false); // Token invalid, user not authenticated
        navigate('/login');
      }
    };

    checkAuth();
  }, [requiredGroup]);

  if (isAuthenticated === null) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
