// TopNavbar.jsx
import React from 'react';
import { useState, useEffect} from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function TopNavbar({ activeTab, onTabChange}) {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    async function fetchUserName() {
      try {
        const response = await fetch('http://localhost:8080/servletapp/api/user-info', {
          method: 'GET',
          credentials: 'include'
        });
        if (!response.ok) {
          setIsAuthenticated(false);
          throw new Error('Failed to fetch user info');

        }
        const data = await response.json(); // <-- Make sure this line exists!
        setUserName(data.name); // save to state
        setIsAuthenticated(true);

      } catch (error) {
        setIsAuthenticated(false);
        console.error('Error fetching user info:', error);
      }
    }

    fetchUserName();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/servletapp/api/auth', {
        method: 'DELETE',
        credentials: 'include',
      });

      // Optionally clear any state or redirect
      navigate('/login'); // or however your routing works
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle navigation when clicking nav links
  const handleSelect = (selectedKey) => {
    if (onTabChange) onTabChange(selectedKey);

    switch (selectedKey) {
      case 'reactjavaelastic':
        navigate('/home'); // or your homepage route
        break;
      case 'usermanagement':
        navigate('/users'); // your user management route
        break;
      default:
        break;
    }
  };

  return (
    <Navbar bg="dark" variant="dark" fixed="top" expand={false}>
      <Container>
        <Nav className="d-flex flex-row" activeKey={activeTab} onSelect={(handleSelect)}>
          <Nav.Link eventKey="reactjavaelastic" href="#" className="px-3">ReactJavaElastic</Nav.Link>
          <Nav.Link eventKey="usermanagement" href="#" className="px-3">UserManagement</Nav.Link>
        </Nav>
        <div className="d-flex align-items-center">
          <span className="text-white me-3">Hello, {userName}</span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
