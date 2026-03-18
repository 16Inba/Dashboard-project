import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
});

export async function getOrders() {
  const response = await api.get("/orders");
  return response.data;
}

export async function createOrder(order) {
  const response = await api.post("/orders", order);
  return response.data;
}

export async function updateOrder(id, order) {
  const response = await api.put(`/orders/${id}`, order);
  return response.data;
}

export async function deleteOrder(id) {
  const response = await api.delete(`/orders/${id}`);
  return response.data;
}

export async function getDashboardData(filter = "All Time") {
  const response = await api.get(`/api/dashboard-data?filter=${encodeURIComponent(filter)}`);
  return response.data;
}

export async function getDashboardConfig() {
  const response = await api.get("/api/dashboard-config");
  return response.data;
}

export async function saveDashboardConfig(widgets) {
  const response = await api.post("/api/dashboard-config", { widgets });
  return response.data;
}
