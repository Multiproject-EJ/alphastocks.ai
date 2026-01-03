const formatPercent = (delta) => {
  if (delta == null) return '0%';
  const percent = Math.round(delta * 100);
  return `${percent >= 0 ? '+' : ''}${percent}%`;
};

const StressTestsSection = ({ tests }) => {
  if (!tests || !tests.length) return null;

  return (
    <section className="report-section">
      <h2 className="report-section__title">🧪 Stress Tests</h2>
      <div className="stress-tests-list">
        {tests.map((test, idx) => (
          <div key={idx} className="stress-test-card">
            <div className="stress-test-card__header">
              <span className="stress-test-card__icon">⚠️</span>
              <h3 className="stress-test-card__scenario">{test.scenario}</h3>
            </div>
            <div className="stress-test-card__impact">
              Impact: <strong>{formatPercent(test.delta)}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StressTestsSection;
