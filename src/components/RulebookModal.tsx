
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rulebookContent from '../data/rulebook.md?raw';
import './RulebookModal.css';

interface RulebookModalProps {
  onClose: () => void;
}

export function RulebookModal({ onClose }: RulebookModalProps) {
  return (
    <div className="rulebook-modal__overlay" onClick={onClose}>
      <div className="rulebook-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="rulebook-modal__close" onClick={onClose} aria-label="Close rulebook">
          ×
        </button>
        <div className="rulebook-modal__scroll-area">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {rulebookContent}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
