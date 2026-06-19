import { InstanceEvent } from '../types';

interface EventCardProps {
  event: InstanceEvent;
  displayDate: string;
  onClick: (event: InstanceEvent) => void;
  onToggleComplete: (event: InstanceEvent, date: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Memorial Dungeon': '#1a73e8',
  'Endless Tower': '#e67c00',
  'Raid': '#d93025',
  'Guild Instance': '#188038',
  'Custom': '#7b1fa2',
};

const COMPLETED_COLOR = '#0d8043';

export default function EventCard({ event, displayDate, onClick, onToggleComplete }: EventCardProps) {
  const isCompleted = event.completedDates.includes(displayDate);
  const color = isCompleted ? COMPLETED_COLOR : (TYPE_COLORS[event.instanceType] || '#5f6368');
  const bg = isCompleted ? '#e6f4ea' : '#f0f4ff';

  return (
    <div
      className={`event-card ${isCompleted ? 'event-completed' : ''}`}
      style={{ borderLeft: `3px solid ${color}`, background: bg }}
      onClick={(e) => { e.stopPropagation(); onToggleComplete(event, displayDate); }}
    >
      <span className="event-time">{event.time || ''}</span>
      <span className="event-title">{event.title}</span>
      <button
        className="event-edit-btn"
        onClick={(e) => { e.stopPropagation(); onClick(event); }}
        title="Edit"
      >
        ✎
      </button>
    </div>
  );
}
