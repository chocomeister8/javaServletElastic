import React from "react";
import axios from 'axios';
import { Navbar, Nav, Container, Button } from "react-bootstrap";

const TopNavBar = ({ onLogout }) => {

const handleLogout = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8080/servletapp/logout",
      {}, // no body needed
      {
        withCredentials: true, // 🔴 ensures the token cookie is sent
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (response.status === 200) {
      localStorage.removeItem("token"); // optional if you stored JWT manually
      window.location.href = "/login"; // redirect
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/home">ReactServletElastic</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/users">User Management</Nav.Link>
          {/* Add more Nav.Links here if needed */}
        </Nav>
        <Button variant="outline-light" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default TopNavBar;
