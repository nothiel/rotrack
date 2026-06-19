import { useState, useRef, useEffect } from 'react';
import { InstanceEvent, INSTANCE_TYPES, COMMON_INSTANCES } from '../types';

interface EventModalProps {
  event: InstanceEvent | null;
  defaultDate: string;
  onSave: (event: InstanceEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, defaultDate, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [instanceType, setInstanceType] = useState(event?.instanceType ?? INSTANCE_TYPES[0]);
  const [date, setDate] = useState(event?.date ?? defaultDate);
  const [time, setTime] = useState(event?.time ?? '');
  const presets = [0, 1, 2, 3, 5, 7];
  const initRepeat = event?.repeatDays ?? 0;
  const isCustom = initRepeat > 0 && !presets.includes(initRepeat);
  const [repeatSelect, setRepeatSelect] = useState(isCustom ? -1 : initRepeat);
  const [customDays, setCustomDays] = useState(isCustom ? initRepeat : 1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const repeatDays = repeatSelect === -1 ? customDays : repeatSelect;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = COMMON_INSTANCES.filter(
    (name) => name.toLowerCase().includes(title.toLowerCase()) && title.length > 0
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: event?.id ?? crypto.randomUUID(),
      title: title.trim(),
      instanceType,
      date,
      time,
      repeatDays,
      completedDates: event?.completedDates ?? [],
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="btn btn-icon" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Instance Name</label>
            <div className="autocomplete-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="e.g. Old Glast Heim"
                required
              />
              {showSuggestions && filtered.length > 0 && (
                <ul className="suggestions">
                  {filtered.map((name) => (
                    <li key={name} onMouseDown={() => { setTitle(name); setShowSuggestions(false); }}>
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Instance Type</label>
            <select value={instanceType} onChange={(e) => setInstanceType(e.target.value)}>
              {INSTANCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Time (optional)</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Repeat</label>
            <div className="repeat-row">
              <select
                value={repeatSelect}
                onChange={(e) => setRepeatSelect(Number(e.target.value))}
              >
                <option value={0}>No repeat</option>
                <option value={1}>Every day</option>
                <option value={2}>Every 2 days</option>
                <option value={3}>Every 3 days</option>
                <option value={5}>Every 5 days</option>
                <option value={7}>Every 7 days</option>
                <option value={-1}>Custom...</option>
              </select>
              {repeatSelect === -1 && (
                <input
                  type="number"
                  min="1"
                  value={customDays}
                  className="repeat-custom"
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (v > 0) setCustomDays(v);
                  }}
                  placeholder="days"
                />
              )}
            </div>
          </div>
          <div className="modal-actions">
            {event && (
              <button type="button" className="btn btn-danger" onClick={() => onDelete(event.id)}>
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
