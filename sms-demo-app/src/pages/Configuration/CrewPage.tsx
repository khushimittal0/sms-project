import React, { useState, useEffect, type CSSProperties } from "react";

  type Shift = {
    id: number;
    start: string; // "HH:mm"
    end: string;   // "HH:mm"
  };

  type Crew = {
    id: number;
    name: string;
    shifts: Shift[];
 };

  const STORAGE_KEY = "crews";

  const COLOR = {
     primary: "#0d9488",
     primaryDark: "#0f766e",
     primarySoft: "rgba(13,148,136,0.12)",
     danger: "#dc2626",
     dangerSoft: "#fef2f2",
     border: "#e2e8f0",
     borderStrong: "#cbd5e1",
     surface: "#ffffff",
     surfaceMuted: "#f8fafc",
     text: "#0f172a",
     textMuted: "#64748b",
     warn: "#b45309",
     warnSoft: "#fef3c7",
  };

    function toMinutes(time: string) {
      const [h, m] = time.split(":").map(Number);
     return h * 60 + m;
    }

    function format12Hour(time: string) {
      const [h, m] = time.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour = h % 12 || 12;
     return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
    }

    function shiftDuration(start: string, end: string) {
       let mins = toMinutes(end) - toMinutes(start);
        if (mins <= 0) {mins += 24 * 60};
          const h = Math.floor(mins / 60);
          const m = mins % 60;
        if (h === 0) {return `${m}m`};
        if (m === 0) {return `${h}h`};
           return `${h}h ${m}m`;
    }

    function getIntervals(start: string, end: string): Array<[number, number]> {
       const s = toMinutes(start);
         let e = toMinutes(end);
         if (e === s) {return []};
         if (e > s) {return [[s, e]]};
          return [
           [s, 1440],
           [0, e],
       ];
   }

     function intervalsOverlap(a: [number, number], b: [number, number]) {
          return a[0] < b[1] && b[0] < a[1];
      }

     function findOverlap(
        newStart: string,
        newEnd: string,
        existing: Shift[],
        ignoreId?: number
        ): Shift | null {
        const newIvs = getIntervals(newStart, newEnd);
       if (newIvs.length === 0) {return null};
         for (const s of existing) {
           if (s.id === ignoreId) {continue};
            const ivs = getIntervals(s.start, s.end);
             for (const a of newIvs) {
             for (const b of ivs) {
              if (intervalsOverlap(a, b)) {return s};
            }
          }
        }
        return null;
    }

      const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

        export function CrewPage() {
          const [crews, setCrews] = useState<Crew[]>(() => {
          try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? (JSON.parse(saved) as Crew[]) : [];
          } catch {
            return [];
         }
      });

     useEffect(() => {
       localStorage.setItem(STORAGE_KEY, JSON.stringify(crews));
     }, [crews]);

      const [newCrewName, setNewCrewName] = useState("");
      const [selectedCrewId, setSelectedCrewId] = useState<number | null>(null);
      const [shiftInputs, setShiftInputs] = useState<Record<number, {start: string, end: string}>>({});
      const [openAddShift, setOpenAddShift] = useState<Record<number, boolean>>({});
      const [shiftErrors, setShiftErrors] = useState<Record<number, string>>({});
     
 
      const [editingCrewId, setEditingCrewId] = useState<number | null>(null);
      const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
      const [editStart, setEditStart] = useState("");
      const [editEnd, setEditEnd] = useState("");
      const [editError, setEditError] = useState("");

      const [deleteMode, setDeleteMode] = useState(false);
      const [selectedCrewIds, setSelectedCrewIds] = useState<number[]>([]);

      const activeCrewId =
        selectedCrewId !== null && crews.some((c) => c.id === selectedCrewId)
        ? selectedCrewId
        : crews[0]?.id ?? null;
     
   function addCrew() {
     const name = newCrewName.trim();
     if (!name) {return};
     const newCrew: Crew = { id: Date.now(), name, shifts: [] };
     setCrews([...crews, newCrew]);
     setSelectedCrewId(newCrew.id);
     setNewCrewName("");
   }


   function addShift(crewId: number) {
  const input = shiftInputs[crewId];

  if (!input?.start || !input?.end) {
    setShiftErrors({
      ...shiftErrors,
      [crewId]: "Please choose both start and end time.",
    });
    return false;
  }

  if (input.start === input.end) {
    setShiftErrors({
      ...shiftErrors,
      [crewId]: "Start and end time can't be the same.",
    });
    return false;
  }

  const crew = crews.find(c => c.id === crewId);
  if (!crew) {return false};

  const clash = findOverlap(input.start, input.end, crew.shifts);

  if (clash) {
    setShiftErrors({
      ...shiftErrors,
      [crewId]: `This time overlaps with (${format12Hour(
        clash.start
      )} – ${format12Hour(clash.end)})`,
    });
    return false;
  }

  // ✅ SUCCESS CASE
  const newShift: Shift = {
    id: Date.now(),
    start: input.start,
    end: input.end,
  };

  setCrews(
    crews.map(c =>
      c.id === crewId
        ? { ...c, shifts: [...c.shifts, newShift] }
        : c
    )
  );

  setShiftInputs({
    ...shiftInputs,
    [crewId]: { start: "", end: "" }
  });

  setShiftErrors({
    ...shiftErrors,
    [crewId]: ""
  });

  return true;
}


   function deleteShift(crewId: number, shiftId: number) {
     setCrews(
       crews.map((c) =>
         c.id === crewId
           ? { ...c, shifts: c.shifts.filter((s) => s.id !== shiftId) }
           : c
       )
     );
   }

   function startEdit(crewId: number, shift: Shift) {
     setEditingCrewId(crewId);
     setEditingShiftId(shift.id);
     setEditStart(shift.start);
     setEditEnd(shift.end);
     setEditError("");
   }

   function cancelEdit() {
     setEditingCrewId(null);
     setEditingShiftId(null);
     setEditStart("");
     setEditEnd("");
     setEditError("");
   }

   function saveEdit() {
     if (editingCrewId === null || editingShiftId === null) {return};
     setEditError("");

     if (!editStart || !editEnd) {
       setEditError("Please choose both start and end time.");
       return;
     }
     if (editStart === editEnd) {
       setEditError("Start and end time can't be the same.");
       return;
     }

     const crew = crews.find((c) => c.id === editingCrewId);
     if (!crew) {return};

     const clash = findOverlap(editStart, editEnd, crew.shifts, editingShiftId);
     if (clash) {
       setEditError(
         `This time overlaps with another shift (${format12Hour(
           clash.start
         )} – ${format12Hour(clash.end)}).`
       );
       return;
     }

     setCrews(
       crews.map((c) =>
         c.id !== editingCrewId
           ? c
           : {
               ...c,
               shifts: c.shifts.map((s) =>
                 s.id === editingShiftId
                   ? { ...s, start: editStart, end: editEnd }
                   : s
               ),
             }
       )
     );
     cancelEdit();
   }

   return (
     <div style={S.page}>
       <header style={S.header}>
         <div>
           <h1>Crew Scheduler</h1>
         </div>
         <div style={{ flex: 1 }} />
              <button
                  onClick={() => {
                      setDeleteMode(true);
                      setSelectedCrewIds([]);
                     }}
                  style={{
                      background: COLOR.danger,
                      color: "white",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 6,
                      cursor: "pointer",
                   }}
>
                     Delete Crew
                   </button>
       </header>

       <div style={S.controls}>
         <div style={S.controlsGrid}>
           <div>
             <label style={S.fieldLabel }>New crew</label>
             <div style={S.row}>
               <input
                 style={S.input}
                 placeholder="Name"
                 value={newCrewName}
                 onChange={(e) => setNewCrewName(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === "Enter") {addCrew()};
                 }}
               />
               <button style={S.primaryBtn} onClick={addCrew} type="button">
                 + Add crew
               </button>
             </div>
           </div>
         </div>
       </div>

       {crews.length === 0 ? (
         <div style={S.emptyState}>
           <h3 style={S.emptyTitle}>No crews yet</h3>
           <p style={S.emptyText}>
             Add your first crew above to start scheduling shifts.
           </p>
         </div>
       ) : (
         <div style={S.crews}>
             
   {deleteMode && selectedCrewIds.length > 0 && (
      <div style={{ marginBottom: 12, display: "flex", gap: 10 }}>
      
        <button
          onClick={() => {
           setCrews((prev) =>
            prev.filter((c) => !selectedCrewIds.includes(c.id))
          );

          if (selectedCrewIds.includes(selectedCrewId!)) {
            setSelectedCrewId(null);
          }

          setSelectedCrewIds([]);
          setDeleteMode(false);
        }}
        style={{
          background: COLOR.danger,
          color: "white",
          border: "none",
          padding: "8px 14px",
          borderRadius: 6,
        }}
      >
        Delete Selected ({selectedCrewIds.length})
      </button>

      <button
        onClick={() => {
          setDeleteMode(false);
          setSelectedCrewIds([]);
        }}
        style={{
          border: "1px solid #ccc",
          background: "white",
          padding: "8px 14px",
          borderRadius: 6,
        }}
      >
        Cancel
      </button>
    </div>
  )}

          {crews.map((crew) => {
            const isSelected = crew.id === activeCrewId;
            const sortedShifts = [...crew.shifts].sort(
              (a, b) => toMinutes(a.start) - toMinutes(b.start)
            );

            return (
              <div
                key={crew.id}
                style={{
                  ...S.crewCard,
                  ...(isSelected ? S.crewCardSelected : null),
                }}
              >
               
      {deleteMode && (
        <input
          type="checkbox"
          checked={selectedCrewIds.includes(crew.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedCrewIds([...selectedCrewIds, crew.id]);
            } else {
              setSelectedCrewIds(
                selectedCrewIds.filter((id) => id !== crew.id)
              );
            }
          }}
          style={{
            marginBottom: 8,
            width: 16,
            height: 16,
          }}
        />
      )}
                <div style={S.crewHeader}>
                  <button
                    type="button"
                    onClick={() => setSelectedCrewId(crew.id)}
                    style={S.crewNameBtn}
                  >
                    <span style={isSelected ? S.avatarActive : S.avatar}>
                      {crew.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <div style={S.crewName}>{crew.name}</div>
                      <div style={S.crewMeta}>
                        {crew.shifts.length} shift
                        {crew.shifts.length === 1 ? "" : "s"}
                        {isSelected && " · selected"}
                      </div>
                    </span>
                  </button>

                             <div style={{ marginTop: 10 }}>
  {!openAddShift[crew.id] ? (
    <button
      onClick={() =>
        setOpenAddShift({ ...openAddShift, [crew.id]: true })
      }
      style={S.secondaryBtn}
    >
      + Add Shift
    </button>
  ) : (
    <>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="time"
          value={shiftInputs[crew.id]?.start || ""}
          onChange={(e) =>
            setShiftInputs({
              ...shiftInputs,
              [crew.id]: {
                ...shiftInputs[crew.id],
                start: e.target.value,
              },
            })
          }
          style={S.timeInput}
        />

        <span>→</span>

        <input
          type="time"
          value={shiftInputs[crew.id]?.end || ""}
          onChange={(e) =>
            setShiftInputs({
              ...shiftInputs,
              [crew.id]: {
                ...shiftInputs[crew.id],
                end: e.target.value,
              },
            })
          }
          style={S.timeInput}
        />

        <button
          onClick={() => {
            const success = addShift(crew.id);
            if (success) {
              setOpenAddShift({ ...openAddShift, [crew.id]: false });
            }
          }}
          style={S.primaryBtn}
        >
          Add
        </button>

        <button
          onClick={() =>
            setOpenAddShift({ ...openAddShift, [crew.id]: false })
          }
          style={S.cancelBtn}
        >
          Cancel
        </button>
      </div>

      {/* ✅ ERROR */}
      {shiftErrors[crew.id] && (
        <div style={S.errorText}>
          {shiftErrors[crew.id]}
        </div>
      )}
    </>
  )}
</div>

                </div>

                <div style={S.timeline}>
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        ...S.hourLine,
                        left: `${(i / 24) * 100}%`,
                        background:
                          i % 6 === 0 ? COLOR.borderStrong : COLOR.border,
                      }}
                    />
                  ))}

                  {crew.shifts.map((s) => {
                    const startMin = toMinutes(s.start);
                    let endMin = toMinutes(s.end);
                    if (endMin <= startMin) {endMin += 24 * 60};
                    const left = (startMin / 1440) * 100;
                    const width = Math.max(((endMin - startMin) / 1440) * 100, 1.5);

                    return (
                      <div
                        key={s.id}
                        style={{
                          ...S.shiftBlock,
                          left: `${left}%`,
                          width: `${width}%`,
                        }}
                        title={`${format12Hour(s.start)} – ${format12Hour(s.end)}`}
                      >
                        <div>{format12Hour(s.start)}</div>
                        <div style={{ opacity: 0.85 }}>{format12Hour(s.end)}</div>
                      </div>
                    );
                  })}
                </div>

               
                <div style={S.hourLabels}>
                  {HOUR_LABELS.map((h) => (
                    <span
                      key={h}
                      style={{
                        ...S.hourLabel,
                        left: `${(h / 24) * 100}%`,
                      }}
                    >
                      {h.toString().padStart(2, "0")}
                    </span>
                  ))}
                </div>

     

                {sortedShifts.length === 0 ? (
                  <div style={S.noShifts}>
                    No shifts yet. Select this crew and add one above.
                  </div>
                ) : (
                  <div style={S.shiftsList}>
                    {sortedShifts.map((s) => {
                      const isEditing =
                        editingCrewId === crew.id && editingShiftId === s.id;
                      const isOvernight =
                        toMinutes(s.end) <= toMinutes(s.start);

                      if (isEditing) {
                        return (
                          <div key={s.id} style={S.shiftRow}>
                            <div style={S.editRow}>
                              <input
                                type="time"
                                value={editStart}
                                onChange={(e) => setEditStart(e.target.value)}
                                style={S.editInput}
                              />
                              <span style={S.arrow}>→</span>
                              <input
                                type="time"
                                value={editEnd}
                                onChange={(e) => setEditEnd(e.target.value)}
                                style={S.editInput}
                              />
                              <button
                                style={S.saveBtn}
                                onClick={saveEdit}
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                style={S.cancelBtn}
                                onClick={cancelEdit}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                            {editError && (
                              <div style={S.errorText}>{editError}</div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div key={s.id} style={S.shiftRow}>
                          <div style={S.shiftInfo}>
                            <span style={S.shiftTime}>
                              {format12Hour(s.start)} – {format12Hour(s.end)}
                            </span>
                            <span style={S.badge}>
                              {shiftDuration(s.start, s.end)}
                            </span>
                            {isOvernight && (
                              <span style={S.overnightBadge}>overnight</span>
                            )}
                            <span style={{ flex: 1 }} />
                            <button
                              onClick={() => startEdit(crew.id, s)}
                              style={S.editBtn}
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteShift(crew.id, s.id)}
                              style={S.deleteBtn}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}





const S = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 24,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: COLOR.surfaceMuted,
    minHeight: "100vh",
    color: COLOR.text,
  } as CSSProperties,

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 24,
  } as CSSProperties,
  eyebrow: {
    color: COLOR.primary,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  } as CSSProperties,
  title: {
    margin: "6px 0 0",
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  } as CSSProperties,
  subtitle: {
    margin: "6px 0 0",
    color: COLOR.textMuted,
    fontSize: 14,
  } as CSSProperties,

  statsRow: { display: "flex", gap: 10 } as CSSProperties,
  stat: {
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 10,
    padding: "10px 14px",
    minWidth: 88,
  } as CSSProperties,
  statLabel: {
    fontSize: 11,
    color: COLOR.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  } as CSSProperties,
  statValue: {
    fontSize: 22,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    marginTop: 2,
  } as CSSProperties,

  controls: {
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  } as CSSProperties,
  controlsGrid: {
    display: "grid",
    gap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  } as CSSProperties,
  fieldLabel: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 500,
    color: '',
  } as CSSProperties,
  row: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    color:'#000'
  } as CSSProperties,

  input: {
    flex: 1,
    minWidth: 0,
    padding: "10px 14px",
    border: `1px solid ${COLOR.borderStrong}`,
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: COLOR.surface,
    color:"#000"
  } as CSSProperties,
  timeInput: {
    padding: "9px 12px",
    border: `1px solid ${COLOR.borderStrong}`,
    borderRadius: 8,
    fontSize: 14,
    outline: "none",
    background: COLOR.surface,
    color: "#000"
  } as CSSProperties,
  arrow: { color: COLOR.textMuted, fontSize: 16 } as CSSProperties,

  primaryBtn: {
    padding: "10px 16px",
    background: COLOR.primary,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,
  secondaryBtn: {
    padding: "10px 16px",
    background: COLOR.surface,
    color: COLOR.primary,
    border: `1px solid ${COLOR.primary}`,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
  } as CSSProperties,

  errorText: {
    marginTop: 8,
    color: COLOR.danger,
    fontSize: 13,
  } as CSSProperties,

  emptyState: {
    background: COLOR.surface,
    border: `1px dashed ${COLOR.borderStrong}`,
    borderRadius: 12,
    padding: 48,
    textAlign: "center",
  } as CSSProperties,
  emptyTitle: { margin: 0, fontSize: 18, fontWeight: 600 } as CSSProperties,
  emptyText: {
    margin: "6px 0 0",
    color: COLOR.textMuted,
    fontSize: 14,
  } as CSSProperties,

  crews: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  } as CSSProperties,
  crewCard: {
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 12,
    padding: 20,
    transition: "border-color 0.15s, box-shadow 0.15s",
  } as CSSProperties,
  crewCardSelected: {
    borderColor: COLOR.primary,
    boxShadow: `0 0 0 3px ${COLOR.primarySoft}`,
  } as CSSProperties,
  crewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  } as CSSProperties,
  crewNameBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textAlign: "left",
    color: COLOR.text,
  } as CSSProperties,
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#475569",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
  } as CSSProperties,
  avatarActive: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: COLOR.primary,
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
  } as CSSProperties,
  crewName: { fontSize: 16, fontWeight: 600 } as CSSProperties,
  crewMeta: {
    fontSize: 12,
    fontWeight: 400,
    color: COLOR.textMuted,
    marginTop: 2,
  } as CSSProperties,
  iconBtn: {
    width: 32,
    height: 32,
    border: "none",
    background: "transparent",
    color: COLOR.textMuted,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
  } as CSSProperties,

  timeline: {
    position: "relative",
    height: 60,
    border: `1px solid ${COLOR.border}`,
    borderRadius: 8,
    background: "#f1f5f9",
    overflow: "hidden",
  } as CSSProperties,
  hourLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  } as CSSProperties,
  shiftBlock: {
    position: "absolute",
    top: 6,
    bottom: 6,
    background: COLOR.primary,
    color: "white",
    borderRadius: 6,
    fontSize: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: 500,
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(13,148,136,0.3)",
    padding: "0 4px",
  } as CSSProperties,

  hourLabels: {
    position: "relative",
    height: 16,
    marginTop: 4,
    marginBottom: 12,
  } as CSSProperties,
  hourLabel: {
    position: "absolute",
    top: 0,
    transform: "translateX(-50%)",
    fontSize: 10,
    color: "#94a3b8",
    fontVariantNumeric: "tabular-nums",
  } as CSSProperties,

  noShifts: {
    border: `1px dashed ${COLOR.borderStrong}`,
    borderRadius: 8,
    padding: 16,
    textAlign: "center",
    color: COLOR.textMuted,
    fontSize: 13,
  } as CSSProperties,
  shiftsList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  } as CSSProperties,
  shiftRow: {
    border: `1px solid ${COLOR.border}`,
    borderRadius: 8,
    background: COLOR.surfaceMuted,
    padding: "8px 12px",
  } as CSSProperties,
  shiftInfo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  } as CSSProperties,
  shiftTime: {
    fontSize: 14,
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
  } as CSSProperties,
  badge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#e2e8f0",
    color: "#475569",
  } as CSSProperties,
  overnightBadge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 999,
    border: `1px solid ${COLOR.borderStrong}`,
    color: COLOR.textMuted,
  } as CSSProperties,

  editRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  } as CSSProperties,
  editInput: {
    padding: "7px 10px",
    border: `1px solid ${COLOR.primary}`,
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
  } as CSSProperties,
  saveBtn: {
    padding: "7px 14px",
    background: COLOR.primary,
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  } as CSSProperties,
  cancelBtn: {
    padding: "7px 14px",
    background: "transparent",
    color: COLOR.textMuted,
    border: `1px solid ${COLOR.borderStrong}`,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  } as CSSProperties,
  editBtn: {
    padding: "5px 14px",
    background: "transparent",
    color: COLOR.primary,
    border: `1px solid ${COLOR.borderStrong}`,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  } as CSSProperties,
  deleteBtn: {
    padding: "5px 14px",
    background: "transparent",
    color: COLOR.danger,
    border: "1px solid #fecaca",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
  } as CSSProperties,
};
