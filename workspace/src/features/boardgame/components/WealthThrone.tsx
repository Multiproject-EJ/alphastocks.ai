import React, { useMemo } from 'react';

interface WealthThroneProps {
  startingNetWorth: number;
  currentNetWorth: number;
  holdingsCount: number;
}

export const WealthThrone: React.FC<WealthThroneProps> = ({
  startingNetWorth,
  currentNetWorth,
  holdingsCount,
}) => {
  const ratio = useMemo(() => {
    if (startingNetWorth <= 0) return 0;
    const raw = (currentNetWorth - startingNetWorth) / startingNetWorth;
    const normalized = (raw + 0.5) / 2.5; // map approx -50%..+200% to 0..1
    return Math.min(1, Math.max(0, normalized));
  }, [startingNetWorth, currentNetWorth]);

  const delta = currentNetWorth - startingNetWorth;
  const deltaPct =
    startingNetWorth > 0 ? (delta / startingNetWorth) * 100 : 0;

  const glowShadow = `0 0 ${40 + ratio * 40}px rgba(212, 175, 55, ${
    0.2 + ratio * 0.4
  })`;
  const scale = 1 + ratio * 0.06;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '45%',
          maxWidth: 260,
          aspectRatio: '1 / 1',
          borderRadius: '9999px',
          border: '2px solid rgba(148, 163, 184, 0.4)',
          boxShadow: '0 0 40px rgba(15, 23, 42, 0.9)',
          background:
            'radial-gradient(circle at 50% 0%, rgba(148,163,184,0.25), #020617)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            width: '78%',
            height: '78%',
            borderRadius: '9999px',
            border: '1px solid rgba(148, 163, 184, 0.5)',
            background:
              'radial-gradient(circle at 50% 25%, #020617, #020617 45%, #020617)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '70%',
              height: '70%',
              borderRadius: '9999px',
              background:
                'radial-gradient(circle at 30% 20%, #fefce8, #d4af37, #0b0e11)',
              boxShadow: glowShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${scale})`,
              transition:
                'box-shadow 250ms ease-out, transform 250ms ease-out',
              color: '#f9fafb',
              textAlign: 'center',
              padding: '0.4rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}
              >
                Wealth Throne
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  marginTop: '0.1rem',
                }}
              >
                {deltaPct >= 0 ? '+' : ''}
                {deltaPct.toFixed(1)}%
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  marginTop: '0.1rem',
                  opacity: 0.8,
                }}
              >
                Holdings: {holdingsCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
