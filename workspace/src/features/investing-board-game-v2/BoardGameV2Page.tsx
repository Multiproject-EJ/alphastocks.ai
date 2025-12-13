import { FunctionalComponent } from 'preact';
import GameBoard from './components/GameBoard';
import './styles/BoardGameV2Page.css';

/**
 * BoardGameV2Page - Investing Board Game (V2)
 * 
 * This is the main container for the new board game feature module.
 * It uses scoped styles to avoid conflicts with existing components.
 */
const BoardGameV2Page: FunctionalComponent = () => {
  return (
    <div className="board-game-v2-root">
      <header className="board-game-v2-header">
        <h1>Investing Board Game (V2)</h1>
        <p className="board-game-v2-subtitle">
          Enhanced board game experience with new features
        </p>
      </header>
      
      <div className="board-game-v2-container">
        <GameBoard />
      </div>
    </div>
  );
};

export default BoardGameV2Page;
