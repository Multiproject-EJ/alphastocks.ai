import { FunctionalComponent } from 'preact';
import '../styles/AvatarToken.css';

interface AvatarTokenProps {
  tileIndex: number;
  activeIndex: number;
}

const AvatarToken: FunctionalComponent<AvatarTokenProps> = ({ tileIndex, activeIndex }) => {
  if (tileIndex !== activeIndex) return null;

  return (
    <span 
      className="board-game-v2-avatar" 
      aria-label="Player token" 
    />
  );
};

export default AvatarToken;
export type { AvatarTokenProps };
