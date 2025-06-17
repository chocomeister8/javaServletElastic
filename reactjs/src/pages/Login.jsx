import { useState } from 'react';
import { Form, Button, Card, Alert, FloatingLabel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await fetch('http://localhost:8080/servletapp/api/auth', {method: 'POST',
          headers: {'Content-Type': 'application/json',},
          body: JSON.stringify({name: username,password: password,}), credentials: 'include', // important to send/receive cookies
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Invalid credentials');
          return;
        }

        // Step 2: check user info (including status)
        const userInfoResponse = await fetch('http://localhost:8080/servletapp/api/user-info', {
          method: 'GET',
          credentials: 'include',
        });

        if (!userInfoResponse.ok) {
          const data = await userInfoResponse.json();
          setError(data.message || 'Unable to verify account status');
          return;
        }

        const userData = await userInfoResponse.json();

        onLogin(); // Mark user as logged in in frontend state
        navigate('/home');
    } catch (err) {
        setError('Login failed. Please try again later.');
    }
  };  

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <Card style={{ width: '400px' }} className="shadow">
        <Card.Body>
          <h3 className="text-center mb-4">Login</h3>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleLogin}>
            <FloatingLabel controlId="floatingUsername" label="Username" className="mb-3">
              <Form.Control type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)}/>
            </FloatingLabel>

            <FloatingLabel controlId="floatingPassword" label="Password" className="mb-4">
              <Form.Control type="password" placeholder="Password" required value={password}onChange={(e) => setPassword(e.target.value)}/>
            </FloatingLabel>

            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;
