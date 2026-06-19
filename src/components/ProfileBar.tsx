import { useState } from 'react';
import { Profile } from '../types';

interface ProfileBarProps {
  profiles: Profile[];
  activeProfileId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCopyTo: (fromId: string, toId: string) => void;
}

export default function ProfileBar({
  profiles, activeProfileId, onSwitch, onCreate, onDelete, onRename, onCopyTo,
}: ProfileBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [copyFrom, setCopyFrom] = useState<string | null>(null);

  const active = profiles.find((p) => p.id === activeProfileId);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName('');
  }

  function startRename(p: Profile) {
    setRenamingId(p.id);
    setRenameValue(p.name);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      onRename(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }

  return (
    <div className="profile-bar">
      <div className="profile-selector" onClick={() => setShowMenu(!showMenu)}>
        <span className="profile-icon">⚔</span>
        <span className="profile-name">{active?.name ?? 'Select Character'}</span>
        <span className="profile-arrow">▾</span>
      </div>

      {showMenu && (
        <div className="profile-menu">
          <div className="profile-menu-header">Characters</div>
          {profiles.map((p) => (
            <div key={p.id} className={`profile-item ${p.id === activeProfileId ? 'active' : ''}`}>
              {renamingId === p.id ? (
                <input
                  className="profile-rename-input"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); }}
                  autoFocus
                />
              ) : (
                <span className="profile-item-name" onClick={() => { onSwitch(p.id); setShowMenu(false); }}>
                  {p.name}
                </span>
              )}
              <div className="profile-item-actions">
                <button title="Rename" onClick={(e) => { e.stopPropagation(); startRename(p); }}>✎</button>
                <button title="Copy calendar to..." onClick={(e) => { e.stopPropagation(); setCopyFrom(copyFrom === p.id ? null : p.id); }}>⧉</button>
                {profiles.length > 1 && (
                  <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}>×</button>
                )}
              </div>
              {copyFrom === p.id && (
                <div className="copy-targets">
                  <span className="copy-label">Copy to:</span>
                  {profiles.filter((t) => t.id !== p.id).map((t) => (
                    <button
                      key={t.id}
                      className="btn copy-target-btn"
                      onClick={(e) => { e.stopPropagation(); onCopyTo(p.id, t.id); setCopyFrom(null); }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="profile-add">
            <input
              placeholder="New character name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <button className="btn btn-primary" onClick={handleCreate} disabled={!newName.trim()}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
