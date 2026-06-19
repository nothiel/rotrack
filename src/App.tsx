import { useState, useCallback, useMemo } from 'react';
import { InstanceEvent, Profile, CalendarView } from './types';
import {
  loadEvents, saveEvents,
  loadProfiles, saveProfiles,
  loadActiveProfileId, saveActiveProfileId,
} from './storage';
import Header from './components/Header';
import ProfileBar from './components/ProfileBar';
import CalendarMonth from './components/CalendarMonth';
import CalendarWeek from './components/CalendarWeek';
import EventModal from './components/EventModal';

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles);
  const [activeProfileId, setActiveProfileId] = useState(loadActiveProfileId);
  const [events, setEvents] = useState<InstanceEvent[]>(() => loadEvents(activeProfileId));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<InstanceEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(toISO(new Date()));

  const expandedEvents = useMemo(() => {
    const rangeStart = new Date(currentDate);
    const rangeEnd = new Date(currentDate);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    if (view === 'month') {
      rangeStart.setDate(1);
      rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());
      rangeEnd.setMonth(rangeEnd.getMonth() + 1, 0);
      rangeEnd.setDate(rangeEnd.getDate() + (6 - rangeEnd.getDay()));
    } else {
      rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());
      rangeEnd.setTime(rangeStart.getTime());
      rangeEnd.setDate(rangeEnd.getDate() + 6);
    }

    const result: InstanceEvent[] = [];
    for (const ev of events) {
      if (!ev.repeatDays || ev.repeatDays <= 0) {
        result.push(ev);
        continue;
      }
      const start = new Date(ev.date + 'T00:00:00');
      const end = ev.repeatEndDate ? new Date(ev.repeatEndDate + 'T23:59:59') : null;
      const cursor = new Date(start);
      if (cursor < rangeStart) {
        const diffDays = Math.floor((rangeStart.getTime() - cursor.getTime()) / 86400000);
        const skipCycles = Math.floor(diffDays / ev.repeatDays);
        cursor.setDate(cursor.getDate() + skipCycles * ev.repeatDays);
      }
      while (cursor <= rangeEnd) {
        if (end && cursor > end) break;
        if (cursor >= rangeStart) {
          result.push({ ...ev, date: toISO(cursor), id: cursor.getTime() === start.getTime() ? ev.id : `${ev.id}_${toISO(cursor)}` });
        }
        cursor.setDate(cursor.getDate() + ev.repeatDays);
      }
    }
    const seen = new Set<string>();
    return result.filter((ev) => {
      const key = `${ev.title}_${ev.date}_${ev.instanceType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [events, currentDate, view]);

  const persist = useCallback((updated: InstanceEvent[]) => {
    setEvents(updated);
    saveEvents(activeProfileId, updated);
  }, [activeProfileId]);

  function handleSwitchProfile(id: string) {
    setActiveProfileId(id);
    saveActiveProfileId(id);
    setEvents(loadEvents(id));
    setModalOpen(false);
    setEditingEvent(null);
  }

  function handleCreateProfile(name: string) {
    const newProfile: Profile = { id: crypto.randomUUID(), name };
    const updated = [...profiles, newProfile];
    setProfiles(updated);
    saveProfiles(updated);
    handleSwitchProfile(newProfile.id);
  }

  function handleDeleteProfile(id: string) {
    if (profiles.length <= 1) return;
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    saveProfiles(updated);
    if (id === activeProfileId) {
      handleSwitchProfile(updated[0].id);
    }
  }

  function handleRenameProfile(id: string, name: string) {
    const updated = profiles.map((p) => p.id === id ? { ...p, name } : p);
    setProfiles(updated);
    saveProfiles(updated);
  }

  function handleCopyCalendar(fromId: string, toId: string) {
    const sourceEvents = loadEvents(fromId);
    const copied = sourceEvents.map((e) => ({ ...e, id: crypto.randomUUID() }));
    const targetEvents = loadEvents(toId);
    const merged = [...targetEvents, ...copied];
    saveEvents(toId, merged);
    if (toId === activeProfileId) {
      setEvents(merged);
    }
  }

  function handleNavigate(direction: -1 | 1) {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === 'month') {
        next.setMonth(next.getMonth() + direction);
      } else {
        next.setDate(next.getDate() + direction * 7);
      }
      return next;
    });
  }

  function handleClearAll() {
    if (window.confirm('Clear all events for this profile?')) {
      persist([]);
    }
  }

  function handleExport() {
    const data = JSON.stringify({ profiles, events, activeProfileId }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(json: string) {
    try {
      const data = JSON.parse(json);
      if (!data.events || !Array.isArray(data.events)) {
        alert('Invalid backup file.');
        return;
      }
      if (!window.confirm('This will replace all your current data. Continue?')) return;
      if (data.profiles && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        saveProfiles(data.profiles);
      }
      const profileId = data.activeProfileId || activeProfileId;
      setActiveProfileId(profileId);
      saveActiveProfileId(profileId);
      setEvents(data.events);
      saveEvents(profileId, data.events);
    } catch {
      alert('Could not read the file. Make sure it\'s a valid ROTrack backup.');
    }
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  function handleDayClick(date: string) {
    setSelectedDate(date);
    setEditingEvent(null);
    setModalOpen(true);
  }

  function handleEventClick(event: InstanceEvent) {
    const originalId = event.id.includes('_') ? event.id.split('_')[0] : event.id;
    const original = events.find((e) => e.id === originalId) ?? event;
    setEditingEvent(original);
    setSelectedDate(original.date);
    setModalOpen(true);
  }

  function handleToggleComplete(displayEvent: InstanceEvent, date: string) {
    const originalId = displayEvent.id.includes('_') ? displayEvent.id.split('_')[0] : displayEvent.id;
    const updated = events.map((e) => {
      if (e.id !== originalId) return e;
      const completed = e.completedDates.includes(date)
        ? e.completedDates.filter((d) => d !== date)
        : [...e.completedDates, date];
      return { ...e, completedDates: completed };
    });
    persist(updated);
  }

  function handleSave(event: InstanceEvent) {
    const exists = events.find((e) => e.id === event.id);
    const updated = exists
      ? events.map((e) => (e.id === event.id ? event : e))
      : [...events, event];
    persist(updated);
    setModalOpen(false);
    setEditingEvent(null);
  }

  function handleDelete(id: string) {
    persist(events.filter((e) => e.id !== id));
    setModalOpen(false);
    setEditingEvent(null);
  }

  function handleReschedule(displayEvent: InstanceEvent, newDate: string) {
    const originalId = displayEvent.id.includes('_') ? displayEvent.id.split('_')[0] : displayEvent.id;
    const original = events.find((e) => e.id === originalId);
    if (!original) return;
    const displayDate = new Date(displayEvent.date + 'T00:00:00');
    const dayBefore = new Date(displayDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const newEvent: InstanceEvent = {
      ...original,
      id: crypto.randomUUID(),
      date: newDate,
      repeatEndDate: undefined,
      completedDates: original.completedDates.filter((d) => d >= newDate),
    };
    const updated = events.map((e) => {
      if (e.id !== originalId) return e;
      return { ...e, repeatEndDate: toISO(dayBefore), completedDates: e.completedDates.filter((d) => d < displayEvent.date) };
    });
    persist([...updated, newEvent]);
  }

  return (
    <div className="app">
      <div className="top-bar">
        <ProfileBar
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSwitch={handleSwitchProfile}
          onCreate={handleCreateProfile}
          onDelete={handleDeleteProfile}
          onRename={handleRenameProfile}
          onCopyTo={handleCopyCalendar}
        />
        <Header
          currentDate={currentDate}
          view={view}
          onViewChange={setView}
          onNavigate={handleNavigate}
          onToday={handleToday}
          onClearAll={handleClearAll}
          onExport={handleExport}
          onImport={handleImport}
        />
      </div>
      <main className="calendar-container">
        {view === 'month' ? (
          <CalendarMonth
            currentDate={currentDate}
            events={expandedEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onToggleComplete={handleToggleComplete}
            onReschedule={handleReschedule}
          />
        ) : (
          <CalendarWeek
            currentDate={currentDate}
            events={expandedEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onToggleComplete={handleToggleComplete}
            onReschedule={handleReschedule}
          />
        )}
      </main>
      {modalOpen && (
        <EventModal
          event={editingEvent}
          defaultDate={selectedDate}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => { setModalOpen(false); setEditingEvent(null); }}
        />
      )}
    </div>
  );
}
