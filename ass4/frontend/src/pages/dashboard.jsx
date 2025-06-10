import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Modal, TextField, CardContent, CardMedia } from '@mui/material';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [store, setStore] = useState({ presentations: {} }); // Initialize with an empty presentations object
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for creating a new presentation
  const [newPresentationName, setNewPresentationName] = useState(''); // New presentation name input state
  const token = localStorage.getItem('token'); // Retrieve authentication token

  // Handle presentation selection and navigate to the edit page for that presentation
  const handlePresentationClick = (id) => {
    navigate(`/edit/${id}/1`);
  };

  // Log the user out by clearing the token and navigating to the login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch store data from the server and ensure the response includes a presentations object
  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5005/store', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          // Set the fetched store data or initialize with an empty presentations object if undefined
          const fetchedStore = response.data.store || { presentations: {} };
          setStore(fetchedStore);
        })
        .catch((error) => {
          alert(error.response?.data?.error || 'Failed to fetch store data');
        });
    }
  }, [token, store]);

  // Open the modal to create a new presentation
  const handleNewPresentation = () => {
    setIsModalOpen(true);
  };

  // Create a new presentation, add it to the store, and update the server
  const handleCreatePresentation = () => {
    // Generate the next available presentation ID
    const nextId = (Object.keys(store.presentations || {}).length === 0)
      ? 1
      : Math.max(...Object.keys(store.presentations).map(Number)) + 1;

    // Define a new presentation with default values
    const newPresentation = {
      title: newPresentationName,
      description: '',
      thumbnail: '', // Placeholder or grey square for empty thumbnail
      slides: 1, // Initial slide count
      slidesContent: {
        "1": {} // First slide content, empty object as default
      }
    };

    // Update the store with the new presentation
    const updatedStore = {
      ...store,
      presentations: {
        ...store.presentations,
        [nextId]: newPresentation // Use nextId as the key for the new presentation
      }
    };

    setStore(updatedStore); // Update the local store state
    setIsModalOpen(false); // Close the modal
    setNewPresentationName(''); // Reset the new presentation name input
    updateStoreOnServer(updatedStore); // Send the updated store to the server
  };

  // Function to update the store data on the server
  const updateStoreOnServer = (updatedStore) => {
    axios.put('http://localhost:5005/store',
      { store: updatedStore }, // Send the entire updated store object
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((response) => {
        // Set the updated store or initialize with an empty presentations object if undefined
        setStore(response.data.store || { presentations: {} });
      })
      .catch((error) => {
        alert(error.response ? error.response.data.error : 'Error updating store');
      });
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} p={3}>
      <Typography variant="h4">Dashboard</Typography>
      <Button variant="contained" color="primary" onClick={handleNewPresentation}>
        New Presentation
      </Button>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Logout
      </Button>

      {/* Modal for creating a new presentation */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6">Create New Presentation</Typography>
          <TextField
            label="Presentation Name"
            value={newPresentationName}
            onChange={(e) => setNewPresentationName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" color="primary" onClick={handleCreatePresentation}>
            Create
          </Button>
        </Box>
      </Modal>

      {/* List of presentations */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="center"
        mt={2}
        width="100%"
      >
        {Object.entries(store.presentations || {}).map(([id, presentation]) => (
          <Box
            key={id}
            onClick={() => handlePresentationClick(id)} // Navigate to edit view for the clicked presentation
            sx={{
              width: '100%',
              maxWidth: 400,
              aspectRatio: '2 / 1',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 2,
              borderRadius: 1,
              cursor: 'pointer' // Indicate clickable area with pointer cursor
            }}
          >
            <CardMedia
              component="div"
              sx={{
                backgroundColor: presentation.thumbnail ? 'transparent' : '#ccc', // Grey background if no thumbnail
                width: '100%',
                height: '50%',
              }}
              image={presentation.thumbnail || ''}
              title="Presentation Thumbnail"
            />
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="h6">{presentation.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {presentation.description || ' '}
              </Typography>
              <Typography variant="body2">Slides: {presentation.slides}</Typography>
            </CardContent>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default Dashboard;

