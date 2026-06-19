import { CalendarView } from '../types';

interface HeaderProps {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  onClearAll: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getWeekRange(date: Date): string {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) => `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

export default function Header({ currentDate, view, onViewChange, onNavigate, onToday, onClearAll }: HeaderProps) {
  const title = view === 'month'
    ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : getWeekRange(currentDate);

  return (
    <header className="header">
      <div className="header-left">
        <button className="btn" onClick={onToday}>Today</button>
        <button className="btn btn-icon" onClick={() => onNavigate(-1)}>‹</button>
        <button className="btn btn-icon" onClick={() => onNavigate(1)}>›</button>
        <h1 className="header-title">{title}</h1>
        <button className="btn btn-danger" onClick={onClearAll}>Clear All</button>
      </div>
      <div className="header-right">
        <div className="view-toggle">
          <button
            className={`btn ${view === 'week' ? 'btn-active' : ''}`}
            onClick={() => onViewChange('week')}
          >
            Week
          </button>
          <button
            className={`btn ${view === 'month' ? 'btn-active' : ''}`}
            onClick={() => onViewChange('month')}
          >
            Month
          </button>
        </div>
      </div>
    </header>
  );
}
