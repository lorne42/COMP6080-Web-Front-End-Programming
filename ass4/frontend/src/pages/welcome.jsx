import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '@mui/material/Button';
import { useEffect } from 'react';

// Styled component for centering content on the screen
const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px; /* Space between elements */
  height: 100vh; /* Full viewport height */
`;

function Welcome() {
  const navigate = useNavigate();

  // Check if a user token exists to redirect them to the dashboard automatically
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard'); // Redirect to dashboard if logged in
    }
  }, [navigate]);

  return (
    <StyledContainer>
      <h1>Welcome to PRSTO!</h1>
      <div style={{ height: '20px' }}></div> {/* Spacer */}
      
      {/* Register Button */}
      <Button variant="contained" size="medium" onClick={() => navigate('/register')}>
        Register
      </Button>
      
      {/* Login Button */}
      <Button variant="contained" size="medium" onClick={() => navigate('/login')}>
        Login
      </Button>
    </StyledContainer>
  );
}

export default Welcome;
