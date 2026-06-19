import { InstanceEvent, Profile } from './types';

const PROFILES_KEY = 'ro-profiles';
const ACTIVE_PROFILE_KEY = 'ro-active-profile';
const DEFAULT_PROFILE: Profile = { id: 'default', name: 'Main Character' };

function eventsKey(profileId: string): string {
  if (profileId === 'default') return 'ro-instance-events';
  return `ro-instance-events-${profileId}`;
}

export function loadProfiles(): Profile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [DEFAULT_PROFILE];
  try {
    const profiles = JSON.parse(raw) as Profile[];
    return profiles.length > 0 ? profiles : [DEFAULT_PROFILE];
  } catch {
    return [DEFAULT_PROFILE];
  }
}

export function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadActiveProfileId(): string {
  return localStorage.getItem(ACTIVE_PROFILE_KEY) || 'default';
}

export function saveActiveProfileId(id: string) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function loadEvents(profileId: string): InstanceEvent[] {
  const raw = localStorage.getItem(eventsKey(profileId));
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as InstanceEvent[]).map((e) => ({
      ...e,
      repeatDays: e.repeatDays ?? 0,
      completedDates: e.completedDates ?? [],
    }));
  } catch {
    return [];
  }
}

export function saveEvents(profileId: string, events: InstanceEvent[]) {
  localStorage.setItem(eventsKey(profileId), JSON.stringify(events));
}
