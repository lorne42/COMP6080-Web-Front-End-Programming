import React, { useState } from 'react';

const Tower = () => {
  const [blocks, setBlocks] = useState([]);
  const [towers, setTowers] = useState([[], [], []]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Prompt user for the number of blocks
  const initializeGame = (blockCount) => {
    const newBlocks = Array.from({ length: blockCount }, (_, i) => ({
      id: i + 1,
      width: (blockCount - i) * 20, // Blocks get narrower as they go up
      color: `hsl(${(360 / blockCount) * i}, 70%, 50%)`,
    }));
    setBlocks(newBlocks);
    setTowers([newBlocks, [], []]);
    setMoves(0);
    setGameStarted(true);
    setGameWon(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setBlocks([]);
    setTowers([[], [], []]);
    setSelectedTower(null);
    setMoves(0);
    setGameWon(false);
  };
  let numwon = localStorage.getItem("number");
  const handleTowerClick = (towerIndex) => {
    if (gameWon) return;

    if (selectedTower === null) {
      // Select the tower to move from
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      // Try to move the block
      const fromTower = [...towers[selectedTower]];
      const toTower = [...towers[towerIndex]];

      const movingBlock = fromTower[fromTower.length - 1];
      const topBlockOnTarget = toTower[toTower.length - 1];

      if (!topBlockOnTarget || movingBlock.width < topBlockOnTarget.width) {
        toTower.push(fromTower.pop());
        setTowers((prev) => {
          const updatedTowers = [...prev];
          updatedTowers[selectedTower] = fromTower;
          updatedTowers[towerIndex] = toTower;
          return updatedTowers;
        });
        setMoves(moves + 1);

        // Check for game win condition
        if (toTower.length === blocks.length && towerIndex === 2) {
          setGameWon(true);
          numwon--;
          localStorage.setItem("number", numwon);
        }
      }
      setSelectedTower(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1>Tower of Hanoi</h1>
        {!gameStarted && (
          <div>
            <p>Select the number of blocks:</p>
            <button onClick={() => initializeGame(3)}>3 Blocks</button>
            <button onClick={() => initializeGame(4)}>4 Blocks</button>
            <button onClick={() => initializeGame(5)}>5 Blocks</button>
          </div>
        )}
      </header>

      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        {/* Towers */}
        <div style={{ display: 'flex', gap: '20px', border: '3px solid #999', padding: '20px' }}>
          {towers.map((tower, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '100px',
                height: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                borderTop: selectedTower === index ? '2px solid red' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => handleTowerClick(index)}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#000',
                }}
              ></div>
              <div
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '100%',
                  backgroundColor: '#000',
                }}
              ></div>
              {/* Blocks */}
              {tower.map((block, blockIndex) => (
                <div
                  key={block.id}
                  style={{
                    width: `${block.width}px`,
                    height: '10px',
                    backgroundColor: block.color,
                    marginBottom: '2px',
                  }}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Success message */}
      {gameWon && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: '#fff',
            border: '10px dashed #333',
            width: '200px',
            height: '50px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '14pt',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          Success in {moves} moves!
        </div>
      )}

      {/* Reset button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={resetGame}
          disabled={gameStarted && moves === 0}
          style={{ padding: '10px 20px', cursor: gameStarted && moves === 0 ? 'not-allowed' : 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Tower;
