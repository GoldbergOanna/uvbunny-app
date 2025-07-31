import { Bunny } from './bunny.model';

export interface DashboardStats {
  averageHappiness: number;
  totalBunnies: number;
  eventsToday: number;
}

export interface ComponentState {
  bunnies: Bunny[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
}
