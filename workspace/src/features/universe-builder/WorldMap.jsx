import { useMemo } from 'preact/hooks';

// Country coordinates for major stock exchanges (approximate center points)
// Format: [country_code, name, latitude, longitude]
const EXCHANGE_COUNTRIES = [
  // Americas
  ['US', 'United States', 38, -97],
  ['CA', 'Canada', 56, -106],
  ['BR', 'Brazil', -14, -51],
  ['MX', 'Mexico', 23, -102],
  ['AR', 'Argentina', -34, -64],
  ['CL', 'Chile', -35, -71],
  ['CO', 'Colombia', 4, -72],
  ['PE', 'Peru', -10, -76],

  // Europe
  ['GB', 'United Kingdom', 54, -2],
  ['DE', 'Germany', 51, 9],
  ['FR', 'France', 46, 2],
  ['NL', 'Netherlands', 52, 5],
  ['CH', 'Switzerland', 47, 8],
  ['ES', 'Spain', 40, -4],
  ['IT', 'Italy', 42, 12],
  ['SE', 'Sweden', 62, 15],
  ['NO', 'Norway', 62, 10],
  ['DK', 'Denmark', 56, 10],
  ['FI', 'Finland', 64, 26],
  ['BE', 'Belgium', 51, 4],
  ['AT', 'Austria', 47, 14],
  ['IE', 'Ireland', 53, -8],
  ['PT', 'Portugal', 39, -8],
  ['PL', 'Poland', 52, 20],
  ['GR', 'Greece', 39, 22],
  ['RU', 'Russia', 60, 100],

  // Asia Pacific
  ['JP', 'Japan', 36, 138],
  ['CN', 'China', 35, 105],
  ['HK', 'Hong Kong', 22, 114],
  ['SG', 'Singapore', 1, 104],
  ['KR', 'South Korea', 36, 128],
  ['TW', 'Taiwan', 24, 121],
  ['IN', 'India', 21, 78],
  ['AU', 'Australia', -27, 133],
  ['NZ', 'New Zealand', -41, 174],
  ['ID', 'Indonesia', -5, 120],
  ['MY', 'Malaysia', 4, 102],
  ['TH', 'Thailand', 15, 101],
  ['PH', 'Philippines', 12, 122],
  ['VN', 'Vietnam', 16, 108],
  ['PK', 'Pakistan', 30, 69],
  ['BD', 'Bangladesh', 24, 90],
  ['LK', 'Sri Lanka', 7, 81],

  // Middle East & Africa
  ['AE', 'UAE', 24, 54],
  ['SA', 'Saudi Arabia', 24, 45],
  ['IL', 'Israel', 31, 35],
  ['TR', 'Turkey', 39, 35],
  ['ZA', 'South Africa', -30, 25],
  ['EG', 'Egypt', 27, 30],
  ['NG', 'Nigeria', 9, 8],
  ['KE', 'Kenya', 0, 38],
  ['MA', 'Morocco', 32, -5],
  ['QA', 'Qatar', 25, 51],
  ['KW', 'Kuwait', 29, 48],
  ['BH', 'Bahrain', 26, 51],
  ['JO', 'Jordan', 31, 37],
];

