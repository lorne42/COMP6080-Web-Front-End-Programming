import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  // State variables to handle form inputs and error messages
  const [name, setName] = useState('');               // User's name
  const [email, setEmail] = useState('');             // User's email
  const [password, setPassword] = useState('');       // User's password
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmation of password
  const [error, setError] = useState('');             // Error message if passwords do not match

  // Handler for registering the user
  const handleRegister = (event) => {
    event.preventDefault();

    // Check if password and confirmation match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Clear error message if passwords match
    setError('');
    console.log('Name:', name);
    console.log('E-mail:', email);
    console.log('Password:', password);

    // Send POST request to register user
    axios.post('http://localhost:5005/admin/auth/register', {
      email: email,
      password: password,
      name: name
    })
      .then((response) => {
        console.log(response);

        // If registration is successful, save token and navigate to dashboard
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/dashboard');
        }
      })
      .catch((error) => {
        console.error('Register failed:', error);
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
      <Typography variant="h4" component="h1">
        Register
      </Typography>
      <TextField
        label="Name"
        helperText="Please enter your name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <TextField
        label="E-mail"
        helperText="Please enter your email"
        id="email-r"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
      />
      <TextField
        label="Password"
        helperText="Please enter your password"
        id="password-r"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
      />
      <TextField
        label="Confirm Password"
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        error={!!error} // Display error style if there is an error message
        helperText={error || "Please confirm your password"} // Show error or confirmation hint
      />
      <Button variant="contained" onClick={handleRegister}>
        Register
      </Button>
    </Box>
  );
}

export default Register;
