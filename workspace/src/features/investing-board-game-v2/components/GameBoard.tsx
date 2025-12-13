import { FunctionalComponent } from 'preact';
import '../styles/GameBoard.css';

/**
 * GameBoard - Placeholder component for the V2 board game
 * 
 * This component will be replaced with actual board game logic
 * once the donor repository is accessible.
 */
const GameBoard: FunctionalComponent = () => {
  return (
    <div className="board-game-v2-board">
      <div className="board-game-v2-board-grid">
        {/* Board tiles will be added here */}
        <div className="board-game-v2-tile board-game-v2-tile-start">
          <span className="board-game-v2-tile-label">START</span>
        </div>
        <div className="board-game-v2-tile">
          <span className="board-game-v2-tile-label">Stock Market</span>
        </div>
        <div className="board-game-v2-tile">
          <span className="board-game-v2-tile-label">Dividend</span>
        </div>
        <div className="board-game-v2-tile">
          <span className="board-game-v2-tile-label">Investment</span>
        </div>
      </div>
      
      <div className="board-game-v2-board-note">
        <p><strong>Note:</strong> This is a placeholder. Game components from the donor repository 
        will be integrated here once access is available.</p>
      </div>
    </div>
  );
};

export default GameBoard;
