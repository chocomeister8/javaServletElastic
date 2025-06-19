// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import TopNavbar from '../components/TopNavbar';

function Homepage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('reactjavaelastic'); // default active tab

  return (
    <>
    <TopNavbar activeTab={activeTab} onTabChange={setActiveTab} />
    <Container className="mt-5">
      <Row className="justify-content-center text-center">
        <Col md={8}>
          <h1>Welcome to ReactJavaElastic!</h1>
          <p className="lead">
            This is your simple homepage. Use the navigation bar to explore the app.
          </p>
        </Col>
      </Row>
    </Container>
    </>
  );
}

export default Homepage;
