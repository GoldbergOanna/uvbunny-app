/**
 * Main bunny entity representing a virtual pet bunny
 */
export interface Bunny {
  id: string;
  name: string;
  avatarUrl?: string;
  happiness: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event details for when a bunny is eating
 */
export interface EatingEvent {
  foodType: 'lettuce' | 'carrot';
}

/**
 * Event details for when a bunny is playing
 */
export interface PlayingEvent {
  playmateBunnyId: string;
  isRepeatPlay: boolean;
}

/**
 * Event representing an action performed by a bunny
 */
export interface BunnyEvent {
  id: string;
  bunnyId: string;
  type: 'eating' | 'playing';
  details: EatingEvent | PlayingEvent;
  timestamp: Date;
  pointsEarned: number;
}

/**
 * Configuration for point values awarded for different bunny activities
 */
export interface PointsConfig {
  lettuce: number;
  carrot: number;
  playing: number;
  repeatPlaying: number;
}
