import React, { useState, useEffect, useRef } from "react";

const API_URL = "http://localhost:5032/api";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface TimingEvent {
  id: number;
  triggerSignalId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  durationFormatted: string;
  endSignalId: string;
  classificationId: number | null;
  classificationName: string | null;
  createdAt: string;
}

interface Classification {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
  children: Classification[];
}

interface SelectedClassification {
  id: number;
  name: string;
  path: Classification[];
  rootTree: Classification;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const findPath = (
  node: Classification,
  targetId: number,
  path: Classification[]
): Classification[] | null => {
  const next = [...path, node];
  if (node.id === targetId) {return next;}
  for (const c of node.children) {
    const r = findPath(c, targetId, next);
    if (r) {return r;}
  }
  return null;
};

const findInTree = (node: Classification, targetId: number): boolean => {
  if (node.id === targetId) {return true;}
  return node.children.some((c) => findInTree(c, targetId));
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ─── Hierarchy Panel ──────────────────────────────────────────────────────────
// Renders the path as a vertical stepped indented list, like AWS / Jira / Linear

const HierarchyPanel: React.FC<{
  selected: SelectedClassification;
  onClose: () => void;
}> = ({ selected, onClose }) => {
  const { path } = selected;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e4e7f0",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      {/* ── header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #f0f2f8",
          background: "#fafbfe",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* folder-tree icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="6" height="4" rx="1.5" fill="#5b3df5" opacity=".2" />
            <rect x="1" y="2" width="6" height="4" rx="1.5" stroke="#5b3df5" strokeWidth="1.2" />
            <rect x="4" y="8" width="11" height="3" rx="1.5" fill="#5b3df5" opacity=".12" />
            <rect x="4" y="8" width="11" height="3" rx="1.5" stroke="#5b3df5" strokeWidth="1.2" />
            <rect x="4" y="13" width="11" height="3" rx="1.5" fill="#5b3df5" opacity=".12" />
            <rect x="4" y="13" width="11" height="3" rx="1.5" stroke="#5b3df5" strokeWidth="1.2" />
            <line x1="2.5" y1="6" x2="2.5" y2="14.5" stroke="#5b3df5" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2.5" y1="9.5" x2="4" y2="9.5" stroke="#5b3df5" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="2.5" y1="14.5" x2="4" y2="14.5" stroke="#5b3df5" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>
            Classification Hierarchy
          </span>
          <span
            style={{
              fontSize: 11,
              color: "#9ca3af",
              background: "#f3f4f6",
              borderRadius: 4,
              padding: "1px 7px",
              fontWeight: 500,
            }}
          >
            {path.length} {path.length === 1 ? "level" : "levels"} deep
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "1px solid #e4e7f0",
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 12,
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontWeight: 500,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Close
        </button>
      </div>

      {/* ── stepped hierarchy ── */}
      <div style={{ padding: "16px 20px 20px" }}>
        {path.map((node, i) => {
          const isLeaf = i === path.length - 1;
          const isRoot = i === 0;

          return (
            <div
              key={node.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginLeft: i * 24,
                marginBottom: isLeaf ? 0 : 0,
                position: "relative",
              }}
            >
              {/* vertical connector line from previous row */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -16,
                    top: -12,
                    width: 1,
                    height: 24,
                    background: "#e4e7f0",
                  }}
                />
              )}
              {/* horizontal connector */}
              {i > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -16,
                    top: 12,
                    width: 12,
                    height: 1,
                    background: "#e4e7f0",
                  }}
                />
              )}

              {/* node card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: `1px solid ${isLeaf ? "#5b3df5" : isRoot ? "#e4e7f0" : "#e4e7f0"}`,
                  background: isLeaf ? "#5b3df5" : isRoot ? "#fafbfe" : "#fff",
                  width: "fit-content",
                  minWidth: 180,
                  marginBottom: i < path.length - 1 ? 8 : 0,
                  boxShadow: isLeaf
                    ? "0 2px 8px rgba(91,61,245,0.18)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                {/* level icon */}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: isLeaf
                      ? "rgba(255,255,255,0.15)"
                      : isRoot
                      ? "rgba(91,61,245,0.08)"
                      : "rgba(91,61,245,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isRoot ? (
                    // root: database/folder icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <ellipse cx="7" cy="3.5" rx="5" ry="2" stroke={isLeaf ? "#fff" : "#5b3df5"} strokeWidth="1.3" />
                      <path d="M2 3.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke={isLeaf ? "#fff" : "#5b3df5"} strokeWidth="1.3" />
                      <path d="M2 6.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke={isLeaf ? "#fff" : "#5b3df5"} strokeWidth="1.3" />
                    </svg>
                  ) : isLeaf ? (
                    // leaf: tag icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2h5l5 5-5 5-5-5V2z" stroke="#fff" strokeWidth="1.3" strokeLinejoin="round" />
                      <circle cx="5" cy="5" r="1" fill="#fff" />
                    </svg>
                  ) : (
                    // mid: folder icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 4a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1V11a1 1 0 01-1 1H2a1 1 0 01-1-1V4z" stroke="#5b3df5" strokeWidth="1.3" />
                    </svg>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: isLeaf ? 700 : 500,
                      color: isLeaf ? "#fff" : "#1a1a2e",
                      lineHeight: 1.3,
                    }}
                  >
                    {node.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: isLeaf ? "rgba(255,255,255,0.65)" : "#9ca3af",
                      marginTop: 1,
                      fontWeight: 500,
                    }}
                  >
                    {isRoot ? "Root" : isLeaf ? "Selected" : `Level ${i + 1}`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  background: "#f7f8fc",
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: 600,
  color: "#6b7280",
  borderBottom: "1px solid #eaecf3",
  whiteSpace: "nowrap",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "11px 14px",
  borderBottom: "1px solid #f3f4f9",
  verticalAlign: "middle",
  fontSize: "13px",
  color: "#374151",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EventListPage = () => {
  const [events, setEvents] = useState<TimingEvent[]>([]);
  const [categories, setCategories] = useState<Classification[]>([]);
  const [selected, setSelected] = useState<SelectedClassification | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/events`).then((r) => r.json()),
      fetch(`${API_URL}/classification/tree`).then((r) => r.json()),
    ])
      .then(([eventsData, treeData]) => {
        setEvents(eventsData);
        setCategories(treeData);
      })
      .catch((err) => console.error("Failed to fetch:", err));
  }, []);

  const handleClassificationClick = (id: number, name: string) => {
    if (selected?.id === id) {
      setSelected(null);
      return;
    }
    let path: Classification[] | null = null;
    let rootTree: Classification | null = null;
    for (const root of categories) {
      path = findPath(root, id, []);
      if (path) { rootTree = root; break; }
    }
    setSelected({ id, name, path: path ?? [], rootTree: rootTree! });
    setTimeout(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);
  };

  const getTopLevelCategory = (ev: TimingEvent): string => {
    if (!ev.classificationId) { return "Unclassified"; }
    for (const root of categories) {
      if (findInTree(root, ev.classificationId)) { return root.name; }
    }
    return ev.classificationName ?? "Unclassified";
  };

  const grouped: Record<string, TimingEvent[]> = {};
  for (const ev of events) {
    const cat = getTopLevelCategory(ev);
    if (!grouped[cat]) { grouped[cat] = []; }
    grouped[cat].push(ev);
  }

  const totalMs = events.reduce((s, e) => s + e.durationMs, 0);
  const totalMin = Math.round(totalMs / 60000);
  const categoryCount = Object.keys(grouped).length;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f3f4f9",
        padding: "28px 24px",
        boxSizing: "border-box",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── PAGE TITLE ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.03em",
              }}
            >
              Event Log
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9ca3af" }}>
              Timing events grouped by classification category
            </p>
          </div>

          {/* stat row */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Total Events", value: String(events.length) },
              { label: "Categories", value: String(categoryCount) },
              { label: "Total Time", value: `${totalMin.toLocaleString()} min` },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#fff",
                  border: "1px solid #e8eaf2",
                  borderRadius: 10,
                  padding: "8px 16px",
                  textAlign: "right",
                  minWidth: 96,
                }}
              >
                <div style={{ fontSize: 17, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid #e8eaf2",
            overflow: "hidden",
          }}
        >
          {/* table toolbar */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f2f8",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
              All Events
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
                background: "#f3f4f6",
                borderRadius: 5,
                padding: "2px 9px",
                fontWeight: 500,
              }}
            >
              {events.length} rows
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Events</th>
                  <th style={{ ...thStyle, textAlign: "center", borderRight: "1px solid #e8eaf2" }}>
                    Duration
                  </th>
                  <th style={thStyle}>Event ID</th>
                  <th style={thStyle}>Trigger Signal</th>
                  <th style={thStyle}>Start</th>
                  <th style={thStyle}>End</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Classification</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([catName, catEvents]) => {
                  const catMin = Math.round(
                    catEvents.reduce((s, e) => s + e.durationMs, 0) / 60000
                  );
                  return catEvents.map((ev, idx) => {
                    const isActive = selected?.id === ev.classificationId;
                    return (
                      <tr
                        key={ev.id}
                        style={{
                          background: isActive
                            ? "#f5f3ff"
                            : idx % 2 === 0
                            ? "#fff"
                            : "#fafbfe",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* ── category group cells ── */}
                        {idx === 0 && (
                          <>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#374151",
                                background: "#f9fafb",
                                borderRight: "1px solid #f0f2f8",
                                verticalAlign: "top",
                                paddingTop: 14,
                                maxWidth: 140,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#5b3df5",
                                    flexShrink: 0,
                                    display: "inline-block",
                                  }}
                                />
                                {catName}
                              </div>
                            </td>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                textAlign: "center",
                                background: "#f9fafb",
                                borderRight: "1px solid #f0f2f8",
                                verticalAlign: "top",
                                paddingTop: 14,
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  background: "#ede9fd",
                                  color: "#5b3df5",
                                  borderRadius: 5,
                                  padding: "2px 9px",
                                  fontWeight: 700,
                                  fontSize: 12,
                                }}
                              >
                                {catEvents.length}
                              </span>
                            </td>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                textAlign: "center",
                                background: "#f9fafb",
                                borderRight: "1px solid #e8eaf2",
                                verticalAlign: "top",
                                paddingTop: 14,
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#374151",
                              }}
                            >
                              {catMin.toLocaleString()} min
                            </td>
                          </>
                        )}

                        {/* ── event cells ── */}
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              color: "#9ca3af",
                            }}
                          >
                            #{ev.id}
                          </span>
                        </td>

                        <td style={{ ...tdStyle, fontSize: 12 }}>{ev.triggerSignalId}</td>

                        <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: 12, color: "#6b7280" }}>
                          {fmt(ev.startTime)}
                        </td>

                        <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: 12, color: "#6b7280" }}>
                          {fmt(ev.endTime)}
                        </td>

                        <td style={tdStyle}>
                          <span
                            style={{
                              fontVariantNumeric: "tabular-nums",
                              fontSize: 12,
                              color: "#374151",
                              fontWeight: 500,
                            }}
                          >
                            {ev.durationFormatted}
                          </span>
                        </td>

                        {/* ── classification cell ── */}
                        <td style={tdStyle}>
                          {ev.classificationName && ev.classificationId ? (
                            <button
                              onClick={() =>
                                handleClassificationClick(
                                  ev.classificationId!,
                                  ev.classificationName!
                                )
                              }
                              style={{
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                background: isActive ? "#5b3df5" : "#fff",
                                color: isActive ? "#fff" : "#374151",
                                border: `1px solid ${isActive ? "#5b3df5" : "#d1d5db"}`,
                                borderRadius: 6,
                                padding: "4px 10px",
                                fontSize: 12,
                                fontWeight: 500,
                                transition: "all 0.15s",
                                outline: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {ev.classificationName}
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 10 10"
                                fill="none"
                                style={{
                                  transform: isActive ? "rotate(180deg)" : "none",
                                  transition: "transform 0.2s",
                                  opacity: 0.6,
                                  flexShrink: 0,
                                }}
                              >
                                <path
                                  d="M2 3.5L5 6.5L8 3.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#d1d5db" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}

                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "#d1d5db",
                        padding: 48,
                        fontSize: 13,
                      }}
                    >
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── HIERARCHY PANEL ── */}
        {selected && (
          <div ref={panelRef}>
            <HierarchyPanel
              selected={selected}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { EventListPage };
