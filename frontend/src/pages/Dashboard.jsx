import { useEffect, useState } from "react";
import { Bar, Line, Pie, Scatter } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Link } from "react-router-dom";
import { getDashboardConfig, getDashboardData } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend, ArcElement);

const rangeOptions = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"];

function Dashboard() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("All Time");
  const [config, setConfig] = useState({ widgets: [] });
  const [error, setError] = useState("");

  const load = async (f = "All Time") => {
    try {
      const [dashboardData, dashboardConfig] = await Promise.all([getDashboardData(f), getDashboardConfig()]);
      setData(dashboardData);
      setConfig(dashboardConfig);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load dashboard");
    }
  };

  useEffect(() => { load("All Time"); }, []);
  useEffect(() => { load(filter); }, [filter]);

  const renderWidget = (widget) => {
    if (!data) return null;
    const title = widget.title || "Untitled";
    if (widget.type === "KPI") {
      return <div className="widget-card"><h3>{title}</h3><p>{widget.settings?.aggregation || "Sum"} {widget.settings?.dataMetric || "Total Amount"}</p></div>;
    }
    if (widget.type === "Data Table") {
      return <div className="widget-card"><h3>{title}</h3><div className="table-wrap"><table className="orders-table"><thead><tr><th>Customer</th><th>Product</th><th>Total</th></tr></thead><tbody>{data.latestOrders.slice(0, widget.settings?.pagination || 5).map((o) => <tr key={o._id}><td>{o.firstName} {o.lastName}</td><td>{o.product}</td><td>${Number(o.totalAmount).toFixed(2)}</td></tr>)}</tbody></table></div></div>;
    }
    if (widget.type.includes("Bar")) {
      return <div className="widget-card"><h3>{title}</h3><Bar data={{ labels: data.ordersByProduct.map((d) => d.label), datasets: [{ label: "Orders", data: data.ordersByProduct.map((d) => d.value), backgroundColor: widget.settings?.chartColor || "#2f80ed" }] }} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>;
    }
    if (widget.type.includes("Line") || widget.type.includes("Area")) {
      return <div className="widget-card"><h3>{title}</h3><Line data={{ labels: data.ordersOverTime.map((d) => d.label), datasets: [{ label: "Orders", data: data.ordersOverTime.map((d) => d.value), borderColor: widget.settings?.chartColor || "#2f80ed", backgroundColor: "rgba(47,128,237,0.15)", fill: true }] }} options={{ responsive: true }} /></div>;
    }
    if (widget.type.includes("Pie")) {
      return <div className="widget-card"><h3>{title}</h3><Pie data={{ labels: data.ordersByStatus.map((d) => d.label), datasets: [{ data: data.ordersByStatus.map((d) => d.value), backgroundColor: ["#54bd95", "#f7b500", "#f45b69"] }] }} options={{ responsive: true }} /></div>;
    }
    if (widget.type.includes("Scatter")) {
      return <div className="widget-card"><h3>{title}</h3><Scatter data={{ datasets: [{ label: "Quantity vs Price", data: data.scatterData.map((s) => ({ x: s.x, y: s.y })), backgroundColor: widget.settings?.chartColor || "#f59e0b" }] }} options={{ scales: { x: { title: { display: true, text: "Quantity" } }, y: { title: { display: true, text: "Unit Price" } } } }} /></div>;
    }
    return <div className="widget-card"><h3>{title}</h3><p>Widget type: {widget.type}</p></div>;
  };

  if (!data) return <div className="page-container"><h2>Loading dashboard...</h2></div>;

  return (
    <div className="page-container">
      <div className="page-top">
        <div><h1>📊 Dashboard</h1><p className="subtitle">Live dashboard from orders.</p></div>
        <div className="action-row"><select value={filter} onChange={(e) => setFilter(e.target.value)}>{rangeOptions.map((r) => <option key={r}>{r}</option>)}</select><Link className="primary-btn" to="/dashboard-config">Configure Dashboard</Link></div>
      </div>
      {error && <div className="error-bar">{error}</div>}
      <div className="stats-row"><div className="stat-card green"><strong>{data.totalOrders}</strong><span>Total Orders</span></div><div className="stat-card blue"><strong>${Number(data.totalRevenue).toFixed(2)}</strong><span>Total Revenue</span></div><div className="stat-card purple"><strong>{data.completedOrders}</strong><span>Completed</span></div><div className="stat-card orange"><strong>{data.pendingOrders}</strong><span>Pending</span></div></div>
      <div className="dashboard-grid">
        {config.widgets?.length ? config.widgets.map((widget) => <div key={widget.i}>{renderWidget(widget)}</div>) : <div className="widget-card"><h3>No widgets configured yet</h3><p>Use Configure Dashboard to add widgets.</p></div>}
      </div>
    </div>
  );
}

export default Dashboard;
