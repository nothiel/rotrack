import { InstanceEvent } from '../types';
import EventCard from './EventCard';

interface CalendarWeekProps {
  currentDate: Date;
  events: InstanceEvent[];
  onDayClick: (date: string) => void;
  onEventClick: (event: InstanceEvent) => void;
  onToggleComplete: (event: InstanceEvent, date: string) => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarWeek({ currentDate, events, onDayClick, onEventClick, onToggleComplete }: CalendarWeekProps) {
  const today = new Date();
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  return (
    <div className="calendar-week">
      {days.map((day) => {
        const iso = toISO(day);
        const isToday = isSameDay(day, today);
        const dayEvents = events
          .filter((e) => e.date === iso)
          .sort((a, b) => a.time.localeCompare(b.time));

        return (
          <div
            key={iso}
            className={`week-day-column ${isToday ? 'today' : ''}`}
            onClick={() => onDayClick(iso)}
          >
            <div className="week-day-header">
              <span className="week-day-name">{DAY_NAMES[day.getDay()]}</span>
              <span className={`week-day-number ${isToday ? 'today-badge' : ''}`}>
                {MONTH_NAMES_SHORT[day.getMonth()]} {day.getDate()}
              </span>
            </div>
            <div className="week-day-events">
              {dayEvents.length === 0 && (
                <div className="week-empty">No events</div>
              )}
              {dayEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} displayDate={iso} onClick={onEventClick} onToggleComplete={onToggleComplete} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
