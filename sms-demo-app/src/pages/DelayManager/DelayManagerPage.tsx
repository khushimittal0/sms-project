
import React, {useRef} from "react";
import ReactECharts from "echarts-for-react";


const MACHINE = "SAMC";
const DELAY_COLOR = "#5b3df5";
const EVENT_COLOR = "rgba(91, 61, 245, 0.25)";
const EVENT_BORDER = "#5b3df5";

const EVENTS_DATA = [
  { date: "2025-06-15", duration: 60 },
  { date: "2025-08-12", duration: 80 },
  { date: "2025-10-09", duration: 100 },
  { date: "2025-12-06", duration: 1800 },
  { date: "2026-02-02", duration: 120 },
  { date: "2026-04-01", duration: 260 },
  { date: "2026-05-29", duration: 90 },
];

const TIME_LABELS = [
  "06/15/25 23:06",
  "08/12/25 20:00",
  "10/09/25 16:53",
  "12/06/25 13:46",
  "02/02/26 10:40",
  "04/01/26 07:33",
  "05/29/26 04:26",
];

export function DelayManagerPage() {
  const barChartRef = useRef(null);
  const eventsChartRef = useRef(null);

  const barOption = {
    grid: {
      top: 50,
      bottom: 20,
      left: 120,
      right: 80,
    },
    legend: {
      data: [MACHINE],
      top: 10,
      left: "center",
      itemWidth: 20,
      itemHeight: 12,
      textStyle: { fontSize: 12, color: "#333" },
      icon: "rect",
    },
    xAxis: {
      type: "value",
      show: false,
    },
    yAxis: {
      type: "category",
      data: ["Set Up", "Planned Stoppage", "Delays"],
      axisLine: { show: true },
      axisTick: { show: true },
      axisLabel: {
        fontSize: 11,
        color: "#555",
        align: "right",
      },
    },
    series: [
      {
        name: MACHINE,
        type: "bar",
        data: [0, 0, 17330],
        barWidth: 18,
        itemStyle: {
          color: DELAY_COLOR,
          borderRadius: 2,
        },
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
    grid: {
      top: 20,
      bottom: 60,
      left: 60,
      right: 30,
    },
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
      data: TIME_LABELS,
      axisLabel: {
        fontSize: 10,
        color: "#666",
        rotate: 0,
      },
      axisLine: { lineStyle: { color: "#ccc" } },
      axisTick: { show: true, lineStyle: { color: "#ccc" } },
      splitLine: { show: true, lineStyle: { color: "#e8ecf2", type: "solid" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      axisLabel: {
        show: false,
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        name: MACHINE,
        type: "bar",
        data: EVENTS_DATA.map((e) => e.duration),
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
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0];
        return `${p.name}<br/>Duration: ${p.value} min`;
      },
    },
  };
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
    

      {/* TOP CARD */}
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

      {/* EVENTS CARD */}
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          padding: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          border: "1px solid #e6e9ef",
        }}
      >
        {/* Title Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Events Timeline
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

        {/* Chart */}
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
