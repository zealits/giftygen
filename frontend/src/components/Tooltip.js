import React, { useState, useRef, useEffect } from 'react';
import './Tooltip.css';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 300,
  className = '',
  disabled = false,
  maxWidth = '300px'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef(null);
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (disabled || !content) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Position calculation to prevent tooltip from going off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if tooltip goes off right edge
      if (triggerRect.left + tooltipRect.width > viewport.width - 20) {
        if (position === 'top' || position === 'bottom') {
          newPosition = position + '-left';
        } else if (position === 'right') {
          newPosition = 'left';
        }
      }

      // Check if tooltip goes off left edge
      if (triggerRect.left - tooltipRect.width < 20) {
        if (position === 'top' || position === 'bottom') {
          newPosition = position + '-right';
        } else if (position === 'left') {
          newPosition = 'right';
        }
      }

      // Check if tooltip goes off top edge
      if (triggerRect.top - tooltipRect.height < 20) {
        if (position === 'top') {
          newPosition = 'bottom';
        }
      }

      // Check if tooltip goes off bottom edge
      if (triggerRect.bottom + tooltipRect.height > viewport.height - 20) {
        if (position === 'bottom') {
          newPosition = 'top';
        }
      }

      setActualPosition(newPosition);
    }
  }, [isVisible, position]);

  if (!content) return children;

  return (
    <div 
      className={`tooltip-container ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      ref={triggerRef}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip--${actualPosition}`}
          style={{ maxWidth }}
          role="tooltip"
          aria-live="polite"
        >
          <div className="tooltip-content">
            {typeof content === 'string' ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              content
            )}
          </div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

// Field tooltip specifically for form labels
export const FieldTooltip = ({ tooltip, className = '' }) => {
  if (!tooltip) return null;

  return (
    <Tooltip content={tooltip} position="top" className={`field-tooltip ${className}`}>
      <span className="field-tooltip-icon" tabIndex={0}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 11V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="8" cy="5.5" r="0.5" fill="currentColor"/>
        </svg>
      </span>
    </Tooltip>
  );
};

export default Tooltip;