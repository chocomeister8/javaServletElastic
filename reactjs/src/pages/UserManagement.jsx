import React, { useEffect, useState } from "react";
import { Table, Container } from 'react-bootstrap';
import TopNavBar from "../components/TopNavBar";


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch("http://localhost:8080/servletapp/users")
    .then(response => response.json())
    .then(data => {
      setUsers(data);
      setLoading(false); // ✅ You need this!
    })
    .catch(error => {
      console.error("Failed to fetch users:", error);
      setLoading(false); // Even in case of error, stop loading
    });
}, []);


  if (loading) return <p>Loading users...</p>;

  return (
    <>
    <TopNavBar />
    <Container className="mt-4">
      <h2 className="mb-4">User Management</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Password</th>
            <th>Email</th>
            <th>Age</th>
            <th>Date of Birth</th>
            <th>Disabled</th>
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
              <td>{user.isBanned ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
    </>
  );
}

export default UserManagement;
