import { useEffect, useMemo, useState, useCallback } from 'preact/hooks';
import { TILES, groupColorClassMap } from './boardLayout.js';
import { useWealthSkins } from './useWealthSkins.js';
import { WEALTH_SKINS } from './skins.js';
import { startSkinPurchase } from './api/stripe.js';
import './styles.css';

const boardEdges = {
  bottom: [0, 1, 2, 3, 4, 5, 6],
  right: [7, 8, 9, 10, 11, 12, 13],
  top: [14, 15, 16, 17, 18, 19, 20],
  left: [21, 22, 23, 24, 25, 26, 27]
};

function Tile({ tile, onClick, activeSkin }) {
  const ribbonClass = groupColorClassMap[tile.groupColor] ?? 'tile-color-other';
  return (
    <div className={`tile-wrapper tile-type-${tile.type}`}>
      <img
        className="tile-wealth-image"
        alt={`${activeSkin.label} wealth skin`}
        src={`/assets/wealth-skins/skin-${activeSkin.id}.png`}
      />
      <div className="tile-card" role="button" onClick={() => onClick(tile)}>
        <div className={`tile-ribbon ${ribbonClass}`} aria-hidden="true" />
        <h4>{tile.label}</h4>
        {tile.ticker && <p className="tile-meta">{tile.ticker}</p>}
        {tile.sector && <p className="tile-meta">{tile.sector}</p>}
      </div>
    </div>
  );
}

function TileModal({ tile, onClose, inJail }) {
  const [companyImageLoaded, setCompanyImageLoaded] = useState(false);
  if (!tile) return null;

  const modalTitle = tile.type === 'stock' ? 'Stock card' : tile.type === 'fishing' ? 'Fishing trip' : 'Jail lesson';
  const body = tile.type === 'stock'
    ? 'Explore fundamentals, conviction score, and how this move earns its spot.'
    : tile.type === 'fishing'
      ? 'Quick pause to reset discipline. Log the cast and return to patience.'
      : 'Investing jail. Review the lesson, roll doubles to get out.';

  const imageSrc = `/assets/company-placeholders/${tile.id || tile.ticker}.jpg`;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-company-image-wrapper">
          {!companyImageLoaded && <div className="modal-company-image-skeleton" />}
          <img
            className="modal-company-image"
            src={imageSrc}
            alt={`${tile.label} revenue engine`}
            onLoad={() => setCompanyImageLoaded(true)}
          />
        </div>
        <h3>{modalTitle}</h3>
        <p>{body}</p>
        {tile.type === 'jail' && inJail && <p className="detail-meta">Roll doubles to leave jail.</p>}
        {/* TODO: integrate with AI image pipeline using tile + prompts */}
      </div>
    </div>
  );
}

function SkinSelector({ state, setActiveSkin, markSkinOwned }) {
  return (
    <div className="board-skin-selector" aria-label="Wealth skin selector">
      {WEALTH_SKINS.map((skin) => {
        const owned = state.ownedSkinIds.includes(skin.id);
        const classNames = ['skin-chip'];
        if (owned) classNames.push('owned');
        if (state.activeSkinId === skin.id) classNames.push('active');
        if (!owned) classNames.push('locked');

        const handleClick = () => {
          if (owned) {
            setActiveSkin(skin.id);
          } else {
            startSkinPurchase(skin.id);
          }
        };

        return (
          <button
            key={skin.id}
            className={classNames.join(' ')}
            type="button"
            onClick={handleClick}
            aria-label={`Select wealth skin ${skin.label}`}
          >
            {skin.id}
          </button>
        );
      })}
    </div>
  );
}

function arrangeTiles(edgeIndices) {
  return edgeIndices.map((positionIndex) => TILES.find((tile) => tile.positionIndex === positionIndex));
}

