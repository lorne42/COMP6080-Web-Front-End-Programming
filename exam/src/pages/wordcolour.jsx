import React, { useState, useEffect } from 'react';

const Wordcolour = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [leftText, setLeftText] = useState('');
  const [leftColor, setLeftColor] = useState('');
  const [quadrantColors, setQuadrantColors] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const colorOptions = ['red', 'blue', 'orange', 'yellow', 'green', 'purple', 'pink'];
  // Start the game 2 seconds after page loads
  useEffect(() => {
    
    const timer = setTimeout(() => {
      startNewRound();
      setGameStarted(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Start a new round
  const startNewRound = () => {
    // Select random text and color
    const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
    setLeftText(randomColor);
    setLeftColor(randomColor);

    // Generate 4 random colors, with one matching the text
    const colors = Array.from({ length: 4 }, () =>
      colorOptions[Math.floor(Math.random() * colorOptions.length)]
    );
    const randomIndex = Math.floor(Math.random() * 4);
    if (colors.includes(randomColor)){
      setQuadrantColors(colors);
      console.log(colors)
    }else{
      colors[randomIndex] = randomColor; // Ensure one is correct
      setQuadrantColors(colors);
      console.log(colors)
    }
    
    
  };

  // Handle quadrant click
  const handleClick = (color) => {
    let numwon = localStorage.getItem("number")
    if (color === leftColor) {
      // Increment correct answers and check for win
      if (correctAnswers + 1 === 3) {
        alert('You have won');
        numwon--
        localStorage.setItem("number", numwon);
        resetGame();
      } else {
        setCorrectAnswers(correctAnswers + 1);
        startNewRound();
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    setCorrectAnswers(0);
    setGameStarted(false);
    setLeftText('');
    setQuadrantColors([]);
    setTimeout(() => {
      startNewRound();
      setGameStarted(true);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', margin: '0', padding: '0' }}>

      <div
        style={{
          backgroundColor: '#999',
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {gameStarted && (
          <span style={{ fontSize: '2em', color: leftColor }}>{leftText}</span>
        )}
      </div>

      
      <div
        style={{
          backgroundColor: '#666',
          width: '50%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '10px',
        }}
      >
        {gameStarted &&
          quadrantColors.map((color, index) => (
            <div
              key={index}
              onClick={() => handleClick(color)}
              style={{
                backgroundColor: color,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            />
          ))}
      </div>
    </div>
  );
};

export default Wordcolour;
