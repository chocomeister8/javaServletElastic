// TopNavbar.jsx
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

function TopNavbar({ activeTab, onTabChange }) {
  return (
    <Navbar bg="dark" variant="dark" fixed="top" expand={false}>
      <Container>
        <Nav className="d-flex flex-row" activeKey={activeTab} onSelect={(selectedKey) => onTabChange(selectedKey)}>
          <Nav.Link eventKey="reactjavaelastic" href="#" className="px-3">ReactJavaElastic</Nav.Link>
          <Nav.Link eventKey="usermanagement" href="#" className="px-3">UserManagement</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default TopNavbar;
