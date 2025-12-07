export const WEALTH_SKIN_STORAGE_KEY = 'ff_wealth_skins_v1';

export function defaultWealthSkinState() {
  return {
    activeSkinId: 1,
    ownedSkinIds: [1]
  };
}

export const WEALTH_SKINS = [
  {
    id: 1,
    label: 'Frugal Sparks',
    priceNok: 5,
    stripePriceId: 'price_placeholder_1',
    aiPrompt: 'Minimalist spark icons symbolizing first savings with warm tones'
  },
  {
    id: 2,
    label: 'First Steps',
    priceNok: 5,
    stripePriceId: 'price_placeholder_2',
    aiPrompt: 'Small footprints walking toward a bright piggy bank horizon'
  },
  {
    id: 3,
    label: 'Steady Growth',
    priceNok: 5,
    stripePriceId: 'price_placeholder_3',
    aiPrompt: 'Calm tree rings expanding outward with soft greens and browns'
  },
  {
    id: 4,
    label: 'Diversified Voyager',
    priceNok: 5,
    stripePriceId: 'price_placeholder_4',
    aiPrompt: 'Voyager ship sailing across charts with diversified cargo icons'
  },
  {
    id: 5,
    label: 'Market Wave Rider',
    priceNok: 5,
    stripePriceId: 'price_placeholder_5',
    aiPrompt: 'Surfer riding upward market waves with vibrant blues and teals'
  },
  {
    id: 6,
    label: 'Blue-Chip Fortress',
    priceNok: 5,
    stripePriceId: 'price_placeholder_6',
    aiPrompt: 'Strong fortress walls built from blue-chip logos in cool palettes'
  },
  {
    id: 7,
    label: 'Strategic Magnate',
    priceNok: 15,
    stripePriceId: 'price_placeholder_7',
    aiPrompt: 'Chess pieces carved from gold and graphite planning financial moves'
  },
  {
    id: 8,
    label: 'Global Titan',
    priceNok: 15,
    stripePriceId: 'price_placeholder_8',
    aiPrompt: 'Titanic figure holding a glowing globe of diversified markets'
  },
  {
    id: 9,
    label: 'Quantum Compounding',
    priceNok: 15,
    stripePriceId: 'price_placeholder_9',
    aiPrompt: 'Quantum circuitry weaving through coins symbolizing compounding magic'
  },
  {
    id: 10,
    label: 'FutureFunds Lux Universe',
    priceNok: 55,
    stripePriceId: 'price_placeholder_10',
    aiPrompt: 'Luxurious cosmic scene of galaxies shaped like investment portfolios'
  }
];
