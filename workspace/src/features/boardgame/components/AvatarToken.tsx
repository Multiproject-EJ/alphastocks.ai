import { FunctionalComponent, JSX } from 'preact';

interface AvatarTokenProps {
  tileIndex: number;
  activeIndex: number;
}

const AvatarToken: FunctionalComponent<AvatarTokenProps> = ({ tileIndex, activeIndex }) => {
  if (tileIndex !== activeIndex) return null;

  const style: JSX.CSSProperties = {
    position: 'absolute',
    insetInlineStart: '50%',
    insetBlockEnd: '0.5rem',
    transform: 'translateX(-50%)',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '999px',
    background: 'var(--boardgame-avatar-bg, gold)',
    border: '2px solid rgba(0,0,0,0.25)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.35)'
  };

  return <span className="boardgame-avatar" style={style} aria-label="Player token" />;
};

export default AvatarToken;
export type { AvatarTokenProps };
