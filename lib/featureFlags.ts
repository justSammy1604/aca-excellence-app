// Centralized feature flags for optional UI/logic blocks.
// Toggle to quickly enable/disable experimental mock-only features.
// In production, these could map to remote config or LaunchDarkly style providers.

export type FeatureFlags = {
  profileDrawer: boolean;
  streakTracker: boolean;
  achievements: boolean;
  motivationalTip: boolean;
  syntheticAssignments: boolean;
  gradeProjection: boolean;
  riskHeatmap: boolean;
  resourceTagging: boolean;
  resourceFavorites: boolean;
  resourceVoting: boolean;
  nudgeCategories: boolean;
  nudgeSnoozeDismiss: boolean;
  nudgeTimeline: boolean;
  skeletonLoaders: boolean;
  toastSystem: boolean;
  commandPalette: boolean;
  eventLog: boolean;
  studyTimer: boolean;
  notesScratchpad: boolean;
  weeklyPlanner: boolean;
};

export const featureFlags: FeatureFlags = {
  profileDrawer: true,
  streakTracker: true,
  achievements: true,
  motivationalTip: true,
  syntheticAssignments: true,
  gradeProjection: true,
  riskHeatmap: true,
  resourceTagging: true,
  resourceFavorites: true,
  resourceVoting: true,
  nudgeCategories: true,
  nudgeSnoozeDismiss: true,
  nudgeTimeline: true,
  skeletonLoaders: true,
  toastSystem: true,
  commandPalette: true,
  eventLog: true,
  studyTimer: true,
  notesScratchpad: true,
  weeklyPlanner: true,
};

export function isFeatureEnabled<K extends keyof FeatureFlags>(key: K): boolean {
  return !!featureFlags[key];
}
