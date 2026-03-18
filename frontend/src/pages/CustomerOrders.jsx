import { useEffect, useMemo, useState } from "react";
import { createOrder, deleteOrder, getOrders, updateOrder } from "../services/api";

const countries = ["United States", "Canada", "Australia", "Singapore", "Hong Kong"];
const products = ["Fiber Internet 300 Mbps", "5GUnlimited Mobile Plan", "Fiber Internet 1 Gbps", "Business Internet 500 Mbps", "VoIP Corporate Package"];
const statuses = ["Pending", "In progress", "Completed"];
const creators = ["Mr. Michael Harris", "Mr. Ryan Cooper", "Ms. Olivia Carter", "Mr. Lucas Martin"];

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  streetAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
  product: "Fiber Internet 300 Mbps",
  quantity: 1,
  unitPrice: 149.0,
  totalAmount: 149.0,
  status: "Pending",
  createdBy: "Mr. Michael Harris",
};

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const validate = () => {
    const mandatory = [
      "firstName", "lastName", "email", "phone", "streetAddress", "city", "state", "postalCode", "country",
    ];
    for (const field of mandatory) {
      if (!form[field]) return false;
    }
    return true;
  };

  const handleChange = (key, value) => {
    const next = { ...form, [key]: value };
    if (key === "quantity" || key === "unitPrice") {
      next.totalAmount = Number(next.quantity) * Number(next.unitPrice);
    }
    setForm(next);
  };

  const openCreate = () => {
    setError("");
    setForm(initialForm);
    setEditingId(null);
    setIsOpen(true);
  };

  const openEdit = (order) => {
    setError("");
    setForm({
      ...order,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      totalAmount: order.totalAmount,
    });
    setEditingId(order._id);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setError("Please fill the field");
      return;
    }
    try {
      if (editingId) {
        await updateOrder(editingId, form);
      } else {
        await createOrder(form);
      }
      setIsOpen(false);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save order");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await deleteOrder(id);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to delete order");
    }
  };

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0), [orders]);

  return (
    <div className="page-container">
      <div className="page-top">
        <div>
          <h1>📦 Customer Orders</h1>
          <p className="subtitle">Manage customer orders with quick edit and contextual actions.</p>
        </div>
        <div>
          <button className="primary-btn" onClick={openCreate}>+ Create Order</button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card green"><strong>{orders.length}</strong><span>Total Orders</span></div>
        <div className="stat-card blue"><strong>${totalRevenue.toFixed(2)}</strong><span>Total Revenue</span></div>
        <div className="stat-card purple"><strong>{orders.filter((o) => o.status === "Completed").length}</strong><span>Completed</span></div>
        <div className="stat-card orange"><strong>{orders.filter((o) => o.status === "Pending").length}</strong><span>Pending</span></div>
      </div>

      {error && <div className="error-bar">⚠️ {error}</div>}
      {loading ? <div className="loading">Loading orders...</div> : (
      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Customer</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th><th>Status</th><th>Created By</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.firstName} {order.lastName}<br /><small>{order.email}</small></td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>${Number(order.unitPrice).toFixed(2)}</td>
                <td>${Number(order.totalAmount).toFixed(2)}</td>
                <td><span className={`pill ${order.status === "Completed" ? "completed" : order.status === "In progress" ? "progress" : "pending"}`}>{order.status}</span></td>
                <td>{order.createdBy}</td>
                <td>
                  <button className="ghost" onClick={() => openEdit(order)}>Edit</button>
                  <button className="ghost danger" onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)}

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Edit Order" : "Create Order"}</h3>
              <button className="close" onClick={() => { setIsOpen(false); setEditingId(null); }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="input-group"><label>First Name*</label><input value={form.firstName} onChange={(e) => handleChange("firstName", e.target.value)} /></div>
              <div className="input-group"><label>Last Name*</label><input value={form.lastName} onChange={(e) => handleChange("lastName", e.target.value)} /></div>
              <div className="input-group"><label>Email*</label><input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} /></div>
              <div className="input-group"><label>Phone*</label><input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} /></div>
              <div className="input-group full"><label>Street Address*</label><input value={form.streetAddress} onChange={(e) => handleChange("streetAddress", e.target.value)} /></div>
              <div className="input-group"><label>City*</label><input value={form.city} onChange={(e) => handleChange("city", e.target.value)} /></div>
              <div className="input-group"><label>State / Province*</label><input value={form.state} onChange={(e) => handleChange("state", e.target.value)} /></div>
              <div className="input-group"><label>Postal Code*</label><input value={form.postalCode} onChange={(e) => handleChange("postalCode", e.target.value)} /></div>
              <div className="input-group"><label>Country*</label><select value={form.country} onChange={(e) => handleChange("country", e.target.value)}>{countries.map((c)=><option key={c}>{c}</option>)}</select></div>
              <div className="input-group"><label>Choose Product*</label><select value={form.product} onChange={(e) => handleChange("product", e.target.value)}>{products.map((p)=><option key={p}>{p}</option>)}</select></div>
              <div className="input-group"><label>Quantity*</label><input type="number" min="1" value={form.quantity} onChange={(e) => handleChange("quantity", Math.max(1, Number(e.target.value || 1)))} /></div>
              <div className="input-group"><label>Unit Price*</label><div className="prefix-field"><span>$</span><input type="number" min="0" step="0.01" value={form.unitPrice} onChange={(e) => handleChange("unitPrice", Number(e.target.value || 0))} /></div></div>
              <div className="input-group"><label>Total Amount</label><input readOnly value={`$${Number(form.totalAmount || 0).toFixed(2)}`} /></div>
              <div className="input-group"><label>Status*</label><select value={form.status} onChange={(e) => handleChange("status", e.target.value)}>{statuses.map((s)=><option key={s}>{s}</option>)}</select></div>
              <div className="input-group"><label>Created By*</label><select value={form.createdBy} onChange={(e) => handleChange("createdBy", e.target.value)}>{creators.map((c)=><option key={c}>{c}</option>)}</select></div>
              <div className="form-actions full"><button type="submit" className="primary-btn">Save Order</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;
