import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '../game/types';
import './RoundLog.css';

interface RoundLogProps {
  entries: LogEntry[];
}

export const RoundLog: React.FC<RoundLogProps> = ({ entries }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="round-log">
      <div className="round-log__header">
        <span className="round-log__title">Battle Log</span>
        <span className="round-log__count">{entries.length}</span>
      </div>
      <div className="round-log__scroll" ref={scrollRef}>
        {entries.length === 0 ? (
          <p className="round-log__empty">No battles yet…</p>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="round-log__entry">
              {entry.round > 0 && (
                <span className="round-log__round">R{entry.round}</span>
              )}
              <span className="round-log__message">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
