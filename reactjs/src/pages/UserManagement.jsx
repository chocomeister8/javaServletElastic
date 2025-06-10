import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap';
import TopNavbar from '../components/TopNavbar';


function UserList() {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]); // To hold list of users
  const [activeTab, setActiveTab] = useState('usermanagement');

  
  // User form state
  const [user, setUser] = useState({
    name: '',
    password: '',
    email: '',
    dateOfBirth: '',
    age: '',
    status: 'enabled',  // fixed, uneditable
    groups: '',
  });

  // Fetch users on component mount or after user creation
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update user state
    setUser(prev => {
      const updatedUser = { ...prev, [name]: value };

      // If DOB changed, calculate age automatically
      if (name === 'dateOfBirth') {
        updatedUser.age = calculateAge(value);
      }

      return updatedUser;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/createUser', user);

      console.log('User created:', response.data);

      setShowModal(false);
      setUser({
        name: '',
        password: '',
        email: '',
        dateOfBirth: '',
        age: '',
        status: 'enabled',
        groups: '',
      });

      // Refresh user list after creation
      fetchUsers();

    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    }
  };

  return (
    <>
    <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />

    <div className="container mt-4">
      <Button variant="primary" onClick={() => setShowModal(true)}>Create User</Button>

      {/* User table */}
      {users.length > 0 ? (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Age</th>
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
                <td>{u.age}</td>
                <td>{u.dateOfBirth}</td>
                <td>{u.status}</td>
                <td>{u.groups}</td>
                <td>
                  <Button variant="warning" size="sm" disabled>
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formDOB">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={user.dateOfBirth}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAge">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={user.age}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                type="text"
                name="status"
                value={user.status}
                readOnly
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formGroups">
              <Form.Label>Groups</Form.Label>
              <Form.Control
                type="text"
                name="groups"
                value={user.groups}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
    </>
  );
}

export default UserList;
