// Shared types for the Home page game

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface CharacterPosition extends Position {
  rotation: number;
}

export interface CharacterVelocity extends Velocity {
  vr: number;
}

export interface BallBounds {
  bottom: number;
  top: number;
  left: number;
  right: number;
}

export interface BatBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
