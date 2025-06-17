// DraggableScrollContainer.jsx
import React, { useRef } from 'react';

const DraggableScrollContainer = ({ children }) => {
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    const container = scrollRef.current;
    if (!container) return;

    isDragging.current = true;
    startX.current = e.pageX - container.offsetLeft;
    scrollLeft.current = container.scrollLeft;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const container = scrollRef.current;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 2; // Множитель скорости
    container.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
      style={{
        overflowX: 'auto',
        cursor: 'grab',
        display: 'flex',
        minWidth: 'max-content',
        position: 'relative',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};

export default DraggableScrollContainer;