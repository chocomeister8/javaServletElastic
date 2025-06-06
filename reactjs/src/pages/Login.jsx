import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Button, Container, Row, Col, Alert } from "react-bootstrap";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:8080/servletapp/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", data);

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("authenticated", "true");

      setToken(data.token);
      setError("");
      navigate("/home");
    } else {
      setError(data.error || "Unknown error");
    }
  } catch (err) {
    console.error("Login failed with error:", err);
    setError("Login failed. Please try again.");
  }
};

  return (
    <Container className="d-flex vh-100 justify-content-center align-items-center">
      <Row>
        <Col>
          <Card style={{ width: "24rem", padding: "1.5rem" }}>
            <Card.Body>
              <Card.Title className="text-center">Login</Card.Title>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Login
                </Button>

                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginForm;