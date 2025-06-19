import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Alert, Card, Row, Col, FloatingLabel, Toast, ToastContainer} from 'react-bootstrap';
import TopNavbar from '../components/TopNavbar';


function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]); // To hold list of users
  const [activeTab, setActiveTab] = useState('usermanagement');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const [editIndex, setEditIndex] = useState(null); // Index of the row being edited
  const [editedUser, setEditedUser] = useState({}); // Store edited values
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
    
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/servletapp/api/users`);
      console.log('Fetched users:', response.data.users.length);
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
      console.log('Users updated:', response.data.users);
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

  // add user data
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formattedUser = {
        ...user,
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
      await fetchUsers();
      setCreateSuccess(response.data.message);

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditedUser(users[index]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditedUser({});
    setEditError('');
  };

  // update user data
  const handleSaveEdit = async (index) => {
    try {
      const updatedUser = {
        ...editedUser,
        name: editedUser.name.trim(),
        password: editedUser.password.trim(),
        email: editedUser.email.trim(),
        dateOfBirth: editedUser.dateOfBirth,
        status: editedUser.status.trim(),
        groups: editedUser.groups.trim(),
      };

      const response = await axios.put(`http://localhost:8080/servletapp/api/users`, updatedUser, {headers: { 'Content-Type': 'application/json' }, withCredentials: true,});
      console.log('User updated:', response.data);
      
      const updatedUsers = [...users];
      updatedUsers[index] = updatedUser;
      setUsers(updatedUsers);
      await fetchUsers();
      setEditSuccess(response.data.message);

      setEditIndex(null);
      setEditedUser({});
      setEditError('');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update user.';
      console.error('Error updating user:', message);
      setEditError(message);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);

    if (!value.trim()) {
      setFilteredUsers(users); // show all if search is empty
    } else {
      const lowerValue = value.toLowerCase();
      const filtered = users.filter(user =>
        user.name.toLowerCase().startsWith(lowerValue)
      );
      setFilteredUsers(filtered);
    }
  };

  // success and error message timers
  useEffect(() => {
    let timer;

    if (createSuccess) {
      timer = setTimeout(() => {
        setCreateSuccess(null); // Clear success message after delay
      }, 3000); // 3 secs
    }

    return () => clearTimeout(timer);
  }, [createSuccess]);

  useEffect(() => {
    let timer;

    if (editError) {
      timer = setTimeout(() => {
        setEditError(null); // Clear error message after delay
      }, 3000);
    }

    return () => clearTimeout(timer); // Cleanup on unmount or when editError changes
  }, [editError]);

  useEffect(() => {
    let timer;

    if (editSuccess) {
      timer = setTimeout(() => {
        setEditSuccess(null); // Clear success message after delay
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [editSuccess]);

  return (
    <>
    <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />

    <div className="container mt-5">
      <Card className="mt-3 p-3">
        <div>
          <h2>User Management Page</h2>
        </div>
        <Row className="align-items-center">
          <Col md={10} className="mb-1">
            <Form.Control style={{ minWidth: '100%' }} type="text" placeholder="Search by name" onChange={(e) => handleSearch(e.target.value)}/>
          </Col>
          <Col md={2} className="mb-1">
            <Button style={{ minWidth: '100%' }} variant="success" onClick={() => setShowModal(true)}>Create User</Button>
          </Col>
        </Row>
        {/* Show edit success message*/}
        {createSuccess && (
          <Alert variant="success" className="mt-2">
            {createSuccess}
          </Alert>
        )}

        {/* Show edit error message*/}
        {editError && (
          <Alert variant="danger" className="mt-2">
            {editError}
          </Alert>
        )}

        {/* Show edit success message*/}
        {editSuccess && (
          <Alert variant="success" className="mt-2">
            {editSuccess}
          </Alert>
        )}

        {/* User table */}
        {users && users.length > 0 ? (
          <>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Password</th>
                  <th>Email</th>
                  <th>Date of Birth</th>
                  <th>Status</th>
                  <th>Groups</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => (
                  <tr key={u.name}>
                    {editIndex === index ? (
                      <>
                        <td><Form.Control type="text" name="name" value={editedUser.name} onChange={handleEditChange} disabled/></td>
                        <td><Form.Control type="password" name="password" value={editedUser.password} onChange={handleEditChange} /></td>
                        <td><Form.Control type="email" name="email" value={editedUser.email} onChange={handleEditChange} /></td>
                        <td><Form.Control type="date" name="dateOfBirth" value={editedUser.dateOfBirth} onChange={handleEditChange} /></td>
                        <td>
                          <Form.Select name="status" value={editedUser.status} onChange={handleEditChange} disabled={editedUser.name === 'admin'}>
                            <option value="enabled">enabled</option>
                            <option value="disabled">disabled</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Select name="groups" value={editedUser.groups} onChange={handleEditChange} disabled={editedUser.name === 'admin'}>
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </Form.Select>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button variant="success" size="sm" onClick={() => handleSaveEdit(index)}>
                              Save
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => cancelEdit()}>
                              Cancel
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{u.name}</td>
                        <td>{'********'}</td>
                        <td>{u.email}</td>
                        <td>{u.dateOfBirth}</td>
                        <td>{u.status}</td>
                        <td>{u.groups}</td>
                        <td>
                          <Button variant="secondary" size="sm" onClick={() => startEdit(index)}>Edit</Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
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

export default UserManagement;
