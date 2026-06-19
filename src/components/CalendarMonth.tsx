import { InstanceEvent } from '../types';
import EventCard from './EventCard';

interface CalendarMonthProps {
  currentDate: Date;
  events: InstanceEvent[];
  onDayClick: (date: string) => void;
  onEventClick: (event: InstanceEvent) => void;
  onToggleComplete: (event: InstanceEvent, date: string) => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarMonth({ currentDate, events, onDayClick, onEventClick, onToggleComplete }: CalendarMonthProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();

  const cells: Date[] = [];

  // Fill leading days from previous month
  for (let i = 0; i < firstDay.getDay(); i++) {
    const d = new Date(year, month, -firstDay.getDay() + i + 1);
    cells.push(d);
  }

  // Days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    cells.push(new Date(year, month, i));
  }

  // Fill trailing days
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1];
    const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
    cells.push(next);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="calendar-month">
      <div className="calendar-day-headers">
        {DAY_NAMES.map((name) => (
          <div key={name} className="day-header">{name}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="calendar-week-row">
          {week.map((day) => {
            const iso = toISO(day);
            const isCurrentMonth = day.getMonth() === month;
            const isToday = isSameDay(day, today);
            const dayEvents = events.filter((e) => e.date === iso);

            return (
              <div
                key={iso}
                className={`calendar-cell ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}`}
                onClick={() => onDayClick(iso)}
              >
                <span className={`cell-date ${isToday ? 'today-badge' : ''}`}>{day.getDate()}</span>
                <div className="cell-events">
                  {dayEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} displayDate={iso} onClick={onEventClick} onToggleComplete={onToggleComplete} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
