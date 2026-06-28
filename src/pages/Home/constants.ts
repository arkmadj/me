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
} as const;

// Physics constants
export const PHYSICS = {
  VELOCITY_MULTIPLIER: 1.5,
  MAX_SPEED: 8,
  MIN_SPEED: 6,
  GRAVITY: 0.001,
  BAT_ANGLE_FACTOR: 2,
} as const;

// Responsive sizing
export const getResponsiveValues = () => {
  const isMobile = window.innerWidth < 768;
  const isLargeScreen = window.innerWidth > 1920;

  return {
    ballSize: isMobile ? 32 : 40,
    batWidth: isMobile ? 80 : window.innerWidth / 6,
    batHeight: 24, // h-6 = 1.5rem = 24px
    moveSpeed: isMobile ? 5 : 7,
    maxSpeed: isLargeScreen ? 8 : 8,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };
};

// Calculate boundaries
export const getBoundaries = (screenWidth: number, screenHeight: number, ballSize: number) => ({
  maxX: screenWidth / 2 - ballSize / 2,
  minX: -screenWidth / 2 + ballSize / 2,
  maxY: screenHeight / 2 - ballSize / 2,
  minY: -screenHeight / 2 + ballSize / 2,
});

// Calculate bat Y position
export const getBatY = (screenHeight: number, batHeight: number) => 
  screenHeight / 2 - 24 - batHeight / 2; // bottom-6 = 1.5rem = 24px from bottom
