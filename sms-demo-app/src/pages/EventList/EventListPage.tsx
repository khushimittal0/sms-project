import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5032/api";

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

const PURPLE = "#5b3df5";

const thStyle: React.CSSProperties = {
  background: "#f4f5fa",
  padding: "8px 12px",
  textAlign: "left",
  fontWeight: 600,
  color: "#5b3df5",
  borderBottom: "2px solid #e0e3ef",
  whiteSpace: "nowrap",
  fontSize: "12px",
};

const tdStyle: React.CSSProperties = {
  padding: "7px 12px",
  borderBottom: "1px solid #eef0f5",
  verticalAlign: "middle",
  fontSize: "12px",
  color: "#333",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(91,61,245,0.1)",
  color: "#5b3df5",
  borderRadius: "4px",
  padding: "2px 7px",
  fontWeight: 600,
  fontSize: "11px",
};

const EventListPage = () => {
  const [events, setEvents] = useState<TimingEvent[]>([]);
  const [categories, setCategories] = useState<Classification[]>([]);
  
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/events`).then((r) => r.json()),
      fetch(`${API_URL}/classification/tree`).then((r) => r.json()),
    ])
      .then(([eventsData, treeData]) => {
        setEvents(eventsData);
        setCategories(treeData);
        //setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch:", err); 
      });
  }, []);

  const findInTree = (node: Classification, targetId: number): boolean => {
    if (node.id === targetId) {return true;}
    for (const child of node.children) {
      if (findInTree(child, targetId)) {return true;}
    }
    return false;
  };

  const getTopLevelCategory = (event: TimingEvent): string => {
    if (!event.classificationId) {return "Unclassified";}
    for (const root of categories) {
      if (findInTree(root, event.classificationId)) {return root.name;}
    }
    return event.classificationName || "Unclassified";
  };

  const groupedByCategory: Record<string, TimingEvent[]> = {};
  for (const event of events) {
    const cat = getTopLevelCategory(event);
    if (!groupedByCategory[cat]) {
      groupedByCategory[cat] = [];
    }
    groupedByCategory[cat].push(event);
  }

  const totalDurationMs = events.reduce((s, e) => s + e.durationMs, 0);
  const totalMin = Math.round(totalDurationMs / 60000); 
  const categoryCount = Object.keys(groupedByCategory).length;
 
  return (
    <div style={{ 
                width: "100%", 
                minHeight: "100vh", 
                background: "#f0f2f7", 
                padding: "24px", 
                boxSizing: "border-box", 
                fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* PAGE HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {[
              { label: "Total Events", value: events.length },
              { label: "Categories", value: categoryCount },
              { label: "Total Duration", value: `${totalMin.toLocaleString()} min` },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "#fff", border: "1px solid #e4e7f0",
                borderRadius: "8px", padding: "8px 16px", textAlign: "center", minWidth: "100px",
              }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: PURPLE }}>{stat.value}</div>
                <div style={{ 
                            fontSize: "10px", 
                            color: "#9ca3af", 
                            marginTop: "2px", 
                            textTransform: "uppercase", 
                            letterSpacing: "0.05em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMBINED TABLE — always renders */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e6e9ef",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
              Category &amp; Events Detail
            </div>
            <span style={badgeStyle}>{events.length} total events</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {/* Category summary columns */}
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Total Events
                  </th>
                  <th style={{ ...thStyle, textAlign: "center" }}>
                    Total Duration
                  </th>
                  {/* Divider */}
                  <th
                    style={{
                      ...thStyle,
                      borderLeft: "2px solid #c5c8e0",
                    }}
                  >
                    Event ID
                  </th>
                  <th style={thStyle}>Trigger Signal</th>
                  <th style={thStyle}>Start Time</th>
                  <th style={thStyle}>End Time</th>
                  <th style={thStyle}>Duration</th>
                  <th style={thStyle}>Classification</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedByCategory).map(
                  ([catName, catEvents]) => {
                    const totalMs = catEvents.reduce(
                      (s, e) => s + e.durationMs,
                      0
                    );
                    const totalMin = Math.round(totalMs / 60000);

                    return catEvents.map((event, idx) => (
                      <tr
                        key={event.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafbfd",
                        }}
                      >
                        {/* rowSpan cells — only rendered on first row of each group */}
                        {idx === 0 && (
                          <>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                fontWeight: 700,
                                color: "#5b3df5",
                                background: "#f7f5ff",
                                borderRight: "1px solid #e0e3ef",
                                verticalAlign: "top",
                                paddingTop: "10px",
                              }}
                            >
                              {catName}
                            </td>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                textAlign: "center",
                                background: "#f7f5ff",
                                borderRight: "1px solid #e0e3ef",
                                verticalAlign: "top",
                                paddingTop: "10px",
                              }}
                            >
                              <span style={badgeStyle}>{catEvents.length}</span>
                            </td>
                            <td
                              rowSpan={catEvents.length}
                              style={{
                                ...tdStyle,
                                textAlign: "center",
                                background: "#f7f5ff",
                                borderRight: "2px solid #c5c8e0",
                                verticalAlign: "top",
                                paddingTop: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {totalMin.toLocaleString()} min
                            </td>
                          </>
                        )}

                        {/* Per-event detail columns */}
                        <td
                          style={{
                            ...tdStyle,
                            borderLeft: "2px solid #c5c8e0",
                          }}
                        >
                          {event.id}
                        </td>
                        <td style={tdStyle}>{event.triggerSignalId}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {new Date(event.startTime).toLocaleString("en-IN")}
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {new Date(event.endTime).toLocaleString("en-IN")}
                        </td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                          {event.durationFormatted}
                        </td>
                        <td style={tdStyle}>
                          {event.classificationName ?? (
                            <span
                              style={{ color: "#aaa", fontStyle: "italic" }}
                            >
                              Unclassified
                            </span>
                          )}
                        </td>
                      </tr>
                    ));
                  }
                )}

                {events.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                        color: "#aaa",
                        padding: "24px",
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
        </div>
      </div>
  );
};

export  {EventListPage};