// Convert lat/long to SVG coordinates (simple equirectangular projection)
const latLongToSvg = (lat, long, width, height) => {
  const x = ((long + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return { x, y };
};

// Simplified world map outline (continents only, as SVG path)
const WORLD_MAP_PATH = `
  M 70 60 L 95 55 L 120 65 L 140 50 L 165 55 L 175 70 L 160 85 L 125 80 L 100 90 L 75 85 L 55 75 Z
  M 180 60 L 200 50 L 240 55 L 270 65 L 290 80 L 285 100 L 260 110 L 230 105 L 200 90 L 185 75 Z
  M 310 55 L 340 45 L 380 50 L 410 65 L 420 85 L 400 100 L 360 105 L 330 95 L 310 75 Z
  M 435 70 L 480 55 L 540 60 L 580 75 L 600 95 L 590 120 L 550 130 L 500 125 L 460 110 L 440 90 Z
  M 140 140 L 180 135 L 200 155 L 175 175 L 145 165 Z
  M 450 140 L 500 135 L 540 145 L 530 170 L 490 175 L 455 160 Z
`;

/**
 * WorldMap component displays a global map with lights for active exchanges
 * @param {Object} props
 * @param {Array} props.exchanges - List of exchanges with country info
 * @param {Object} props.progress - Analysis progress info (current exchange, etc.)
 */
const WorldMap = ({ exchanges = [], progress = {} }) => {
  const width = 700;
  const height = 350;

  // Determine which countries have exchanges that are analyzed, in queue, or pending
  const countryStatus = useMemo(() => {
    const statusMap = {};

    exchanges.forEach((exchange) => {
      const country = exchange.country;
      if (!country) return;

      // Find matching country code
      const matchedCountry = EXCHANGE_COUNTRIES.find(
        ([code, name]) => 
          name.toLowerCase() === country.toLowerCase() ||
          code.toLowerCase() === country.toLowerCase()
      );

      if (matchedCountry) {
        const [code] = matchedCountry;
        const isCompleted = exchange.last_analyzed_letter === 'Z';
        const isInProgress = progress.current_exchange_mic === exchange.mic_code;
        const isPriority = exchange.is_priority;
        const hasStarted = exchange.last_analyzed_letter && exchange.last_analyzed_letter !== '';

        // Priority: completed > in_progress > priority > started > pending
        if (!statusMap[code] || 
            isCompleted || 
            (isInProgress && statusMap[code] !== 'completed') ||
            (isPriority && !['completed', 'in_progress'].includes(statusMap[code]))) {
          statusMap[code] = isCompleted ? 'completed' : 
                           isInProgress ? 'in_progress' : 
                           isPriority ? 'priority' :
                           hasStarted ? 'started' : 'pending';
        }
      }
    });

    return statusMap;
  }, [exchanges, progress]);

  // Get status color for a country
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e'; // Green - fully analyzed
      case 'in_progress':
        return '#3b82f6'; // Blue - currently analyzing
      case 'priority':
        return '#f59e0b'; // Amber - priority/next up
      case 'started':
        return '#8b5cf6'; // Purple - started but not complete
      default:
        return 'rgba(148, 163, 184, 0.3)'; // Dim gray - pending
    }
  };

  // Get glow intensity for animation
  const getGlowFilter = (status) => {
    switch (status) {
      case 'in_progress':
        return 'url(#glow-blue)';
      case 'priority':
        return 'url(#glow-amber)';
      case 'completed':
        return 'url(#glow-green)';
      default:
        return 'none';
    }
  };

  return (
    <div className="world-map">
      <div className="world-map__header">
        <h3>🌍 Global Exchange Coverage</h3>
        <div className="world-map__legend">
          <span className="legend-item">
            <span className="legend-dot legend-dot--completed" />
            Analyzed
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--in-progress" />
            Analyzing
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--priority" />
            Next Up
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--started" />
            Started
          </span>
          <span className="legend-item">
            <span className="legend-dot legend-dot--pending" />
            Pending
          </span>
        </div>
      </div>
      
      <svg 
        viewBox={`0 0 ${width} ${height}`}
        className="world-map__svg"
        role="img"
        aria-label="World map showing stock exchange analysis coverage"
      >
        <defs>
          {/* Glow effects */}
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient background */}
          <linearGradient id="map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.9)" />
            <stop offset="100%" stopColor="rgba(30, 41, 59, 0.9)" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill="url(#map-bg)"
          rx="8"
        />
        
        {/* Simplified continent outlines */}
        <path 
          d={WORLD_MAP_PATH}
          fill="rgba(71, 85, 105, 0.3)"
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />

        {/* Grid lines for visual reference */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * (height / 4)}
            x2={width}
            y2={i * (height / 4)}
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="0.5"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <line
            key={`v-${i}`}
            x1={i * (width / 6)}
            y1="0"
            x2={i * (width / 6)}
            y2={height}
            stroke="rgba(148, 163, 184, 0.1)"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Country markers */}
        {EXCHANGE_COUNTRIES.map(([code, name, lat, long]) => {
          const { x, y } = latLongToSvg(lat, long, width, height);
          const status = countryStatus[code] || 'pending';
          const color = getStatusColor(status);
          const glowFilter = getGlowFilter(status);
          const radius = status === 'in_progress' ? 6 : status === 'completed' ? 5 : 4;

          return (
            <g key={code}>
              {/* Outer glow ring for active states */}
              {status === 'in_progress' && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 4}
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.4"
                  className="world-map__pulse"
                />
              )}
              
              {/* Main marker */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={color}
                filter={glowFilter}
                className={status === 'in_progress' ? 'world-map__marker--active' : ''}
              />
              
              {/* Country label on hover (using title for accessibility) */}
              <title>{`${name}: ${status.replace('_', ' ')}`}</title>
            </g>
          );
        })}
      </svg>
      
      {/* Stats summary */}
      <div className="world-map__stats">
        <div className="world-map__stat">
          <span className="world-map__stat-value">
            {Object.values(countryStatus).filter(s => s === 'completed').length}
          </span>
          <span className="world-map__stat-label">Countries Completed</span>
        </div>
        <div className="world-map__stat">
          <span className="world-map__stat-value">
            {Object.values(countryStatus).filter(s => s === 'in_progress').length}
          </span>
          <span className="world-map__stat-label">Currently Analyzing</span>
        </div>
        <div className="world-map__stat">
          <span className="world-map__stat-value">
            {EXCHANGE_COUNTRIES.length - Object.keys(countryStatus).length}
          </span>
          <span className="world-map__stat-label">Awaiting Data</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
