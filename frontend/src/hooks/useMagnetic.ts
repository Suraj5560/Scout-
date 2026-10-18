import { useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

export function useMagnetic(strength: number = 8, activeDistance: number = 80) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distX = e.clientX - centerX;
    const distY = e.clientY - centerY;
    const dist = Math.sqrt(distX * distX + distY * distY);

    if (dist < activeDistance) {
      const powerX = (distX / (rect.width / 2)) * strength;
      const powerY = (distY / (rect.height / 2)) * strength;
      x.set(Math.max(-strength, Math.min(strength, powerX)));
      y.set(Math.max(-strength, Math.min(strength, powerY)));
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    x: springX,
    y: springY,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
  };
}
