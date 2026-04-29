import React, { useState, useEffect , useRef} from 'react';
import { Button, Input } from '@grafana/ui';

type Crew = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
};

export const CrewPage = () => {
  const [crewList, setCrewList] = useState<Crew[]>(() => {
    const saved = localStorage.getItem('crewList');
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('crewList', JSON.stringify(crewList));
  }, [crewList]);


  const addCrew = () => {
    if (!name) {return};

     if (editingId) {
    const updated = crewList.map(c =>
      c.id === editingId
        ? { ...c, name, startTime, endTime }
        : c
    );

    setCrewList(updated);
    setEditingId(null);
    setEditMode(false);
  } 

  else {
    const newCrew: Crew = {
      id: Date.now(),
      name,
      startTime,
      endTime,
    };
    setCrewList([...crewList, newCrew]);
  }
    setName('');
    setStartTime('');
    setEndTime('');

      nameRef.current?.focus();
  };

  const formatTime = (time: string) => {
  if (!time) {return ''};

  const [hour, minute] = time.split(':').map(Number);

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

 return (
  <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
    
    {/* Header */}
    <h2 style={{ marginBottom: '20px' }}>Crew Management</h2>

   
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
      
    
      <Button
        onClick={() => {
           if (crewList.length === 0) {
           alert('Please add a crew member first');
          return;
        }
         setEditMode(!editMode)
         setDeleteMode(false); 
         setEditingId(null);
        }} >
            {editMode && editingId ? 'Cancel Edit' : 'Update'}
      </Button>

   
      <Button
         variant="destructive"
        
         onClick={() => {
                if (crewList.length === 0) {
                   alert('Please add a crew member first');
                    return;
                }
            setDeleteMode(!deleteMode)
            setEditMode(false);
            setEditingId(null);
         }}
      >
          {deleteMode ? 'Cancel' : 'Delete'}
      </Button>

  
      {deleteMode && (
        <Button
          onClick={() => {
            const filtered = crewList.filter(c => {
              if (selectedIds.includes(c.id)) {
                if (!c.startTime || !c.endTime) {
                  alert(`${c.name} cannot be deleted (no timing)`);
                  return true;
                }
                return false;
              }
              return true;
            });

            setCrewList(filtered);
            setSelectedIds([]);
            setDeleteMode(false);
          }}
        >
          Confirm
        </Button>
      )}
    </div>

 
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addCrew();
      }}
      style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '24px',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        background: '#fafafa',
        alignItems: 'center',
      }}
    >
      <Input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.currentTarget.value)}
        ref={nameRef}
        style={{ flex: 2 }}
      />

      <Input
        type="time"
        value={startTime}
        onChange={e => setStartTime(e.currentTarget.value)}
        style={{ flex: 1 }}
      />

      <Input
        type="time"
        value={endTime}
        onChange={e => setEndTime(e.currentTarget.value)}
        style={{ flex: 1 }}
      />

      <Button type="submit">Add</Button>
    </form>

    
    {crewList.length === 0 && (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          border: '1px dashed #ccc',
          borderRadius: '8px',
          color: '#3b3a3a',
        }}
      >
        <h3>No Crew Added</h3>
        <p>Add crew members using the form above</p>
      </div>
    )}

   
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {crewList.map(crew => (
        <div
          key={crew.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderRadius: '8px',
            border: crew.id === editingId 
              ? '2px solid #3b82f6' 
              : '1px solid #e5e7eb',
            background: crew.id === editingId ? '#e0f2fe' : '#fff',
            transition: '0.2s',
          }}
        >
          
       
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {deleteMode && (
              <input
                type="checkbox"
                checked={selectedIds.includes(crew.id)}
                disabled={!crew.startTime || !crew.endTime}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds([...selectedIds, crew.id]);
                  } else {
                    setSelectedIds(selectedIds.filter(id => id !== crew.id));
                  }
                }}
                style={{
                  opacity: !crew.startTime || !crew.endTime ? 0.5 : 1,
                  cursor: !crew.startTime || !crew.endTime ? 'not-allowed' : 'pointer'
                }}
              />
            )}

            <div>
              <div style={{ fontWeight: 700, color: 'black' }}>
                {crew.name}
              </div>

              <div style={{ fontSize: '13px', color: '#323030' }}>
                {crew.startTime || crew.endTime
                    ? `${formatTime(crew.startTime)} - ${formatTime(crew.endTime)}`
                  : 'No timing'}
              </div>
            </div>
          </div>

         
          {editMode && (
            <Button
              size="sm"
              onClick={() => {
                setName(crew.name);
                setStartTime(crew.startTime);
                setEndTime(crew.endTime);
                setEditingId(crew.id);
              }}
            >
              Edit
            </Button>
          )}

        </div>
      ))}
    </div>
  </div>
);
}
