export interface InstanceEvent {
  id: string;
  title: string;
  instanceType: string;
  date: string;
  time: string;
  repeatDays: number;
  completedDates: string[];
}

export interface Profile {
  id: string;
  name: string;
}

export type CalendarView = 'month' | 'week';

export const INSTANCE_TYPES = [
  'Memorial Dungeon',
  'Endless Tower',
  'Raid',
  'Guild Instance',
  'Custom',
] as const;

export const COMMON_INSTANCES = [
  'Old Glast Heim',
  'Endless Tower',
  'Central Laboratory',
  'Nysatora',
  'Horror Toy Factory',
  'Tomb of the Fallen',
  'Infinity Space',
  'Sealed Shrine',
  'Octopus Cave',
  'Bakonawa Lake',
  'Buwaya Cave',
  'Charleston Crisis',
  'Faceworm Nest',
  'Ghost Palace',
  'Geffen Magic Tournament',
  'Heart Hunter War Base',
  'Isle of Bios',
  'Jitterbug',
  'Last Room',
  'Morse Cave',
  'Poring Village',
  'Sara Memory',
  'Sunset Beach',
  'Temple of the Demon God',
  'Werner Laboratory',
];
