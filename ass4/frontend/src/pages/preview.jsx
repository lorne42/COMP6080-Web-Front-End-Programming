import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import axios from 'axios';
import Highlight from 'react-syntax-highlighter';

const PresentationPreview = () => {
  // Retrieve parameters and initialize navigation and state
  const { id, slideNumber } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(Number(slideNumber) || 1);

  // Fetches the presentation data from the backend store
  const getStore = () => {
    return axios.get('http://localhost:5005/store', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(response => response.data.store || { presentations: {} });
  };

  // Initialize the presentation data when component mounts or `id` changes
  useEffect(() => {
    getStore()
      .then((store) => {
        setPresentation(store.presentations[id]);
      })
      .catch((error) => {
        alert(error.response?.data?.error || 'Failed to fetch presentation data');
      });
  }, [id]);

  // Sync the URL's slide number with the state
  useEffect(() => {
    if (slideNumber) {
      setCurrentSlide(Number(slideNumber));
    }
  }, [slideNumber]);

  // Navigate to a specific slide and update the URL
  const goToSlide = (slide) => {
    navigate(`/preview/${id}/${slide}`);
    setCurrentSlide(slide);
  };

  // Move to the previous slide
  const prevSlide = () => {
    if (currentSlide > 1) {
      goToSlide(currentSlide - 1);
    }
  };

  // Move to the next slide
  const nextSlide = () => {
    if (currentSlide < Object.keys(presentation?.slidesContent || {}).length) {
      goToSlide(currentSlide + 1);
    }
  };

  // Generates the background style for each slide based on its background configuration
  const getBackgroundStyle = (background) => {
    if (!background) return { backgroundColor: "#fff" }; // Default white background

    switch (background.style) {
    case "solid":
      return { backgroundColor: background.color };
    case "gradient":
      return {
        backgroundImage: `linear-gradient(${background.gradient.direction}, ${background.gradient.start}, ${background.gradient.end})`
      };
    case "image":
      return background.image
        ? {
          backgroundImage: `url(${background.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }
        : { backgroundColor: "#fff" }; // Default white background if no image
    default:
      return { backgroundColor: "#fff" };
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" width="100vw">
      {presentation && (
        <Box position="relative" width="100%" height="100%" style={getBackgroundStyle(presentation.slidesContent[currentSlide]?.background)}>
          <Box position="absolute" width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
            {presentation?.slidesContent[currentSlide]?.elements?.map((element, index) => {
              // Default position and size if not provided
              const defaultPosition = { x: 0, y: 0 };
              const defaultSize = { width: 50, height: 50 };

              return (
                element.type === 'code' ? (
                  <Box
                    key={index}
                    position="absolute"
                    top={`${(element.position || defaultPosition).y}%`}
                    left={`${(element.position || defaultPosition).x}%`}
                    width={`${(element.size || defaultSize.width)}%`}
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
                ) : (
                  <Box
                    key={index}
                    position="absolute"
                    top={`${(element.position || defaultPosition).y}%`}
                    left={`${(element.position || defaultPosition).x}%`}
                    width={`${(element.size?.width || defaultSize.width)}%`}
                    height={`${(element.size?.height || defaultSize.height)}%`}
                    sx={{ border: 'none' }} // No border for preview elements
                  >
                    {element.type === 'text' && (
                      <Typography
                        sx={{
                          fontSize: `${element.fontSize}em`,
                          color: element.color,
                          fontFamily: element.fontFamily,
                        }}
                      >
                        {element.content}
                      </Typography>
                    )}
                    {element.type === 'image' && (
                      <img src={element.url} alt={element.description} style={{ width: '100%', height: '100%' }} />
                    )}
                    {element.type === 'video' && (
                      <iframe
                        src={element.url}
                        width="100%"
                        height="100%"
                        allow={element.autoplay ? "autoplay" : ""}
                        title="Video"
                      />
                    )}
                  </Box>
                )
              );
            })}
          </Box>

          {/* Slide navigation controls */}
          <Box position="absolute" bottom="16px" left="50%" transform="translateX(-50%)" display="flex" alignItems="center">
            <IconButton onClick={prevSlide} disabled={currentSlide === 1}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h6" color="black">
              Slide {currentSlide} of {Object.keys(presentation.slidesContent || {}).length}
            </Typography>
            <IconButton onClick={nextSlide} disabled={currentSlide === Object.keys(presentation?.slidesContent || {}).length}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PresentationPreview;
