import { FunctionalComponent } from 'preact';

const BoardRoot: FunctionalComponent = () => {
  return (
    <div className="boardgame-board" aria-label="Board game surface">
      <div className="boardgame-board__placeholder">BoardRoot placeholder</div>
    </div>
  );
};

export default BoardRoot;
