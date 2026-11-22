// Site-wide feature switches.
// Offline (in-person) courses are hidden everywhere for now — the system and data stay;
// set this to true to bring offline courses, filters and options back.
export const OFFLINE_ENABLED = false;

/** Drop Offline-type courses while offline is switched off. */
export const visibleCourses = (list) =>
  OFFLINE_ENABLED || !Array.isArray(list) ? list : list.filter((c) => c?.type !== "Offline");
