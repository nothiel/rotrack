import { useState } from 'react';
import { InstanceEvent } from '../types';

interface EventCardProps {
  event: InstanceEvent;
  displayDate: string;
  onClick: (event: InstanceEvent) => void;
  onToggleComplete: (event: InstanceEvent, date: string) => void;
  onReschedule?: (event: InstanceEvent, newDate: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'Memorial Dungeon': '#1a73e8',
  'Endless Tower': '#e67c00',
  'Raid': '#d93025',
  'Guild Instance': '#188038',
  'Custom': '#7b1fa2',
};

const COMPLETED_COLOR = '#0d8043';

export default function EventCard({ event, displayDate, onClick, onToggleComplete, onReschedule }: EventCardProps) {
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState(displayDate);
  const isCompleted = event.completedDates.includes(displayDate);
  const isRecurring = event.repeatDays > 0;
  const color = isCompleted ? COMPLETED_COLOR : (TYPE_COLORS[event.instanceType] || '#5f6368');
  const bg = isCompleted ? '#e6f4ea' : '#f0f4ff';

  return (
    <div
      className={`event-card ${isCompleted ? 'event-completed' : ''}`}
      style={{ borderLeft: `3px solid ${color}`, background: bg }}
      draggable={isRecurring}
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ event, displayDate }));
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={(e) => { e.stopPropagation(); onToggleComplete(event, displayDate); }}
    >
      <span className="event-time">{event.time || ''}</span>
      <span className="event-title">{event.title}</span>
      <div className="event-actions" onClick={(e) => e.stopPropagation()}>
        {isRecurring && onReschedule && (
          <button
            className="event-action-btn"
            onClick={() => {
              setNewDate(displayDate);
              setRescheduling(!rescheduling);
            }}
            title="Reschedule"
          >
            ↷
          </button>
        )}
        <button
          className="event-action-btn"
          onClick={() => onClick(event)}
          title="Edit"
        >
          ✎
        </button>
      </div>
      {rescheduling && (
        <div className="reschedule-picker" onClick={(e) => e.stopPropagation()}>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <button
            className="btn btn-primary reschedule-confirm"
            onClick={() => {
              onReschedule!(event, newDate);
              setRescheduling(false);
            }}
          >
            Move
          </button>
          <button
            className="btn reschedule-cancel"
            onClick={() => setRescheduling(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
