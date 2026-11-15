import { LEVELS, PLANETS, planetById } from "@/lib/spaceData";

const KEY = "cosmos-survey-progress-v1";

export function levelFromXp(xp = 0) {
  let current = LEVELS[0];
  for (const item of LEVELS) {
    if (xp >= item.xp) current = item;
  }
  return current;
}

export function nextLevelXp(xp = 0) {
  const next = LEVELS.find((item) => item.xp > xp);
  return next ? next.xp : null;
}

export function emptyProgress() {
  return {
    xp: 0,
    discoveries: {},
    missions: [],
    lastResult: null,
    currentMission: null,
  };
}

export function loadProgress() {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    return { ...emptyProgress(), ...parsed };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    /* storage unavailable */
  }
}

export function setCurrentMission(planetId, design, sim) {
  const progress = loadProgress();
  progress.currentMission = { planetId, design, sim, equipment: design.instruments };
  saveProgress(progress);
  return progress;
}

export function recordMission(planetId, foundTargetIds, sim = null) {
  const progress = loadProgress();
  const planet = planetById(planetId);
  const levelBefore = levelFromXp(progress.xp);
  const known = progress.discoveries[planetId] || [];

  const awarded = (planet?.targets || [])
    .filter((target) => foundTargetIds.includes(target.id))
    .map((target) => {
      const isNew = !known.includes(target.id);
      return { targetId: target.id, points: target.points, isNew };
    });

  const gained = awarded.filter((item) => item.isNew).reduce((sum, item) => sum + item.points, 0);
  const newIds = awarded.filter((item) => item.isNew).map((item) => item.targetId);

  progress.discoveries = {
    ...progress.discoveries,
    [planetId]: [...new Set([...known, ...newIds])],
  };
  progress.xp = progress.xp + gained;

  const levelAfter = levelFromXp(progress.xp);
  const result = {
    planetId,
    awarded,
    gained,
    xpBefore: progress.xp - gained,
    xpAfter: progress.xp,
    levelBefore: levelBefore.level,
    levelAfter: levelAfter.level,
    date: new Date().toISOString(),
    equipment: sim?.equipment || [],
    sim,
  };

  progress.missions = [result, ...progress.missions].slice(0, 12);
  progress.lastResult = result;
  progress.currentMission = null;
  saveProgress(progress);
  return result;
}

export function resetProgress() {
  saveProgress(emptyProgress());
}

export const totalPlanetLevel = (planet) => planet.requiredLevel;

export const planetProgress = (progress, planet) => {
  const found = progress?.discoveries?.[planet.id] || [];
  return { found, complete: found.length >= planet.targets.length };
};

export const allPlanets = PLANETS;