import React from "react";
import axios from "axios";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

const TopNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;  
  const [isAuthenticated, setIsAuthenticated] = useState();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/servletapp/logout",
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem("token");
        setIsAuthenticated(false); // ✅ Update auth state
        navigate("/login");        // ✅ Navigate to login
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path) => currentPath === path;

  const activeStyle = {
    textDecoration: "underline",
    fontWeight: "bold",
    color: "white",
    cursor: "pointer"
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand
          onClick={() => navigate("/home")}
          style={isActive("/home") ? activeStyle : { cursor: "pointer" }}
        >
          ReactServletElastic
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link
            onClick={() => navigate("/users")}
            style={isActive("/users") ? activeStyle : { color: "white" }}
          >
            User Management
          </Nav.Link>
        </Nav>
        <Button variant="outline-light" onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    </Navbar>
  );
};

export default TopNavBar;
