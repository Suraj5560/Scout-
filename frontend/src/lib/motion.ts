export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const DURATIONS = {
  micro: 0.18, // 120-200ms
  ui: 0.38,    // 300-450ms
  reveal: 0.9, // 700-1000ms
  stagger: 0.06 // 40-80ms
};

export const SPRINGS = {
  snappy: {
    type: "spring" as const,
    stiffness: 300,
    damping: 20
  },
  gentle: {
    type: "spring" as const,
    stiffness: 140,
    damping: 18
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 15
  }
};

export const cardEntrance = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 22
    }
  },
  exit: { opacity: 0, scale: 0.96, transition: { duration: DURATIONS.micro } }
};

export const splitLineReveal = {
  initial: { y: "110%", opacity: 0 },
  animate: (custom: number = 0) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: DURATIONS.reveal,
      ease: EASE_OUT_EXPO,
      delay: custom * DURATIONS.stagger
    }
  })
};

export const serifWordFade = {
  initial: { opacity: 0, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: DURATIONS.reveal,
      ease: EASE_OUT_EXPO,
      delay: 0.15
    }
  }
};
