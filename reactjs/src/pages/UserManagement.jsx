import React, { useEffect, useState } from "react";
import { Modal, Button, Form, FloatingLabel, Container, Table} from 'react-bootstrap';
import TopNavBar from "../components/TopNavBar";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    email: '',
    age: '',
    dateOfBirth: '',
    status: "Active",
    groups: ''
  });

  useEffect(() => {
    fetch("http://localhost:8080/servletapp/users")
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token"); // or however you store it

  const response = await fetch("http://localhost:8080/servletapp/createUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, // <-- Required by your backend
    },
    body: JSON.stringify(formData),
  });

  if (response.ok) {
    const newUser = await response.json();
    setUsers(prev => [...prev, newUser]);
    setShowModal(false);
    setFormData({
      name: '',
      password: '',
      email: '',
      age: '',
      dateOfBirth: '',
      status: "Active",
      groups: ''
    });
  } else {
    const errorData = await response.json();
    alert(`Failed to create user: ${errorData.error}`);
  }
};


  if (loading) return <p>Loading users...</p>;

  return (
    <>
      <TopNavBar />
      <Container className="mt-4 pt-3">
        <div className="border p-4 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>User Management</h2>
          <Button variant="success" onClick={() => setShowModal(true)}>Create User</Button>
        </div>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Password</th>
              <th>Email</th>
              <th>Age</th>
              <th>Date of Birth</th>
              <th>Status</th>
              <th>Groups</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index}>
                <td>{user.name}</td>
                <td>{user.password}</td>
                <td>{user.email}</td>
                <td>{user.age}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.status ? "Active" : "Disabled"}</td>
                <td>{user.groups}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </Container>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} scrollable={false} centered dialogClassName="no-scroll-modal">
        <Modal.Header closeButton>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="d-flex gap-3 mb-3">
              <FloatingLabel controlId="formName" label="Name" className="w-50">
                <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </FloatingLabel>
              <FloatingLabel controlId="formPassword" label="Password" className="w-50">
                <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} required />
              </FloatingLabel>
            </div>
            <div className="d-flex gap-3 mb-3">
              <FloatingLabel controlId="formEmail" label="Email" className="w-50">
                <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </FloatingLabel>
              <FloatingLabel controlId="formAge" label="Age" className="w-50">
                <Form.Control type="number" name="age" value={formData.age} onChange={handleInputChange} required />
              </FloatingLabel>
            </div>
            <div className="d-flex gap-3 mb-3">
              <FloatingLabel controlId="formDob" label="Date of Birth" className="w-50">
                <Form.Control type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
              </FloatingLabel>
              <FloatingLabel controlId="formIsBanned" label="Status" className="w-50">
                <Form.Select name="Status" value={formData.status ? "Disabled" : "Active"} onChange={(e) =>
                  setFormData(prev => ({
                    ...prev,
                    isBanned: e.target.value === "Disabled"
                  }))
                }>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </Form.Select>
              </FloatingLabel>
            </div>
            <FloatingLabel controlId="formGroups" label="Groups" className="mb-3">
              <Form.Control type="text" name="groups" value={formData.groups} onChange={handleInputChange} />
            </FloatingLabel>

            <div className="d-flex justify-content-center gap-2 mt-4">
              <Button variant="success" type="submit">
                Create
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserManagement;
