import React, { forwardRef } from 'react';
import { useSpotlight } from '../../hooks/useSpotlight';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  className = '',
  spotlight = true,
  onMouseMove,
  onMouseLeave,
  ...props
}, forwardedRef) => {
  const { ref: internalRef, onMouseMove: spotlightMove, onMouseLeave: spotlightLeave } = useSpotlight<HTMLDivElement>();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spotlight) spotlightMove(e);
    if (onMouseMove) onMouseMove(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (spotlight) spotlightLeave();
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div
      ref={(node) => {
        (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card relative bg-surface border border-border rounded-lg p-6 transition-all duration-300 ease-out-expo ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';
