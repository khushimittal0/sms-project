import React, { useRef, useState, useEffect, useCallback } from "react";
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

export function DelayManagerPage() {
  const barChartRef = useRef(null);
  const eventsChartRef = useRef(null);
  const [events, setEvents] = useState<TimingEvent[]>([]);
  const [categories, setCategories] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ref-based fetcher — stable reference, no setState called directly in effect body
  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [eventsData, treeData] = await Promise.all([
        fetch(`${API_URL}/events`).then((r) => r.json()),
        fetch(`${API_URL}/classification/tree`).then((r) => r.json()),
      ]);
      setEvents(eventsData);
      setCategories(treeData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

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
            params.value === 0 ? "0 min" : `${params.value.toLocaleString()} min`,
          fontSize: 11,
          color: "#333",
        },
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ seriesName: string; name: string; value: number }>) => {
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
      splitLine: { show: true, lineStyle: { color: "#e8ecf2", type: "solid" } },
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
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

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
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              {/* ── REFRESH BUTTON ── */}
              <button
                onClick={() => fetchData()}
                disabled={refreshing}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  fontSize: "12px",
                  color: "#5b3df5",
                  background: "#f0eeff",
                  border: "1px solid #d4c8fc",
                  borderRadius: "6px",
                  cursor: refreshing ? "not-allowed" : "pointer",
                  opacity: refreshing ? 0.7 : 1,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    animation: refreshing ? "spin 0.8s linear infinite" : "none",
                  }}
                >
                  ↻
                </span>
                {refreshing ? "Loading..." : "Refresh"}
              </button>
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
      </div>
    </div>
  );
}
