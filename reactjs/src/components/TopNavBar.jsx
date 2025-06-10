// TopNavbar.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

function TopNavbar({ activeTab, onTabChange }) {
  return (
    <Navbar bg="dark" variant="dark" fixed="top" expand="lg">
      <Container>
        <Nav className="me-auto" activeKey={activeTab} onSelect={(selectedKey) => onTabChange(selectedKey)}>
          <Nav.Link eventKey="reactjavaelastic" href="#">ReactJavaElastic</Nav.Link>
          <Nav.Link eventKey="usermanagement" href="#">UserManagement</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
