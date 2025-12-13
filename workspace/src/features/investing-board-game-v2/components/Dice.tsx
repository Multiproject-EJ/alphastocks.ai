import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import '../styles/Dice.css';

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

  return (
    <button
      type="button"
      className={`board-game-v2-dice ${disabled ? 'board-game-v2-dice-disabled' : ''}`}
      onClick={handleRoll}
      disabled={disabled}
    >
      ROLL ({currentValue})
    </button>
  );
};

export default Dice;
export type { DiceProps };
