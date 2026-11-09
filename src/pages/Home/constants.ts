// Game constants and configuration
export const WELCOME_TEXT = "WELCOME TO THE MAYTRICKS";
export const INTRO_TEXT = "Hello, I am Ahmad Jinadu";

// Animation timings
export const ANIMATION_TIMINGS = {
  INTRO_DELAY: 600,
  INTRO_DURATION: 2000,
  CHAR_START: 2500,
  CHAR_DELAY: 50,
  CHAR_DURATION: 50,
  WELCOME_COMPLETE: 3750, // Calculated from: 2500 + (24 * 50) + 50
  CONTROLS_HINT_DURATION: 3500,
} as const;

// Physics constants
export const PHYSICS = {
  VELOCITY_MULTIPLIER: 1.5,
  MAX_SPEED: 9.5,
  MIN_SPEED: 7,
  GRAVITY: 0.001,
  BAT_ANGLE_FACTOR: 2,
} as const;

// Velocities above are tuned in px per 60Hz frame. Movement is scaled by
// elapsed time relative to this so speed is the same at any refresh rate.
export const FRAME_MS = 1000 / 60;
// Cap a single step (e.g. after a dropped frame or a backgrounded tab) so the
// ball can't jump far enough to skip collisions. 3 frames * MAX_SPEED (28.5px)
// stays below the ball size.
export const MAX_FRAME_SCALE = 3;

// Responsive sizing
export type ResponsiveValues = Readonly<{
  ballSize: number;
  batWidth: number;
  batHeight: number;
  moveSpeed: number;
  screenWidth: number;
  screenHeight: number;
}>;

const computeResponsiveValues = (): ResponsiveValues => {
  const width = window.innerWidth;
  const isMobile = width < 768;

  return Object.freeze({
    ballSize: isMobile ? 32 : 40,
    batWidth: isMobile ? 80 : width / 6,
    batHeight: 24, // h-6 = 1.5rem = 24px
    moveSpeed: isMobile ? 6 : 8.5,
    screenWidth: width,
    screenHeight: window.innerHeight,
  });
};

// Called several times per animation frame, so cache the result and only
// recompute when the viewport changes instead of re-reading window each call.
let responsiveValues: ResponsiveValues | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    responsiveValues = null;
  });
}

export const getResponsiveValues = (): ResponsiveValues =>
  (responsiveValues ??= computeResponsiveValues());

// Calculate boundaries
export const getBoundaries = (screenWidth: number, screenHeight: number, ballSize: number) => ({
  maxX: screenWidth / 2 - ballSize / 2,
  minX: -screenWidth / 2 + ballSize / 2,
  maxY: screenHeight / 2 - ballSize / 2,
  minY: -screenHeight / 2 + ballSize / 2,
});

// Gap between the bat and the bottom of the screen (bottom-6 = 1.5rem = 24px)
export const BAT_BOTTOM_OFFSET = 24;

// Calculate bat Y position
export const getBatY = (screenHeight: number, batHeight: number) =>
  screenHeight / 2 - BAT_BOTTOM_OFFSET - batHeight / 2;
