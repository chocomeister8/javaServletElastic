// TopNavbar.jsx
import React from 'react';
import axios from 'axios';
import { useState, useEffect} from 'react';
import { Navbar, Nav, Container, Button, Modal, Form, Row, Col, ToastContainer, Toast } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function TopNavbar({ activeTab, onTabChange, setName }) {
  const [userName, setUserName] = useState('');
  const [userPassword, setPassword] = useState('');
  const [userGroup, setGroup] = useState('');
  const [userEmail, setEmail] = useState('');
  const [userDOB, setDOB] = useState('');
  const [editedUser, setEditedUser] = useState({}); // Store edited values
  

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleCloseModal = () => setShowProfileModal(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  

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
        setEmail(data.email);
        setDOB(data.dob);
        setPassword(data.password);
        setGroup(data.groups);
        setIsAuthenticated(true);

        // ✅ Pass the name up to parent
        if (typeof setName === 'function') {
          setName(data.name); // ✅ pass it to parent state
        }

        if (data.groups && data.groups.toLowerCase() === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

      } catch (error) {
        setIsAuthenticated(false);
        console.error('Error fetching user info:', error);
      }
    }

    fetchUserName();
  }, [setUserName]);

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
      case 'taskscalendar':
      navigate('/tasks'); // your tasks route
        break;
      default:
        break;
    }
  };

  const handleShowModal = () => {
    setEditedUser({
      name: userName,
      email: userEmail,
      password: userPassword,
      dateOfBirth: userDOB,
      groups: userGroup,
      status: 'enabled', // add if your backend expects it
    });
    setShowProfileModal(true);
  };

  // update user data
  const handleSaveEdit = async () => {
    console.log("handleSaveEdit called");

    try {
      const updatedUser = {
        ...editedUser,
        name: editedUser.name.trim(),
        password: editedUser.password.trim(),
        email: editedUser.email.trim(),
        dateOfBirth: editedUser.dateOfBirth,
        status: editedUser.status.trim() || 'enabled',
        groups: editedUser.groups.trim(),
      };
      
      console.log('Sending update payload:', updatedUser); // Debug

      const response = await axios.put(`http://localhost:8080/servletapp/api/users`, updatedUser, {headers: { 'Content-Type': 'application/json' }, withCredentials: true,});
      console.log('User updated:', response.data);
      
      if (response.status === 200) {
        setEmail(updatedUser.email);
        setPassword(updatedUser.password);
        setDOB(updatedUser.dateOfBirth);
        setShowProfileModal(false);
      } else {
        const data = response.data;
        console.error('Update failed:', data.error);
        setSnackbarMessage(data.error);
        setShowSnackbar(true);
      }
    } catch (error) {
      if (error.response) {
        // Server responded with a status outside 2xx
        console.error('Server response error:', error.response.status, error.response.data);
        setSnackbarMessage(`Error: ${error.response.data.error || 'Failed to update user.'}`);
        setShowSnackbar(true);
      } else if (error.request) {
        // Request was made but no response
        console.error('No response received:', error.request);
        setSnackbarMessage('No response from server. Please check your connection or server status.');
        setShowSnackbar(true);
      } else {
        // Something else caused the error
        console.error('Error setting up request:', error.message);
        setSnackbarMessage(`Request error: ${error.message}`);
        setShowSnackbar(true);
      }
    }
  };

  return (
    <>
    <Navbar bg="dark" variant="dark" fixed="top" expand={false}>
      <Container>
        <Nav className="d-flex flex-row" activeKey={activeTab} onSelect={(handleSelect)}>
          <Nav.Link eventKey="reactjavaelastic" href="#" className="px-3">ReactJavaElastic</Nav.Link>
          {isAdmin && (
          <Nav.Link eventKey="usermanagement" href="#" className="px-3">User Management</Nav.Link>
        )}
          <Nav.Link eventKey="taskscalendar" href="#" className="px-3">Task Calender</Nav.Link>
        </Nav>
        <div className="d-flex align-items-center">
          <span className="text-white me-3" onClick={handleShowModal} style={{ cursor: 'pointer' }}>Hello, {userName}</span>
          <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </Container>
    </Navbar>
    {/* 👇 Profile Modal */}
      <Modal show={showProfileModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-2 align-items-center">
            <Col xs={2}><strong>Name:</strong></Col>
            <Col xs={10}><Form.Control type="text" name="name" value={userName} disabled /></Col>
          </Row>
          <Row className="mb-2 align-items-center">
            <Col xs={2}><strong>Password:</strong></Col>
            <Col xs={10}><Form.Control type="password" name="password" value={editedUser.password || ''} onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })} required/></Col>
          </Row>
          <Row className="mb-2 align-items-center">
            <Col xs={2}><strong>Email:</strong></Col>
            <Col xs={10}><Form.Control type="email" name="email" value={editedUser.email || ''} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} required/></Col>
          </Row>
          <Row className="mb-2 align-items-center">
            <Col xs={2}><strong>DOB:</strong></Col>
            <Col xs={10}><Form.Control type="date" name="dateOfBirth" value={editedUser.dateOfBirth || ''} onChange={(e) => setEditedUser({ ...editedUser, dateOfBirth: e.target.value })} required/></Col>
          </Row>
          <Row className="mb-2 align-items-center">
            <Col xs={2}><strong>Role:</strong></Col>
            <Col xs={10}><Form.Control type="text" name="group" value={userGroup} disabled /></Col>
          </Row>
          <ToastContainer className="p-0" position="bottom-center">
            <Toast onClose={() => setShowSnackbar(false)} show={showSnackbar} delay={2000} autohide bg="danger" style={{ minWidth: '250px' }}>
              <Toast.Header>
                <strong className="me-auto">Error</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{snackbarMessage}</Toast.Body>
            </Toast>
          </ToastContainer>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <div className="d-flex gap-2">
            <Button variant="success" size="sm" onClick={handleSaveEdit}>
                Save
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCloseModal}>
                Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TopNavbar;
