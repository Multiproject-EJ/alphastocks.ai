const getForceIcon = (key) => {
  const iconMap = {
    'supplier_power': '📦',
    'buyer_power': '🛍️',
    'competitive_rivalry': '⚔️',
    'threat_new': '🚪',
    'threat_substitutes': '🔄'
  };
  return iconMap[key] || '📊';
};

const formatForceTitle = (key) => {
  const titleMap = {
    'supplier_power': 'Supplier Power',
    'buyer_power': 'Buyer Power',
    'competitive_rivalry': 'Competitive Rivalry',
    'threat_new': 'Threat of New Entrants',
    'threat_substitutes': 'Threat of Substitutes'
  };
  return titleMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const PorterForcesSection = ({ forces }) => {
  if (!forces) return null;

  return (
    <section className="report-section">
      <h2 className="report-section__title">⚔️ Porter's Five Forces</h2>
      <div className="porter-forces-list">
        {Object.entries(forces).map(([key, value]) => (
          <div key={key} className="porter-force-card">
            <div className="porter-force-card__header">
              <span className="porter-force-card__icon">{getForceIcon(key)}</span>
              <h3 className="porter-force-card__title">{formatForceTitle(key)}</h3>
            </div>
            <p className="porter-force-card__description">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PorterForcesSection;
