import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, TextField, IconButton, Input, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { HexColorPicker } from "react-colorful";
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import { Slider } from '@mui/material';
import Highlight from 'react-syntax-highlighter';

function EditPresentation() {
  const { id, slideNumber } = useParams(); // Retrieve presentation ID from URL
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null); // Stores presentation data
  const [currentSlide, setCurrentSlide] = useState(1); // Current slide number
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false); // Controls the title edit modal state
  const [newTitle, setNewTitle] = useState(''); // Stores new title after editing
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Controls delete confirmation modal state
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // Controls error modal state
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [textSize, setTextSize] = useState(100);
  const [fontSize, setFontSize] = useState(1);
  const [textColor, setTextColor] = useState("#000000");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [editingTextIndex, setEditingTextIndex] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSize, setImageSize] = useState(100);
  const [imageUrl, setImageUrl] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [editingImageIndex, setEditingImageIndex] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [videoSize, setVideoSize] = useState(100);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAutoPlay, setVideoAutoPlay] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);
  const [codeSize, setCodeSize] = useState(100);
  const [codeContent, setCodeContent] = useState('');
  const [codeFontSize, setCodeFontSize] = useState(1);
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [editingCodeIndex, setEditingCodeIndex] = useState(null);
  const [globalFontFamily, setGlobalFontFamily] = useState('Arial'); // Default font family
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);
  const [backgroundStyle, setBackgroundStyle] = useState('solid');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [gradientStartColor, setGradientStartColor] = useState('#ffffff');
  const [gradientEndColor, setGradientEndColor] = useState('#000000');
  const [gradientDirection, setGradientDirection] = useState('to bottom');
  const [backgroundImage, setBackgroundImage] = useState(null);

  // Encapsulated function to get store data
  const getStore = () => {
    return axios.get('http://localhost:5005/store', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(response => response.data.store || { presentations: {} });
  };

  // Initialize presentation data
  useEffect(() => {
    getStore()
      .then((store) => {
        setPresentation(store.presentations[id]);
        setNewTitle(store.presentations[id]?.title || ''); // Initialize input box content in the title edit modal
        setGlobalFontFamily(store.presentations[id]?.globalFontFamily || 'Arial'); // Load font setting
      })
      .catch((error) => {
        alert(error.response?.data?.error || 'Failed to fetch presentation data');
      });
  }, [id]);

  // Keyboard navigation control for slides
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        nextSlide();
      } else if (event.key === 'ArrowLeft') {
        prevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, presentation]);

  // Check slideNumber parameter in URL
  useEffect(() => {
    if (slideNumber) {
      setCurrentSlide(Number(slideNumber));
    }
  }, [slideNumber]);

  const goToSlide = (slide) => {
    navigate(`/edit/${id}/${slide}`); // Update URL
    setCurrentSlide(slide); // Update current slide state
  };

  // Navigate to the previous slide
  const prevSlide = () => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Navigate to the next slide
  const nextSlide = () => {
    if (currentSlide < Object.keys(presentation?.slidesContent || {}).length) {
      goToSlide(currentSlide + 1);
      setCurrentSlide(currentSlide + 1);
    }
  };

  // Create a new slide
  const addSlide = () => {
    if (presentation) {
      const slideNumber = Object.keys(presentation.slidesContent).length + 1;
      const updatedPresentation = {
        ...presentation,
        slidesContent: {
          ...presentation.slidesContent,
          [slideNumber]: {} // Create a new empty slide
        },
        slides: slideNumber
      };
      savePresentation(updatedPresentation); // Save the updated presentation
      setCurrentSlide(slideNumber); // Navigate to the newly created slide
    }
  };

  const handlePreview = () => {
    navigate(`/preview/${id}/${currentSlide}`);
  };

  const deleteCurrentSlide = () => {
    const slideCount = Object.keys(presentation.slidesContent).length;

    if (slideCount === 1) {
      setIsErrorModalOpen(true); // Show error modal
      return;
    }

    const updatedSlidesContent = { ...presentation.slidesContent };
    delete updatedSlidesContent[currentSlide]; // Delete current slide
    const reorderedSlides = Object.values(updatedSlidesContent).reduce((acc, slide, index) => {
      acc[index + 1] = slide;
      return acc;
    }, {});

    const updatedPresentation = {
      ...presentation,
      slidesContent: reorderedSlides,
      slides: slideCount - 1
    };

    setCurrentSlide(currentSlide > 1 ? currentSlide - 1 : 1); // Navigate to the previous slide
    savePresentation(updatedPresentation);
  };

  // Save presentation updates
  const savePresentation = (updatedPresentation) => {
    getStore()
      .then((store) => {
        store.presentations[id] = updatedPresentation;

        return axios.put('http://localhost:5005/store', { store }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      })
      .then(() => {
        setPresentation(updatedPresentation); // Update local state
      })
      .catch((error) => {
        alert(error.response?.data?.error || 'Failed to update presentation');
      });
  };

  // Function to delete the current presentation
  const handleDeletePresentation = () => {
    getStore()
      .then((store) => {
        if (store.presentations[id]) {
          delete store.presentations[id]; // Remove the specified presentation from the store
        } else {
          alert("Presentation not found");
          setIsDeleteModalOpen(false);
          return Promise.reject("Presentation not found"); // Exit the promise chain
        }

        return axios.put('http://localhost:5005/store', { store }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      })
      .then(() => {
        navigate('/'); // Redirect to Dashboard after successful deletion
      })
      .catch((error) => {
        if (error !== "Presentation not found") {
          alert(error.response?.data?.error || 'Failed to delete presentation');
        }
      });
  };

  // Font change handler
  const handleFontChange = (event) => {
    const selectedFont = event.target.value;
    setGlobalFontFamily(selectedFont);

    // Update global font in `presentation`
    const updatedPresentation = {
      ...presentation,
      globalFontFamily: selectedFont
    };

    savePresentation(updatedPresentation); // Save to backend
  };

  // Upload and update thumbnail
  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const updatedPresentation = { ...presentation, thumbnail: reader.result };
        savePresentation(updatedPresentation); // Save the updated presentation with new thumbnail
      };
      reader.readAsDataURL(file); // Convert file to base64 format
    }
  };

  // Add a new text box
  const addTextBox = () => {
    setIsTextModalOpen(true);
    setNewText('');
    setTextSize(100);
    setFontSize(1);
    setTextColor("#000000");
    setPosition({ x: 0, y: 0 });
    setEditingTextIndex(null);
  };

  // Background image upload handler
  const handleBgimageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save the new or edited text box
  const saveTextBox = () => {
    const newElement = {
      type: 'text',
      content: newText,
      size: textSize, // Set the size constraint
      fontSize,
      color: textColor,
      position // Set position constraints
    };

    const updatedSlidesContent = { ...presentation.slidesContent };
    const slideElements = updatedSlidesContent[currentSlide].elements || [];
    if (editingTextIndex !== null) {
      slideElements[editingTextIndex] = newElement; // Edit existing element
    } else {
      slideElements.push(newElement); // Add new element
    }
    updatedSlidesContent[currentSlide].elements = slideElements;

    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };
    savePresentation(updatedPresentation);
    setIsTextModalOpen(false);
  };

  // Handle double-click on text element to edit
  const handleDoubleClick = (index) => {
    const element = presentation.slidesContent[currentSlide].elements[index];
    setNewText(element.content);
    setTextSize(element.size);
    setFontSize(element.fontSize);
    setTextColor(element.color);
    setPosition(element.position);
    setEditingTextIndex(index);
    setIsTextModalOpen(true);
  };

  // Delete an element from the slide
  const handleDelete = (index) => {
    const updatedSlidesContent = { ...presentation.slidesContent };
    updatedSlidesContent[currentSlide].elements.splice(index, 1);
    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };
    savePresentation(updatedPresentation);
  };

  // Add an image
  const addImage = () => {
    setIsImageModalOpen(true);
    setImageSize(100);
    setImageUrl('');
    setImageDescription('');
    setEditingImageIndex(null);
  };

  // Image upload handler
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Save background settings
  const saveBackground = () => {
    const newBackground = {
      style: backgroundStyle,
      color: solidColor,
      gradient: {
        start: gradientStartColor,
        end: gradientEndColor,
        direction: gradientDirection
      },
      image: backgroundImage
    };

    const updatedSlidesContent = { ...presentation.slidesContent };
    updatedSlidesContent[currentSlide].background = newBackground;

    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };

    savePresentation(updatedPresentation); // Save to backend
    setIsBackgroundModalOpen(false);
  };

  // Save the new or edited image
  const saveImage = () => {
    const newImage = {
      type: 'image',
      url: imageUrl,
      description: imageDescription,
      size: imageSize,
      position,
    };

    const updatedSlidesContent = { ...presentation.slidesContent };
    const slideElements = updatedSlidesContent[currentSlide].elements || [];
    if (editingImageIndex !== null) {
      slideElements[editingImageIndex] = newImage;
    } else {
      slideElements.push(newImage);
    }
    updatedSlidesContent[currentSlide].elements = slideElements;

    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };
    savePresentation(updatedPresentation);
    setIsImageModalOpen(false);
  };

  // Handle double-click on image to edit
  const handleImageDoubleClick = (index) => {
    const element = presentation.slidesContent[currentSlide].elements[index];
    setImageUrl(element.url);
    setImageDescription(element.description);
    setImageSize(element.size);
    setPosition(element.position);
    setEditingImageIndex(index);
    setIsImageModalOpen(true);
  };

  // Add a video
  const addVideo = () => {
    setIsVideoModalOpen(true);
    setVideoSize(100);
    setVideoUrl('');
    setVideoAutoPlay(false);
  };

  const handleVideoDoubleClick = (index) => {
    // Set the index of the currently editing video element
    setEditingVideoIndex(index);

    // Retrieve the video block properties from the current slide
    const element = presentation?.slidesContent?.[currentSlide]?.elements?.[index];

    if (element && element.type === 'video') {
      // Load the video block properties into state to display in the modal
      setVideoUrl(element.url || '');
      setVideoSize(element.size || 100); // Default size is 100%
      setVideoAutoPlay(element.autoplay || false); // Autoplay default is false

      // Open the video edit modal
      setIsVideoModalOpen(true);
    } else {
      console.error("The selected element is not a video block or doesn't exist.");
    }
  };

  const saveVideo = () => {
    const newVideo = {
      type: 'video',
      url: videoUrl,
      autoplay: videoAutoPlay,
      size: videoSize,
    };

    const updatedSlidesContent = { ...presentation.slidesContent };
    const slideElements = updatedSlidesContent[currentSlide].elements || [];

    if (editingVideoIndex !== null) {
      // Edit mode: update the existing video block
      slideElements[editingVideoIndex] = newVideo;
    } else {
      // Add mode: add a new video block
      slideElements.push(newVideo);
    }

    updatedSlidesContent[currentSlide].elements = slideElements;

    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };

    savePresentation(updatedPresentation); // Save the updated presentation
    setIsVideoModalOpen(false); // Close the modal
    setEditingVideoIndex(null); // Reset the editing index
  };

  // Function to add a new code block
  const addCodeBlock = () => {
    setIsCodeModalOpen(true);
    setCodeSize(100);
    setCodeContent('');
    setCodeFontSize(1);
    setCodeLanguage('javascript');
  };

  const handleCodeDoubleClick = (index) => {
    // Set the index of the currently editing code element
    setEditingCodeIndex(index);

    // Retrieve the code block properties from the current slide
    const element = presentation?.slidesContent?.[currentSlide]?.elements?.[index];

    if (element && element.type === 'code') {
      // Set code block properties into corresponding state variables
      setCodeContent(element.content || '');
      setCodeFontSize(element.fontSize || 1); // Default font size is 1em
      setCodeLanguage(element.language || 'javascript'); // Default language is 'javascript'
      setCodeSize(element.size || 100); // Default size is 100%

      // Open the code block edit modal
      setIsCodeModalOpen(true);
    } else {
      console.error("The selected element is not a code block or doesn't exist.");
    }
  };

  // Function to save the code block
  const saveCodeBlock = () => {
    const newCodeBlock = {
      type: 'code',
      content: codeContent,
      fontSize: codeFontSize,
      language: codeLanguage,
      size: codeSize,
      position,
    };

    // Copy current slide content
    const updatedSlidesContent = { ...presentation.slidesContent };
    const slideElements = updatedSlidesContent[currentSlide].elements || [];

    if (editingCodeIndex !== null) {
      // If in edit mode, update the existing code block
      slideElements[editingCodeIndex] = newCodeBlock;
    } else {
      // If in add mode, add a new code block
      slideElements.push(newCodeBlock);
    }

    // Update the elements of the current slide
    updatedSlidesContent[currentSlide].elements = slideElements;

    // Update the entire presentation content
    const updatedPresentation = {
      ...presentation,
      slidesContent: updatedSlidesContent,
    };

    savePresentation(updatedPresentation); // Save the updated presentation
    setIsCodeModalOpen(false); // Close the code block edit modal
    setEditingCodeIndex(null); // Reset the editing index
  };


  return (
    <Box display="flex" height="100vh" bgcolor="#f2f4f6">
      {/* Sidebar */}
      <Box width="260px" bgcolor="#ffffff" display="flex" flexDirection="column" alignItems="center" p={3} boxShadow={3} borderRight="1px solid #e0e0e0">
        <Button variant="contained" color="primary" onClick={() => navigate('/')} sx={{ mb: 3 }}>
          Back to Dashboard
        </Button>

        <Button variant="contained" color="primary" onClick={() => setIsBackgroundModalOpen(true)}>
          Change Background
        </Button>
        <Modal open={isBackgroundModalOpen} onClose={() => setIsBackgroundModalOpen(false)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', p: 4, bgcolor: 'background.paper', borderRadius: 1, width: 300, mx: 'auto', my: '20%' }}>
            <Typography variant="h6">Set Background</Typography>

            {/* Background Style Selector */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Background Style</InputLabel>
              <Select value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}>
                <MenuItem value="solid">Solid Colour</MenuItem>
                <MenuItem value="gradient">Gradient</MenuItem>
                <MenuItem value="image">Image</MenuItem>
              </Select>
            </FormControl>

            {/* Display different options based on the selected background style */}
            {backgroundStyle === 'solid' && (
              <Box my={2}>
                <Typography>Choose Colour</Typography>
                <HexColorPicker color={solidColor} onChange={setSolidColor} />
              </Box>
            )}

            {backgroundStyle === 'gradient' && (
              <Box my={2}>
                <Typography>Choose Gradient Colors</Typography>
                <HexColorPicker color={gradientStartColor} onChange={setGradientStartColor} />
                <HexColorPicker color={gradientEndColor} onChange={setGradientEndColor} />
                <Typography>Direction</Typography>
                <Select value={gradientDirection} onChange={(e) => setGradientDirection(e.target.value)}>
                  <MenuItem value="to bottom">Top to Bottom</MenuItem>
                  <MenuItem value="to right">Left to Right</MenuItem>
                  <MenuItem value="to top right">Diagonal</MenuItem>
                </Select>
              </Box>
            )}

            {backgroundStyle === 'image' && (
              <Box my={2}>
                <Typography>Upload Background Image</Typography>
                <Button variant="contained" component="label">
                  Upload Bgimage
                  <input type="file" hidden onChange={handleBgimageUpload} />
                </Button>
              </Box>
            )}

            <Button variant="contained" color="primary" onClick={saveBackground} sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        </Modal>

        <Button variant="contained" color="primary" onClick={handlePreview}>
          Preview Presentation
        </Button>

        {/* Add Text Box Button */}
        <Button variant="contained" color="secondary" onClick={addTextBox} sx={{ mb: 2 }}>
          Add Text Box
        </Button>

        {/* Add Image Button */}
        <Button variant="contained" color="secondary" onClick={addImage} sx={{ mb: 2 }}>
          Add Image
        </Button>
        <Button variant="contained" color="secondary" onClick={addVideo} sx={{ mt: 2 }}>
          Add Video
        </Button>
        <Button variant="contained" color="secondary" onClick={addCodeBlock} sx={{ mt: 2 }}>
          Add Code Block
        </Button>

        <Box display="flex" flexDirection="column" alignItems="center" p={2}>
          <Typography variant="h6">Choose Font Family</Typography>
          <Select value={globalFontFamily} onChange={handleFontChange} fullWidth>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
            <MenuItem value="Courier New">Courier New</MenuItem>
          </Select>
        </Box>

        {/* Video Modal */}
        <Modal open={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', p: 4, bgcolor: 'background.paper', borderRadius: 1, width: 300, mx: 'auto', my: '20%' }}>
            <Typography variant="h6">Add / Edit Video</Typography>
            <TextField label="Video URL" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} fullWidth margin="normal" />
            <Typography variant="body2">Video Size (%)</Typography>
            <Slider value={videoSize} onChange={(e, value) => setVideoSize(value)} max={100} min={0} valueLabelDisplay="auto" />
            <Typography variant="body2">Autoplay</Typography>
            <Button variant="contained" onClick={() => setVideoAutoPlay(!videoAutoPlay)}>
              {videoAutoPlay ? "Disable Autoplay" : "Enable Autoplay"}
            </Button>
            <Button variant="contained" color="primary" onClick={saveVideo} sx={{ mt: 2 }}>Save</Button>
          </Box>
        </Modal>

        {/* Code Block Modal */}
        <Modal open={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', p: 4, bgcolor: 'background.paper', borderRadius: 1, width: 300, mx: 'auto', my: '20%' }}>
            <Typography variant="h6">Add / Edit Code Block</Typography>
            <TextField label="Code Content" value={codeContent} onChange={(e) => setCodeContent(e.target.value)} fullWidth margin="normal" multiline rows={4} />
            <Typography variant="body2">Font Size (em)</Typography>
            <Slider value={codeFontSize} onChange={(e, value) => setCodeFontSize(value)} max={3} min={0.5} step={0.1} valueLabelDisplay="auto" />
            <TextField label="Language" value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} fullWidth margin="normal" />
            <Typography variant="body2">Code Block Size (%)</Typography>
            <Slider value={codeSize} onChange={(e, value) => setCodeSize(value)} max={100} min={0} valueLabelDisplay="auto" />
            <Button variant="contained" color="primary" onClick={saveCodeBlock} sx={{ mt: 2 }}>Save</Button>
          </Box>
        </Modal>

        {/* Image Modal */}
        <Modal open={isImageModalOpen} onClose={() => setIsImageModalOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 24,
              width: 300,
              mx: 'auto',
              my: '20%',
            }}
          >
            <Typography variant="h6">Add / Edit Image</Typography>
            <TextField
              label="Image Size (%)"
              type="number"
              value={imageSize}
              onChange={(e) => setImageSize(Math.min(Math.max(e.target.value, 0), 100))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" component="label" fullWidth>
              Upload Image
              <Input type="file" hidden onChange={handleImageUpload} />
            </Button>
            <TextField
              label="Description (alt text)"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Typography variant="body2" mt={2}>Position (x, y) (%)</Typography>
            <Slider
              value={position.x}
              onChange={(e, value) => setPosition({ ...position, x: value })}
              aria-labelledby="x-position"
              max={100}
              min={0}
              valueLabelDisplay="auto"
            />
            <Slider
              value={position.y}
              onChange={(e, value) => setPosition({ ...position, y: value })}
              aria-labelledby="y-position"
              max={100}
              min={0}
              valueLabelDisplay="auto"
            />
            <Button variant="contained" color="primary" onClick={saveImage} sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        </Modal>

        {/* Modal for adding/editing text box */}
        <Modal open={isTextModalOpen} onClose={() => setIsTextModalOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 24,
              width: 300,
              mx: 'auto',
              my: '10%',
            }}
          >
            <Typography variant="h6">Add / Edit Text Box</Typography>
            <TextField
              label="Text Content"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Text Size (%)"
              type="number"
              value={textSize}
              onChange={(e) => setTextSize(Math.min(Math.max(e.target.value, 0), 100))}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Font Size (em)"
              type="number"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              fullWidth
              margin="normal"
            />
            <HexColorPicker color={textColor} onChange={setTextColor} />
            <Typography variant="body2" mt={2}>Select Color</Typography>
            <Box mt={2}>
              <Typography variant="body2">Position (x, y) (%)</Typography>
              <Slider
                value={position.x}
                onChange={(e, value) => setPosition({ ...position, x: value })}
                aria-labelledby="x-position"
                max={100}
                min={0}
                valueLabelDisplay="auto"
              />
              <Slider
                value={position.y}
                onChange={(e, value) => setPosition({ ...position, y: value })}
                aria-labelledby="y-position"
                max={100}
                min={0}
                valueLabelDisplay="auto"
              />
            </Box>
            <Button variant="contained" color="primary" onClick={saveTextBox} sx={{ mt: 2 }}>
              Save
            </Button>
          </Box>
        </Modal>

        {/* Update Thumbnail Button */}
        <Button variant="contained" component="label" sx={{ mb: 2 }}>
          Update Thumbnail
          <Input type="file" hidden onChange={handleThumbnailChange} />
        </Button>

        {/* Display Thumbnail */}
        {presentation?.thumbnail && (
          <Box mt={2} border="1px solid #ccc" borderRadius="4px" p={1} bgcolor="#fafafa">
            <img src={presentation.thumbnail} alt="Thumbnail" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '4px' }} />
          </Box>
        )}

        {/* Delete Presentation Button */}
        <Button variant="contained" color="error" onClick={() => setIsDeleteModalOpen(true)} sx={{ mt: 2 }}>
          Delete Presentation
        </Button>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 24,
            width: 300,
            mx: 'auto',
            my: '20%'
          }}
        >
          <Typography variant="h6">Are you sure you want to delete this presentation?</Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button variant="contained" color="error" onClick={handleDeletePresentation}>
              Yes
            </Button>
            <Button variant="contained" onClick={() => setIsDeleteModalOpen(false)}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Main Editing Area */}
      <Box flex="1" display="flex" flexDirection="column" alignItems="center" p={3} bgcolor="#ffffff">
        {/* Title and Edit Button */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Typography variant="h4" fontWeight="bold">{presentation?.title}</Typography>
          <IconButton onClick={() => setIsTitleModalOpen(true)}>
            <EditIcon />
          </IconButton>
        </Box>
        {/* Edit Title Modal */}
        <Modal open={isTitleModalOpen} onClose={() => setIsTitleModalOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 24,
              width: 300,
              mx: 'auto',
              my: '20%'
            }}
          >
            <Typography variant="h6">Edit Title</Typography>
            <TextField
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={() => {
              setPresentation({ ...presentation, title: newTitle });
              setIsTitleModalOpen(false);
              savePresentation({ ...presentation, title: newTitle });
            }}>
              Save
            </Button>
          </Box>
        </Modal>

        {/* Error Modal */}
        <Modal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 24,
              width: 300,
              mx: 'auto',
              my: '20%'
            }}
          >
            <Typography variant="h6">Cannot delete the only slide in the presentation.</Typography>
            <Typography variant="body2" color="text.secondary" mt={2}>
              Please delete the presentation instead.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => setIsErrorModalOpen(false)} sx={{ mt: 2 }}>
              OK
            </Button>
          </Box>
        </Modal>

        {/* Slide area to display elements */}
        <Box position="relative" width="100%" height="900px" bgcolor="#f9f9f9" borderRadius="8px" display="flex" justifyContent="center" alignItems="center" boxShadow={1} border="1px solid #ddd"
          sx={{
            backgroundColor: presentation?.slidesContent?.[currentSlide]?.background?.style === 'solid'
              ? presentation.slidesContent[currentSlide].background.color
              : 'transparent',
            backgroundImage: presentation?.slidesContent?.[currentSlide]?.background?.style === 'gradient'
              ? `linear-gradient(${presentation.slidesContent[currentSlide].background.gradient.direction}, ${presentation.slidesContent[currentSlide].background.gradient.start}, ${presentation.slidesContent[currentSlide].background.gradient.end})`
              : presentation?.slidesContent?.[currentSlide]?.background?.style === 'image'
                ? `url(${presentation.slidesContent[currentSlide].background.image})`
                : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {presentation?.slidesContent[currentSlide]?.elements?.map((element, index) =>
            element.type === 'text' ? (
              // Text Element
              <Box
                key={index}
                position="absolute"
                top={`${element.position.y}%`}
                left={`${element.position.x}%`}
                width={`${element.size}%`}
                bgcolor="#ffffff"
                border="1px solid lightgrey"
                borderRadius="4px"
                p={1}
                onDoubleClick={() => handleDoubleClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDelete(index);
                }}
                sx={{ cursor: 'pointer' }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: globalFontFamily,
                    fontSize: `${element.fontSize}em`,
                    color: element.color,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {element.content}
                </Typography>
              </Box>
            ) : element.type === 'image' ? (
              // Image Element
              <Box
                key={index}
                position="absolute"
                top={`${element.position.y}%`}
                left={`${element.position.x}%`}
                width={`${element.size}%`}
                height="auto"
                onDoubleClick={() => handleImageDoubleClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDelete(index);
                }}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid lightgrey',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <img src={element.url} alt={element.description} style={{ width: '100%', height: 'auto' }} />
              </Box>
            ) : element.type === 'video' ? (
              // Video Element
              <Box
                key={index}
                position="absolute"
                width={`${element.size}%`}
                onDoubleClick={() => handleVideoDoubleClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDelete(index);
                }}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid lightgrey',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  src={`${element.url}${element.autoPlay ? "?autoplay=1" : ""}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>
            ) : element.type === 'code' ? (
              // Code Block Element
              <Box
                key={index}
                position="absolute"
                top={`${element.position.y}%`}
                left={`${element.position.x}%`}
                width={`${element.size}%`}
                onDoubleClick={() => handleCodeDoubleClick(index)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleDelete(index);
                }}
                sx={{
                  cursor: 'pointer',
                  border: '1px solid lightgrey',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  fontSize: `${element.fontSize}em`,
                }}
              >
                <Highlight language={element.language}>
                  {element.content}
                </Highlight>
              </Box>
            ) : null
          )}

          {/* Display current slide number in the lower-left corner */}
          <Box
            position="absolute"
            bottom={10}
            left={10}
            width="50px"
            height="50px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="1em"
            color="white"
            bgcolor="rgba(0, 0, 0, 0.6)"
            borderRadius="4px"
          >
            {currentSlide}
          </Box>
        </Box>

        {/* Slide Navigation */}
        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <IconButton onClick={prevSlide} disabled={currentSlide === 1}>
            <ArrowBackIosIcon color={currentSlide === 1 ? "disabled" : "inherit"} />
          </IconButton>
          <Typography variant="body1">Slide {currentSlide}</Typography>
          <IconButton onClick={nextSlide} disabled={currentSlide === Object.keys(presentation?.slidesContent || {}).length}>
            <ArrowForwardIosIcon color={currentSlide === Object.keys(presentation?.slidesContent || {}).length ? "disabled" : "inherit"} />
          </IconButton>
        </Box>

        {/* Add and Delete Slide Buttons */}
        <Box display="flex" gap={2} mt={3}>
          <Button variant="contained" color="secondary" onClick={addSlide}>
            Add New Slide
          </Button>
          <Button variant="contained" color="error" onClick={deleteCurrentSlide}>
            Delete Current Slide
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default EditPresentation;
