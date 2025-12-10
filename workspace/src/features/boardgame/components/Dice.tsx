import { FunctionalComponent, JSX } from 'preact';
import { useState } from 'preact/hooks';

interface DiceProps {
  disabled?: boolean;
  onRoll: (value: number) => void;
}

const randomDie = (): number => Math.floor(Math.random() * 6) + 1;

const Dice: FunctionalComponent<DiceProps> = ({ disabled, onRoll }) => {
  const [currentValue, setCurrentValue] = useState<number>(1);

  const handleRoll = () => {
    if (disabled) return;
    const value = randomDie();
    setCurrentValue(value);
    onRoll(value);
  };

  const buttonStyle: JSX.CSSProperties = {
    background: 'var(--boardgame-dice-bg)',
    color: 'var(--boardgame-dice-fg)',
    border: '1px solid var(--boardgame-dice-border)',
    borderRadius: '0.75rem',
    padding: '1rem 1.5rem',
    minWidth: '96px',
    fontSize: '1.25rem',
    fontWeight: 700,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'transform 120ms ease, box-shadow 120ms ease'
  };

  return (
    <button
      type="button"
      className="boardgame-dice"
      onClick={handleRoll}
      style={buttonStyle}
      disabled={disabled}
    >
      ROLL ({currentValue})
    </button>
  );
};

export default Dice;
export type { DiceProps };
