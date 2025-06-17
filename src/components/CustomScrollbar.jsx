// CustomScrollbar.jsx
import React, { useRef, useEffect } from 'react';
import '../pages/CustomScrollbar.css';

const CustomScrollbar = ({ children }) => {
  const containerRef = useRef(null);
  const thumbRef = useRef(null);

  const updateThumbPosition = () => {
    const container = containerRef.current;
    if (!container || !thumbRef.current) return;

    const totalScroll = container.scrollWidth - container.clientWidth;
    if (totalScroll <= 0) return;

    const thumbWidth = (container.clientWidth / container.scrollWidth) * container.clientWidth;
    const scrollRatio = container.scrollLeft / totalScroll;

    thumbRef.current.style.width = `${thumbWidth}px`;
    thumbRef.current.style.left = `${scrollRatio * (container.clientWidth - thumbWidth)}px`;
  };

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => updateThumbPosition();
    window.addEventListener('resize', updateThumbPosition);
    updateThumbPosition();

    return () => {
      window.removeEventListener('resize', updateThumbPosition);
    };
  }, []);

  const handleThumbClick = (e) => {
    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newScrollLeft = (clickX / rect.width) * (container.scrollWidth - container.clientWidth);
    container.scrollLeft = newScrollLeft;
  };

  return (
    <div className="scroll-container">
      <div ref={containerRef} className="funnel-wrapper">
        {children}
      </div>
      <div className="custom-scrollbar" onClick={handleThumbClick}>
        <div ref={thumbRef} className="custom-scrollbar-thumb" />
      </div>
    </div>
  );
};

export default CustomScrollbar;