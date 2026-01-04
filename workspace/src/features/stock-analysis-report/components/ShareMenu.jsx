import { useState, useRef, useEffect } from 'preact/hooks';

// Inline SVG Icons
const LinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M137.54,186.36a8,8,0,0,1,0,11.31l-9.94,10A56,56,0,0,1,48.38,128.4L72.5,104.28A56,56,0,0,1,149.31,102a8,8,0,1,1-10.64,12,40,40,0,0,0-54.85,1.63L59.7,139.72a40,40,0,0,0,56.58,56.58l9.94-9.94A8,8,0,0,1,137.54,186.36Zm70.08-138a56.08,56.08,0,0,0-79.22,0l-9.94,9.95a8,8,0,0,0,11.32,11.31l9.94-9.94a40,40,0,0,1,56.58,56.58L172.18,140.4A40,40,0,0,1,117.33,142,8,8,0,1,0,106.69,154a56,56,0,0,0,76.81-2.26l24.12-24.12A56.08,56.08,0,0,0,207.62,48.38Z"></path>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
  </svg>
);

const PrinterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M214.67,72H200V40a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8V72H41.33C27.36,72,16,82.77,16,96v80a8,8,0,0,0,8,8H56v32a8,8,0,0,0,8,8H192a8,8,0,0,0,8-8V184h32a8,8,0,0,0,8-8V96C240,82.77,228.64,72,214.67,72ZM72,48H184V72H72ZM184,208H72V160H184Zm40-40H200V152a8,8,0,0,0-8-8H64a8,8,0,0,0-8,8v16H32V96c0-4.41,4.19-8,9.33-8H214.67c5.14,0,9.33,3.59,9.33,8Zm-24-92a12,12,0,1,1-12-12A12,12,0,0,1,200,76Z"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
    <path d="M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V40a8,8,0,0,0-16,0v84.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z"></path>
  </svg>
);

export default function ShareMenu({ symbol, onClose }) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/?proTools=1&analysis=${encodeURIComponent(symbol)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/?proTools=1&analysis=${encodeURIComponent(symbol)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${symbol} Stock Analysis`,
          text: `Check out this analysis for ${symbol}`,
          url: url
        });
        handleClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrint = () => {
    window.print();
    handleClose();
  };

  const handleExportPDF = () => {
    window.print();
    handleClose();
  };

  return (
    <div className={`share-menu ${isOpen ? 'share-menu--open' : ''}`} ref={menuRef}>
      <div className="share-menu__header">
        <span className="share-menu__title">Share Analysis</span>
        <button className="share-menu__close" onClick={handleClose} aria-label="Close">
          ✕
        </button>
      </div>
      
      <div className="share-menu__items">
        <button className="share-menu__item" onClick={handleCopyLink}>
          {copied ? (
            <>
              <CheckIcon />
              <span>Link Copied!</span>
            </>
          ) : (
            <>
              <LinkIcon />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {navigator.share && (
          <button className="share-menu__item" onClick={handleNativeShare}>
            <ShareIcon />
            <span>Share</span>
          </button>
        )}

        <button className="share-menu__item" onClick={handlePrint}>
          <PrinterIcon />
          <span>Print</span>
        </button>

        <button className="share-menu__item" onClick={handleExportPDF}>
          <DownloadIcon />
          <span>Export PDF</span>
        </button>
      </div>
    </div>
  );
}
