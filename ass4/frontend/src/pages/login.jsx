import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useState } from 'react';
import axios from 'axios';

function Login() {
  // Initialize state variables for email, password, and error messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle login form submission
  const handleLogin = (event) => {
    event.preventDefault();
    setError(''); // Clear previous error messages

    // Send login request to the server
    axios.post('http://localhost:5005/admin/auth/login', {
      email: email,
      password: password,
    })
      .then((response) => {

        // If login is successful, store the token and navigate to the dashboard
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.error('Login failed:', error);
        setError('Login failed. Please try again.'); // Update error message if login fails
      });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      maxWidth={300}
      margin="auto"
      mt={5}
    >
      {/* Page Title */}
      <Typography variant="h4" component="h1">
        Login
      </Typography>
      
      {/* Display error message if there is an error */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Email Input Field */}
      <TextField
        label="E-mail"
        helperText="Please enter your email"
        id="email-l"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      
      {/* Password Input Field */}
      <TextField
        label="Password"
        helperText="Please enter your password"
        id="password-l"
        type="password" // Set input type to password for security
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />

      {/* Login Button */}
      <Button variant="contained" onClick={handleLogin} fullWidth>
        Login
      </Button>
    </Box>
  );
}

export default Login;
