import { FunctionalComponent } from 'preact';

const CenterPanels: FunctionalComponent = () => {
  return (
    <div className="boardgame-panels">
      <section className="boardgame-panel">
        <h3>Panel 1 – Hub</h3>
        <p>Central navigation and live game prompts will appear here.</p>
      </section>
      <section className="boardgame-panel">
        <h3>Panel 2 – Company</h3>
        <p>Company tiles, stats, and actions will live in this pane.</p>
      </section>
      <section className="boardgame-panel">
        <h3>Panel 3 – Results</h3>
        <p>Roll outcomes, cash, holdings, and scorekeeping will be shown here.</p>
      </section>
    </div>
  );
};

export default CenterPanels;
