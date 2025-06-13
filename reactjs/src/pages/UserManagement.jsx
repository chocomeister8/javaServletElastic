import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Alert, Card, Row, Col, FloatingLabel, Toast, ToastContainer} from 'react-bootstrap';
import TopNavbar from '../components/TopNavbar';


function UserList() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]); // To hold list of users
  const [activeTab, setActiveTab] = useState('usermanagement');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
    
  // User form state
  const [user, setUser] = useState({
    name: '',
    password: '',
    email: '',
    dateOfBirth: '',
    status: 'enabled',  // fixed, uneditable
    groups: '',
  });

  // Fetch users on component mount or after user creation
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    console.log('fetchUsers called with page:', page);
    try {
      const response = await axios.get(`http://localhost:8080/servletapp/api/users?page=${page}&size=8`);
      console.log('Fetched users:', response.data.users.length);
      setUsers(response.data.users);
      console.log('Users updated:', response.data.users);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page); // 👈 Add this line
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update user state
    setUser(prev => {
      const updatedUser = { ...prev, [name]: value };

      return updatedUser;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedUser = {
        ...user,
        // Remove age, calculate on backend
        // Optionally trim fields if needed
        name: user.name.trim(),
        password: user.password,
        email: user.email.trim(),
        dateOfBirth: user.dateOfBirth,
        status: user.status || 'enabled',
        groups: user.groups,
      };
      console.log('Submitting user:', user);
      const response = await axios.post('http://localhost:8080/servletapp/api/users',formattedUser,{headers: {'Content-Type': 'application/json',},withCredentials: true,});
      console.log('User created:', response.data);
      console.log('Fetching users after creation');
      await fetchUsers(currentPage);

      setShowModal(false);
      setUser({
        name: '',
        password: '',
        email: '',
        dateOfBirth: '',
        status: 'enabled',
        groups: '',
      });

    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      setSnackbarMessage(error.response?.data?.error || 'Failed to create user. Please try again.');
      setShowSnackbar(true);
    }
  };

  return (
    <>
    <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />

    <div className="container mt-4">
      <Card className="mt-3 p-3">
        <Button variant="success" onClick={() => setShowModal(true)}>Create User</Button>
        {/* User table */}
        {users && users.length > 0 ? (
          <>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date of Birth</th>
                <th>Status</th>
                <th>Groups</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.dateOfBirth}</td>
                  <td>{u.status}</td>
                  <td>{u.groups}</td>
                  <td>
                    <Button variant="secondary" size="sm" >Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && (
            <div className="d-flex justify-content-center my-3">
              {Array.from({ length: totalPages }, (_, index) => (
                <Button
                  key={index + 1}
                  onClick={() => fetchUsers(index + 1)}
                  variant={currentPage === index + 1 ? "secondary" : "outline-secondary"}
                  className="mx-1"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          )}
          </>
        ) : (
          <Alert variant="info" className="mt-3">
            No data yet.
          </Alert>
        )}

        {/* Create User Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>

          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row className="mb-2">
                <Col md={6}>
                  <FloatingLabel controlId="formName" label="Name">
                    <Form.Control type="text" name="name" value={user.name} onChange={handleChange} placeholder="Name" required/>
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel controlId="formPassword" label="Password">
                    <Form.Control type="password" name="password" value={user.password} onChange={handleChange} placeholder="Password" required/>
                  </FloatingLabel>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={6}>
                  <FloatingLabel controlId="formEmail" label="Email">
                    <Form.Control type="email" name="email" value={user.email} onChange={handleChange} placeholder="Email" required/>
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel controlId="formDOB" label="Date of Birth">
                    <Form.Control type="date" name="dateOfBirth" value={user.dateOfBirth} onChange={handleChange} max={new Date().toISOString().split('T')[0]} onKeyDown={(e) => e.preventDefault()} placeholder="Date of Birth" required/>
                  </FloatingLabel>
                </Col>
              </Row>

              <Row className="mb-2">
                <Col md={6}>
                  <FloatingLabel controlId="formStatus" label="Status">
                    <Form.Control type="text" name="status" value={user.status} readOnly placeholder="Status"/>
                  </FloatingLabel>
                </Col>
                <Col md={6}>
                  <FloatingLabel controlId="formGroups" label="Groups">
                    <Form.Select name="groups" value={user.groups} onChange={handleChange} aria-label="Select group">
                      <option value="">Select group</option>
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </FloatingLabel>
                </Col>
              </Row>
              <ToastContainer className="p-0" position="bottom-center">
                <Toast
                  onClose={() => setShowSnackbar(false)}
                  show={showSnackbar}
                  delay={3000}
                  autohide
                  bg="danger"
                  style={{ minWidth: '250px' }}
                >
                  <Toast.Header>
                    <strong className="me-auto">Error</strong>
                  </Toast.Header>
                  <Toast.Body className="text-white">{snackbarMessage}</Toast.Body>
                </Toast>
              </ToastContainer>
            </Modal.Body>

            <Modal.Footer className="justify-content-center">
              <Button type="submit" variant="success">Create</Button>
              <Button variant="danger" onClick={() => setShowModal(false)}>Cancel</Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Card>
    </div>
    </>
  );
}

export default UserList;