export default function BoardGameTab() {
  const { activeSkin, state, setActiveSkin, markSkinOwned } = useWealthSkins();
  const [selectedTile, setSelectedTile] = useState(null);
  const [inJail, setInJail] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isBoardLaunched, setIsBoardLaunched] = useState(false);

  const edges = useMemo(
    () => ({
      bottom: arrangeTiles(boardEdges.bottom),
      right: arrangeTiles(boardEdges.right),
      top: arrangeTiles(boardEdges.top),
      left: arrangeTiles(boardEdges.left)
    }),
    []
  );

  const closeModal = useCallback(() => setSelectedTile(null), []);

  const handleTileClick = useCallback(
    (tile) => {
      if (!tile) return;
      if (tile.type === 'jail') {
        setInJail(true);
      }
      setSelectedTile(tile);
    },
    []
  );

  const rollDice = useCallback(() => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const isDouble = die1 === die2;
    console.log('Dice roll', { die1, die2, isDouble });

    if (inJail && isDouble) {
      setInJail(false);
      setStatusMessage('Doubles rolled — you are free from investing jail!');
    } else {
      setStatusMessage(`Rolled ${die1} and ${die2}${isDouble ? ' (doubles!)' : ''}`);
    }
  }, [inJail]);

  useEffect(() => {
    const checkSkinPurchaseCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const unlocked = params.get('skinUnlocked');
      if (!unlocked) return;

      const id = Number(unlocked);
      if (!Number.isFinite(id)) return;

      markSkinOwned(id);

      params.delete('skinUnlocked');
      const newSearch = params.toString();
      const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', newUrl);
    };

    checkSkinPurchaseCallback();
  }, [markSkinOwned]);

  const closeBoard = useCallback(() => {
    setIsBoardLaunched(false);
    setSelectedTile(null);
    setStatusMessage('');
    setInJail(false);
  }, []);

  const openBoard = useCallback(() => {
    setIsBoardLaunched(true);
  }, []);

  return (
    <div className="board-game-tab">
      <div className="board-game-landing">
        <div>
          <p className="eyebrow">ValueBot Teacher add-on</p>
          <h3>The Investing Board Game</h3>
          <p className="detail-meta">Practice patient entries, celebrate quality casts, and unlock skins as you level up.</p>
          <ul className="board-game-landing__list">
            <li>Map conviction moves to the board before committing real capital.</li>
            <li>Pause with a fishing trip when the setup is weak or patience is slipping.</li>
            <li>Collect skins as coaching rewards for disciplined decision making.</li>
          </ul>
        </div>
        <div className="board-game-landing__actions">
          <button className="btn-primary" type="button" onClick={openBoard}>
            Launch board game
          </button>
          <p className="detail-meta">Opens full-screen without the workspace sidebar.</p>
        </div>
      </div>

      {isBoardLaunched && (
        <div className="board-game-overlay" role="dialog" aria-modal="true" aria-label="The Investing Board Game">
          <button className="board-game-close" type="button" onClick={closeBoard} aria-label="Close board game">
            ×
          </button>

          <div className="board-game-overlay__content">
            <div className="board-game-layout board-game-layout--fullscreen">
              <div className="skin-label">Active skin: {activeSkin.label}</div>
              <div className="board-center">
                <div>
                  <p className="detail-meta">Portfolio graph placeholder</p>
                  <p>Map your conviction move here.</p>
                </div>
              </div>
              <div className="board-edges">
                <div className="edge edge-top">
                  {edges.top.map((tile) => tile && (
                    <Tile key={tile.id} tile={tile} onClick={handleTileClick} activeSkin={activeSkin} />
                  ))}
                </div>
                <div className="edge edge-right">
                  {edges.right.map((tile) => tile && (
                    <Tile key={tile.id} tile={tile} onClick={handleTileClick} activeSkin={activeSkin} />
                  ))}
                </div>
                <div className="edge edge-bottom">
                  {edges.bottom.map((tile) => tile && (
                    <Tile key={tile.id} tile={tile} onClick={handleTileClick} activeSkin={activeSkin} />
                  ))}
                </div>
                <div className="edge edge-left">
                  {edges.left.map((tile) => tile && (
                    <Tile key={tile.id} tile={tile} onClick={handleTileClick} activeSkin={activeSkin} />
                  ))}
                </div>
              </div>
              <button className="board-dice-button" type="button" onClick={rollDice} aria-label="Roll dice">
                🎲
              </button>
              <SkinSelector state={state} setActiveSkin={setActiveSkin} markSkinOwned={markSkinOwned} />
            </div>

            {statusMessage && (
              <div className={`board-status-banner${inJail ? ' warning' : ''}`} aria-live="polite">
                {statusMessage}
              </div>
            )}
          </div>

          {selectedTile && <TileModal tile={selectedTile} onClose={closeModal} inJail={inJail} />}
        </div>
      )}
    </div>
  );
}
