import { useEffect, useMemo, useState } from "react";
import { Responsive } from "react-grid-layout";
import { Link } from "react-router-dom";
import { getDashboardConfig, saveDashboardConfig } from "../services/api";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = Responsive;

const availableWidgets = [
  { type: "Bar Chart", defaultWidth: 5, defaultHeight: 4 },
  { type: "Line Chart", defaultWidth: 5, defaultHeight: 4 },
  { type: "Area Chart", defaultWidth: 5, defaultHeight: 4 },
  { type: "Pie Chart", defaultWidth: 4, defaultHeight: 4 },
  { type: "Scatter Plot", defaultWidth: 5, defaultHeight: 4 },
  { type: "Data Table", defaultWidth: 4, defaultHeight: 4 },
  { type: "KPI", defaultWidth: 2, defaultHeight: 2 },
];

const metrics = ["Customer ID", "Customer Name", "Email ID", "Address", "Order ID", "Product", "Created by", "Status", "Total Amount", "Unit Price", "Quantity"];

function DashboardConfig() {
  const [widgets, setWidgets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState("");

  const load = async () => {
    try {
      const data = await getDashboardConfig();
      const normalized = (data.widgets || []).map((widget, index) => ({
        ...widget,
        i: widget.i || `${widget.type}-${index}-${Math.random().toString(36).slice(2)}`,
        w: widget.w || 4,
        h: widget.h || 3,
        x: widget.x || 0,
        y: widget.y || Infinity,
      }));
      setWidgets(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const addWidget = (type, defaults) => {
    const id = `${type}-${Date.now()}`;
    const next = {
      i: id,
      type,
      title: type === "KPI" ? "Untitled KPI" : `Untitled ${type}`,
      description: "",
      w: defaults.defaultWidth || 4,
      h: defaults.defaultHeight || 4,
      x: 0,
      y: Infinity,
      settings: {
        xAxis: "Product",
        yAxis: "Total Amount",
        chartColor: "#2f80ed",
        showLabels: true,
        legend: true,
        columns: ["Customer Name", "Product", "Total Amount", "Status"],
        sort: "Descending",
        pagination: 5,
        filter: false,
        fontSize: 14,
        headerBg: "#54bd95",
        dataMetric: "Total Amount",
        aggregation: "Sum",
        dataFormat: "Number",
        decimals: 0,
      },
    };
    setWidgets((prev) => [...prev, next]);
    setSelectedId(id);
  };

  const onLayoutChange = (current) => {
    setWidgets((prev) => prev.map((w) => {
      const item = current.find((x) => x.i === w.i);
      if (!item) return w;
      return { ...w, x: item.x, y: item.y, w: item.w, h: item.h };
    }));
  };

  const selectedWidget = useMemo(() => widgets.find((w) => w.i === selectedId) || widgets[0], [widgets, selectedId]);

  const updateWidget = (id, callback) => {
    setWidgets((prev) => prev.map((w) => (w.i === id ? callback(w) : w)));
  };

  const updateSelected = (key, value) => {
    if (!selectedWidget) return;
    updateWidget(selectedWidget.i, (w) => ({ ...w, [key]: value }));
  };

  const updateSetting = (key, value) => {
    if (!selectedWidget) return;
    updateWidget(selectedWidget.i, (w) => ({ ...w, settings: { ...w.settings, [key]: value } }));
  };

  const removeWidget = (id) => {
    setWidgets((prev) => {
      const updated = prev.filter((w) => w.i !== id);
      if (selectedId === id) {
        setSelectedId(updated.length ? updated[0].i : null);
      }
      return updated;
    });
  };

  const save = async () => {
    try {
      const payload = widgets.map((w) => ({ ...w, x: w.x ?? 0, y: w.y ?? 0, w: w.w ?? 4, h: w.h ?? 3 }));
      await saveDashboardConfig(payload);
      setStatus("Dashboard layout saved successfully.");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Unable to save configuration. Check console for details.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-top">
        <div>
          <h1>⚙️ Dashboard Configuration</h1>
          <p className="subtitle">Drag widgets, open settings, and configure each widget in the side panel.</p>
        </div>
        <div className="action-row">
          <Link className="ghost-btn" to="/dashboard">Back to Dashboard</Link>
          <button className="ghost-btn" onClick={() => selectedWidget && removeWidget(selectedWidget.i)}>Delete Selected</button>
          <button className="primary-btn" onClick={save}>Save Configuration</button>
        </div>
      </div>

      <div className="builder-row">
        <div className="builder-left">
          <div className="widget-palette">
            <h3>Available Widgets</h3>
            <div className="palette-grid">
              {availableWidgets.map((w) => (
                <button key={w.type} className="chip" onClick={() => addWidget(w.type, w)}>{w.type}</button>
              ))}
            </div>
          </div>

          <div className="canvas-panel">
            <h3>Drag & Resize Canvas</h3>
            <ResponsiveGridLayout
              className="layout"
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
              cols={{ lg: 12, md: 8, sm: 6, xs: 4 }}
              rowHeight={80}
              onLayoutChange={(layout) => onLayoutChange(layout)}
              layout={widgets.map((widget) => ({ i: widget.i, x: widget.x || 0, y: widget.y || Infinity, w: widget.w || 4, h: widget.h || 3 }))}
            >
              {widgets.map((widget) => (
                <div key={widget.i} data-grid={{ x: widget.x, y: widget.y, w: widget.w, h: widget.h, minW: 1, minH: 1 }} className={selectedId === widget.i ? "widget-box selected" : "widget-box"} onClick={() => setSelectedId(widget.i)}>
                  <div className="widget-card-head"><strong>{widget.title || "Untitled"}</strong><span>{widget.type}</span></div>
                  <div className="widget-preview">{widget.type}</div>
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        </div>

        <div className="builder-right">
          <h3>Widget Settings</h3>
          {selectedWidget ? (
            <div className="settings-panel">
              <div className="input-group"><label>Widget Title*</label><input value={selectedWidget.title} onChange={(e) => updateSelected("title", e.target.value)} /></div>
              <div className="input-group"><label>Widget Type</label><input readOnly value={selectedWidget.type} /></div>
              <div className="input-group"><label>Description</label><textarea value={selectedWidget.description || ""} onChange={(e) => updateSelected("description", e.target.value)} rows={3} /></div>
              <div className="input-group"><label>Width (Columns)</label><input type="number" min="1" value={selectedWidget.w} onChange={(e) => updateSelected("w", Math.max(1, Number(e.target.value)))} /></div>
              <div className="input-group"><label>Height (Rows)</label><input type="number" min="1" value={selectedWidget.h} onChange={(e) => updateSelected("h", Math.max(1, Number(e.target.value)))} /></div>
              {selectedWidget.type === "KPI" && (
                <>
                  <div className="input-group"><label>Select Metric</label><select value={selectedWidget.settings?.dataMetric} onChange={(e) => updateSetting("dataMetric", e.target.value)}>{metrics.map((m) => <option key={m}>{m}</option>)}</select></div>
                  <div className="input-group"><label>Aggregation</label><select value={selectedWidget.settings?.aggregation} onChange={(e) => updateSetting("aggregation", e.target.value)}><option>Sum</option><option>Average</option><option>Count</option></select></div>
                  <div className="input-group"><label>Data Format</label><select value={selectedWidget.settings?.dataFormat} onChange={(e) => updateSetting("dataFormat", e.target.value)}><option>Number</option><option>Currency</option></select></div>
                  <div className="input-group"><label>Decimal Precision</label><input type="number" min="0" value={selectedWidget.settings?.decimals} onChange={(e) => updateSetting("decimals", Math.max(0, Number(e.target.value)))} /></div>
                </>
              )}
              {selectedWidget.type.includes("Chart") && (
                <>
                  <div className="input-group"><label>X-Axis Data</label><select value={selectedWidget.settings?.xAxis} onChange={(e) => updateSetting("xAxis", e.target.value)}>{metrics.map((m) => <option key={m}>{m}</option>)}</select></div>
                  <div className="input-group"><label>Y-Axis Data</label><select value={selectedWidget.settings?.yAxis} onChange={(e) => updateSetting("yAxis", e.target.value)}>{metrics.map((m) => <option key={m}>{m}</option>)}</select></div>
                  <div className="input-group"><label>Chart Color</label><input type="color" value={selectedWidget.settings?.chartColor || "#2f80ed"} onChange={(e) => updateSetting("chartColor", e.target.value)} /></div>
                  <div className="input-group"><label>Show Data Labels</label><input type="checkbox" checked={selectedWidget.settings?.showLabels} onChange={(e) => updateSetting("showLabels", e.target.checked)} /></div>
                </>
              )}
              {(selectedWidget.type === "Data Table") && (
                <>
                  <div className="input-group"><label>Columns (comma-separated)</label><input value={(selectedWidget.settings?.columns || []).join(", ")} onChange={(e) => updateSetting("columns", e.target.value.split(",").map((x) => x.trim()))} /></div>
                  <div className="input-group"><label>Sort By</label><select value={selectedWidget.settings?.sort} onChange={(e) => updateSetting("sort", e.target.value)}><option>Ascending</option><option>Descending</option><option>Order Date</option></select></div>
                  <div className="input-group"><label>Pagination</label><select value={selectedWidget.settings?.pagination} onChange={(e) => updateSetting("pagination", Number(e.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={15}>15</option></select></div>
                  <div className="input-group"><label>Font Size</label><input type="number" min="12" max="18" value={selectedWidget.settings?.fontSize} onChange={(e) => updateSetting("fontSize", Number(e.target.value))} /></div>
                  <div className="input-group"><label>Header Background</label><input type="color" value={selectedWidget.settings?.headerBg || "#54bd95"} onChange={(e) => updateSetting("headerBg", e.target.value)} /></div>
                </>
              )}
              <button className="primary-btn" onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedWidget, null, 2))}>Copy Settings</button>
              <button className="ghost-btn" style={{ marginTop: 8 }} onClick={() => removeWidget(selectedWidget.i)}>Delete Widget</button>
            </div>
          ) : <div className="empty">Select a widget to configure.</div>}
        </div>
      </div>
      {status && <div className="success-bar">✅ {status}</div>}
    </div>
  );
}

export default DashboardConfig;
