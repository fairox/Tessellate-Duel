import React, { useState, useEffect } from 'react';
import './DigitalArenaClock.css';

interface DigitalArenaClockProps {
  currentRound: number;
  phase: string;
  totalCards?: number;
  isLeadTurn?: boolean;
}

export const DigitalArenaClock: React.FC<DigitalArenaClockProps> = ({
  currentRound,
  phase,
  totalCards = 40,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [colonVisible, setColonVisible] = useState(true);

  // Match tournament timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Blinking colon animation
  useEffect(() => {
    const blink = setInterval(() => {
      setColonVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(blink);
  }, []);

  const minStr = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const secStr = String(elapsedSeconds % 60).padStart(2, '0');

  // Format phase for digital telemetry
  const phaseCode =
    phase === 'reveal-off'
      ? 'INIT'
      : phase === 'stat-call'
      ? 'CALL'
      : phase === 'revealing'
      ? 'DUEL'
      : phase === 'resonance'
      ? 'RSNC'
      : phase === 'round-result'
      ? 'RSLT'
      : phase === 'game-over'
      ? 'VICT'
      : 'IDLE';

  return (
    <div className="digital-arena-clock" title="Arena Tournament Chronometer">
      {/* Outer Matte Black Bezel Casing */}
      <div className="digital-arena-clock__bezel">
        {/* Left Telemetry Sub-Tag */}
        <div className="digital-arena-clock__left-tag">
          <span className="digital-arena-clock__mode-label">MATCH</span>
        </div>

        {/* Main 7-Segment Digital Time Readout */}
        <div className="digital-arena-clock__main-digits">
          <span className="digital-arena-clock__digit">{minStr}</span>
          <span
            className={`digital-arena-clock__colon ${
              colonVisible ? 'visible' : 'dim'
            }`}
          >
            :
          </span>
          <span className="digital-arena-clock__digit">{secStr}</span>
        </div>

        {/* Vertical Hairline Separator */}
        <div className="digital-arena-clock__separator" />

        {/* Right Digital Telemetry Column */}
        <div className="digital-arena-clock__telemetry">
          {/* Row 1: Round */}
          <div className="digital-arena-clock__telem-item">
            <span className="digital-arena-clock__telem-val">
              {currentRound > 0 ? `${currentRound}` : '01'}
              <span className="digital-arena-clock__telem-unit">R</span>
            </span>
            <span className="digital-arena-clock__telem-label">ROUND</span>
          </div>

          {/* Row 2: Deck count */}
          <div className="digital-arena-clock__telem-item">
            <span className="digital-arena-clock__telem-val">
              {totalCards}
              <span className="digital-arena-clock__telem-unit">%</span>
            </span>
            <span className="digital-arena-clock__telem-label">DECK</span>
          </div>

          {/* Row 3: Phase / Date Code */}
          <div className="digital-arena-clock__telem-item">
            <span className="digital-arena-clock__telem-val digital-arena-clock__telem-val--phase">
              {phaseCode}
            </span>
            <span className="digital-arena-clock__telem-label">STATUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
