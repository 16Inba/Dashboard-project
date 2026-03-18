import Order from "../models/Order.js";
import DashboardConfig from "../models/DashboardConfig.js";

function parseFilter(filter = "All Time") {
  const now = new Date();
  let from = new Date(0);
  if (filter === "Today") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (filter === "Last 7 Days") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else if (filter === "Last 30 Days") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
  } else if (filter === "Last 90 Days") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
  }
  return from;
}

export async function getDashboardData(req, res) {
  try {
    const filter = req.query.filter || "All Time";
    const from = parseFilter(filter);
    const match = from ? { createdAt: { $gte: from } } : {};

    const orders = await Order.find(match).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const completedOrders = orders.filter((o) => o.status === "Completed").length;
    const pendingOrders = orders.filter((o) => o.status === "Pending").length;

    const ordersByProduct = Object.entries(
      orders.reduce((acc, o) => {
        acc[o.product] = (acc[o.product] || 0) + 1;
        return acc;
      }, {})
    ).map(([label, value]) => ({ label, value }));

    const ordersByStatus = Object.entries(
      orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([label, value]) => ({ label, value }));

    const ordersOverTime = Object.entries(
      orders.reduce((acc, o) => {
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value }));

    const revenueOverTime = Object.entries(
      orders.reduce((acc, o) => {
        const key = new Date(o.createdAt).toISOString().slice(0, 10);
        acc[key] = (acc[key] || 0) + (o.totalAmount || 0);
        return acc;
      }, {})
    )
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, value]) => ({ label, value }));

    const scatterData = orders
      .filter((o) => typeof o.quantity === "number" && typeof o.unitPrice === "number")
      .map((o) => ({ x: o.quantity, y: o.unitPrice, label: `${o.firstName} ${o.lastName}` }));

    res.json({
      filter,
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      ordersByProduct,
      ordersByStatus,
      ordersOverTime,
      revenueOverTime,
      scatterData,
      latestOrders: orders.slice(0, 10),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed dashboard data", error: error.message });
  }
}

export async function getDashboardConfig(req, res) {
  try {
    const config = await DashboardConfig.findOne();
    if (!config) return res.json({ widgets: [] });
    res.json(config);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard configuration", error: error.message });
  }
}

export async function saveDashboardConfig(req, res) {
  try {
    const { widgets } = req.body;
    if (!Array.isArray(widgets)) {
      return res.status(400).json({ message: "widgets array is required" });
    }
    const existing = await DashboardConfig.findOne();
    if (existing) {
      existing.widgets = widgets;
      await existing.save();
      return res.json(existing);
    }
    const created = await DashboardConfig.create({ widgets });
    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save dashboard configuration", error: error.message });
  }
}
