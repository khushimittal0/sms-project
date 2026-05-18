import React, { useRef, useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const API_URL = "http://localhost:5032/api";
const MACHINE = "SAMC";
const DELAY_COLOR = "#5b3df5";
const EVENT_COLOR = "rgba(91, 61, 245, 0.25)";
const EVENT_BORDER = "#5b3df5";

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

// ── Styles ───────────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

export function DelayManagerPage() {
  const barChartRef = useRef(null);
  const eventsChartRef = useRef(null);
  const [events, setEvents] = useState<TimingEvent[]>([]);
  const [categories, setCategories] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/events`).then((r) => r.json()),
      fetch(`${API_URL}/classification/tree`).then((r) => r.json()),
    ])
      .then(([eventsData, treeData]) => {
        setEvents(eventsData);
        setCategories(treeData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch data:", err);
        setLoading(false);
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

  // ── Chart data ─────────────────────────────────────────────────────────────
  const categoryNames = categories.map((c) => c.name);
  const categoryDurations = categoryNames.map((catName) => {
    const catEvents = events.filter((e) => getTopLevelCategory(e) === catName);
    const totalMs = catEvents.reduce((sum, e) => sum + e.durationMs, 0);
    return Math.round(totalMs / 60000);
  });

  const timeLabels = events.map((e) => {
    const d = new Date(e.startTime);
    return d.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  });
  const durations = events.map((e) => Math.round(e.durationMs / 1000));

  // ── Combined table: group events by top-level category ─────────────────────
  const groupedByCategory: Record<string, TimingEvent[]> = {};
  for (const event of events) {
    const cat = getTopLevelCategory(event);
    if (!groupedByCategory[cat]) {groupedByCategory[cat] = [];}
    groupedByCategory[cat].push(event);
  }

  // ── ECharts options ────────────────────────────────────────────────────────
  const barOption = {
    grid: { top: 50, bottom: 20, left: 120, right: 80 },
    legend: {
      data: [MACHINE],
      top: 10,
      left: "center",
      itemWidth: 20,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: "#333" },
      icon: "rect",
    },
    xAxis: { type: "value", show: false },
    yAxis: {
      type: "category",
      data: categoryNames.length > 0 ? categoryNames : ["No Data"],
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: { fontSize: 11, color: "#555", align: "right" },
    },
    series: [
      {
        name: MACHINE,
        type: "bar",
        data: categoryDurations.length > 0 ? categoryDurations : [0],
        barWidth: 18,
        itemStyle: { color: DELAY_COLOR, borderRadius: 2 },
        label: {
          show: true,
          position: "right",
          formatter: (params: { value: number }) =>
            params.value === 0
              ? "0 min"
              : `${params.value.toLocaleString()} min`,
          fontSize: 11,
          color: "#333",
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (
        params: Array<{ seriesName: string; name: string; value: number }>
      ) => {
        const p = params[0];
        return `${p.seriesName}<br/>${p.name}: ${p.value.toLocaleString()} min`;
      },
    },
  };

  const eventsOption = {
    grid: { top: 20, bottom: 60, left: 60, right: 30 },
    dataZoom: [
      {
        type: "slider",
        bottom: 10,
        height: 20,
        fillerColor: "rgba(180, 195, 235, 0.3)",
        borderColor: "#c5cfe8",
        handleStyle: { color: "#8fa8d8" },
        textStyle: { color: "transparent" },
        start: 0,
        end: 100,
      },
    ],
    xAxis: {
      type: "category",
      data: timeLabels,
      axisLabel: { fontSize: 10, color: "#666", rotate: 0 },
      axisLine: { lineStyle: { color: "#ccc" } },
      axisTick: { show: true, lineStyle: { color: "#ccc" } },
      splitLine: {
        show: true,
        lineStyle: { color: "#e8ecf2", type: "solid" },
      },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: MACHINE,
        type: "bar",
        data: durations,
        barWidth: 22,
        itemStyle: {
          color: EVENT_COLOR,
          borderColor: EVENT_BORDER,
          borderWidth: 1,
          borderRadius: 2,
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ dataIndex: number; value: number }>) => {
        const p = params[0];
        const event = events[p.dataIndex];
        return `${event?.classificationName || "Unclassified"}<br/>Duration: ${
          event?.durationFormatted || p.value + "s"
        }`;
      },
    },
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
        Loading events from backend...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#eef1f5",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* ── BAR CHART CARD ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e6e9ef",
          }}
        >
          <div style={{ height: 160 }}>
            <ReactECharts
              ref={barChartRef}
              option={barOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* ── EVENTS TIMELINE CARD ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: "10px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e6e9ef",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#333" }}>
              Events Timeline ({events.length} events from API)
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#777",
                background: "#f1f3f7",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              {MACHINE}
            </div>
          </div>
          <div style={{ height: 260 }}>
            <ReactECharts
              ref={eventsChartRef}
              option={eventsOption}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>

        {/* ── COMBINED TABLE CARD ── */}
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
}
