import React, { useState, useCallback } from 'react';
import { MIN_PLAYERS, MAX_PLAYERS, AI_BOT_NAMES } from '../game/constants';
import './SetupScreen.css';
import type { GameSettings, GameLengthMode, TieVariant, StatMode } from '../game/types';
import type { PlayerSetupOption } from '../game/engine';
import { soundEngine } from '../utils/soundEngine';

interface SetupScreenProps {
  onStart: (players: PlayerSetupOption[], settings: GameSettings) => void;
}

interface ShowcaseCardProps {
  frontImg: string;
  backImg: string;
  alt: string;
  delayIndex: number;
  globalSpinCount: number;
  initialFlipped?: boolean;
  isPatternBack?: boolean;
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  frontImg,
  backImg,
  alt,
  delayIndex,
  globalSpinCount,
  initialFlipped = false,
  isPatternBack = false,
}) => {
  const [spinAngle, setSpinAngle] = useState(initialFlipped || isPatternBack ? 180 : 0);

  const handleCardClick = () => {
    soundEngine.playCardFlip();
    setSpinAngle((prev) => prev + 180);
  };

  const totalAngle = spinAngle + globalSpinCount * 360;

  return (
    <div
      className={`setup-showcase__card-wrap ${
        isPatternBack ? 'setup-showcase__card-wrap--pattern' : ''
      }`}
      onClick={handleCardClick}
      title="Click to spin / flip card"
    >
      <div
        className="setup-showcase__card-inner"
        style={{
          transform: `rotateY(${totalAngle}deg)`,
          transitionDelay: `${delayIndex * 60}ms`,
        }}
      >
        {/* Front Face */}
        <div className="setup-showcase__card-face setup-showcase__card-face--front">
          <img src={frontImg} alt={alt} className="setup-showcase__card-img" />
          <div className="setup-showcase__card-flip-indicator">↺</div>
        </div>

        {/* Back Face */}
        <div className="setup-showcase__card-face setup-showcase__card-face--back">
          <img src={backImg} alt={`${alt} Back`} className="setup-showcase__card-img" />
          <div className="setup-showcase__card-flip-indicator">↺</div>
        </div>
      </div>
    </div>
  );
};

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart }) => {
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState<string[]>(['Architect 1', AI_BOT_NAMES[0], AI_BOT_NAMES[1], AI_BOT_NAMES[2]]);
  const [isAiList, setIsAiList] = useState<boolean[]>([false, true, true, true]);
  const [gameMode, setGameMode] = useState<GameLengthMode>('sprint');
  const [statMode, setStatMode] = useState<StatMode>('standard');
  const [tieVariant, setTieVariant] = useState<TieVariant>('pattern-resonance');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [globalSpinCount, setGlobalSpinCount] = useState(0);

  const handleNameChange = (index: number, value: string) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const handleToggleAi = (index: number) => {
    soundEngine.playStatSelect();
    const updatedAi = [...isAiList];
    updatedAi[index] = !updatedAi[index];
    setIsAiList(updatedAi);

    // If turned into AI and name was generic, default to cool bot name
    if (updatedAi[index]) {
      const updatedNames = [...names];
      if (!updatedNames[index] || updatedNames[index].startsWith('Player') || updatedNames[index].startsWith('Architect')) {
        updatedNames[index] = AI_BOT_NAMES[index % AI_BOT_NAMES.length];
      }
      setNames(updatedNames);
    }
  };

  const handleTriggerSpin = useCallback(() => {
    soundEngine.playCardDeal();
    setGlobalSpinCount((prev) => prev + 1);
  }, []);

  const handleStart = () => {
    soundEngine.playCardDeal();
    const players: PlayerSetupOption[] = Array.from({ length: playerCount }, (_, i) => ({
      name: names[i]?.trim() || (isAiList[i] ? AI_BOT_NAMES[i % AI_BOT_NAMES.length] : `Player ${i + 1}`),
      isAi: isAiList[i],
      aiPersonality: isAiList[i] ? 'Smart Tactician' : undefined,
    }));

    onStart(players, { gameMode, tieVariant, autoAdvance, statMode });
  };

  return (
    <div className="setup-showcase">
      {/* Subtle Floating Spin Action in Corner */}
      <button
        type="button"
        className="setup-showcase__spin-floating-pill"
        onClick={handleTriggerSpin}
        title="Spin all cards in 3D"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span>Spin Deck</span>
      </button>

      {/* ─── 3-Column Flat-Lay Grid ─── */}
      <div className="setup-showcase__grid-container">
        {/* ─── LEFT COLUMN ───────────────────────────────────── */}
        <div className="setup-showcase__col setup-showcase__col--left">
          <ShowcaseCard
            frontImg="/cards/1_front.png"
            backImg="/cards/1_back.png"
            alt="01 Curved Furrows"
            delayIndex={0}
            globalSpinCount={globalSpinCount}
          />

          <ShowcaseCard
            frontImg="/cards/2_front.png"
            backImg="/cards/1_back.png"
            alt="Litema Graphic Pattern"
            delayIndex={1}
            globalSpinCount={globalSpinCount}
            isPatternBack={true}
          />

          <ShowcaseCard
            frontImg="/cards/4_front.png"
            backImg="/cards/1_back.png"
            alt="04 Stepped Serration"
            delayIndex={2}
            globalSpinCount={globalSpinCount}
          />
        </div>

        {/* ─── CENTER COLUMN ─ */}
        <div className="setup-showcase__col setup-showcase__col--center">
          <ShowcaseCard
            frontImg="/cards/11_front.png"
            backImg="/cards/1_back.png"
            alt="11 Four Point Star"
            delayIndex={3}
            globalSpinCount={globalSpinCount}
          />

          {/* Primary Interactive Setup Card */}
          <div className="setup-showcase__card setup-showcase__card--interactive">
            <div className="setup-card__header">
              <div className="setup-card__tag">LITEMA TAXONOMY · 40 BLOCKS</div>
              <h1 className="setup-card__title">Tessellate Duel</h1>
              <p className="setup-card__subtitle">Vernacular Architecture Stat Battle</p>
            </div>

            <div className="setup-card__form">
              {/* Player Count */}
              <div className="setup-card__field">
                <label className="setup-card__label">Player Count</label>
                <div className="setup-card__count-group">
                  {Array.from(
                    { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
                    (_, i) => i + MIN_PLAYERS
                  ).map((count) => (
                    <button
                      key={count}
                      type="button"
                      className={`setup-card__count-pill ${
                        playerCount === count ? 'active' : ''
                      }`}
                      onClick={() => {
                        soundEngine.playStatSelect();
                        setPlayerCount(count);
                      }}
                    >
                      {count}P
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Roster & AI Toggles */}
              <div className="setup-card__field">
                <label className="setup-card__label">Roster Configuration</label>
                <div className="setup-card__roster-list">
                  {Array.from({ length: playerCount }, (_, i) => (
                    <div key={i} className="setup-card__roster-item">
                      <input
                        className="setup-card__input"
                        placeholder={`Player ${i + 1}`}
                        value={names[i]}
                        onChange={(e) => handleNameChange(i, e.target.value)}
                        maxLength={16}
                      />
                      <button
                        type="button"
                        className={`setup-card__ai-toggle ${isAiList[i] ? 'active' : ''}`}
                        onClick={() => handleToggleAi(i)}
                        title={isAiList[i] ? 'Controlled by AI Bot' : 'Controlled by Human'}
                      >
                        {isAiList[i] ? '🤖 AI Bot' : '👤 Human'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat Depth Mode */}
              <div className="setup-card__field">
                <label className="setup-card__label">Stat Depth</label>
                <div className="setup-card__toggle-group">
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      statMode === 'standard' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setStatMode('standard');
                    }}
                  >
                    Standard (2 Stats)
                  </button>
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      statMode === 'advanced' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setStatMode('advanced');
                    }}
                  >
                    Advanced (4 Stats)
                  </button>
                </div>
              </div>

              {/* Match Length Mode */}
              <div className="setup-card__field">
                <label className="setup-card__label">Game Length</label>
                <div className="setup-card__toggle-group">
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      gameMode === 'sprint' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setGameMode('sprint');
                    }}
                  >
                    Sprint ({playerCount === 2 ? '25' : playerCount === 3 ? '20' : '18'} Cards)
                  </button>
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      gameMode === 'full-deck' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setGameMode('full-deck');
                    }}
                  >
                    Full Deck (40 Cards)
                  </button>
                </div>
              </div>

              {/* Tie Variant */}
              <div className="setup-card__field">
                <label className="setup-card__label">Tie Resolution</label>
                <div className="setup-card__toggle-group">
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      tieVariant === 'pattern-resonance' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setTieVariant('pattern-resonance');
                    }}
                  >
                    Pattern Resonance
                  </button>
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      tieVariant === 'split-resonance' ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setTieVariant('split-resonance');
                    }}
                  >
                    Split Stakes (All Ante)
                  </button>
                </div>
              </div>

              {/* Auto-Advance vs Manual Pass */}
              <div className="setup-card__field">
                <label className="setup-card__label">Pacing</label>
                <div className="setup-card__toggle-group">
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      autoAdvance ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setAutoAdvance(true);
                    }}
                  >
                    ⚡ Auto-Advance
                  </button>
                  <button
                    type="button"
                    className={`setup-card__toggle-btn ${
                      !autoAdvance ? 'active' : ''
                    }`}
                    onClick={() => {
                      soundEngine.playStatSelect();
                      setAutoAdvance(false);
                    }}
                  >
                    ✋ Manual Pause
                  </button>
                </div>
              </div>

              {/* Start CTA */}
              <button
                type="button"
                className="setup-card__start-btn"
                onClick={handleStart}
              >
                <span>Enter Arena</span>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10h12M12 6l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <ShowcaseCard
            frontImg="/cards/12_front.png"
            backImg="/cards/1_back.png"
            alt="12 Stepped Mountain Star"
            delayIndex={4}
            globalSpinCount={globalSpinCount}
          />

          <ShowcaseCard
            frontImg="/cards/14_front.png"
            backImg="/cards/1_back.png"
            alt="14 Checkerboard Star"
            delayIndex={5}
            globalSpinCount={globalSpinCount}
          />
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────────────────── */}
        <div className="setup-showcase__col setup-showcase__col--right">
          <ShowcaseCard
            frontImg="/cards/31_front.png"
            backImg="/cards/1_back.png"
            alt="31 Rotated Square Diamond"
            delayIndex={6}
            globalSpinCount={globalSpinCount}
          />

          <ShowcaseCard
            frontImg="/cards/30_front.png"
            backImg="/cards/1_back.png"
            alt="Litema Graphic Pattern"
            delayIndex={7}
            globalSpinCount={globalSpinCount}
            isPatternBack={true}
          />

          <ShowcaseCard
            frontImg="/cards/33_front.png"
            backImg="/cards/1_back.png"
            alt="33 Perspective Diamond"
            delayIndex={8}
            globalSpinCount={globalSpinCount}
          />
        </div>
      </div>
    </div>
  );
};
